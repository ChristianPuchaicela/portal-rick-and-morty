import { NextResponse } from "next/server";
import { generateWithGemini } from "@/app/api/resumen/gemini";
import { prepareSummary, simulatedSummary, type SummaryResult } from "@/lib/character-summary";
import { characterErrorMessage, getCharacter } from "@/lib/characters";

const maxBodyBytes = 64;

async function readCharacterId(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;

  const bytes = new Uint8Array(maxBodyBytes);
  let length = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (length + chunk.value.byteLength > maxBodyBytes) {
        void reader.cancel().catch(() => {});
        return null;
      }
      bytes.set(chunk.value, length);
      length += chunk.value.byteLength;
    }

    const body: unknown = JSON.parse(new TextDecoder().decode(bytes.subarray(0, length)));
    if (
      typeof body !== "object" || body === null || Object.keys(body).length !== 1 ||
      !("id" in body) || typeof body.id !== "number" || !Number.isSafeInteger(body.id) || body.id <= 0
    ) return null;

    return body.id;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const id = await readCharacterId(request);
  if (id === null) {
    return NextResponse.json({ error: "Envía el ID del personaje como un entero positivo." }, { status: 400 });
  }

  const result = await getCharacter(id);
  if (result.kind !== "success") {
    const status = result.kind === "http-error" && result.status === 404 ? 404 : 502;
    return NextResponse.json({ error: characterErrorMessage(result) }, { status });
  }

  const prepared = prepareSummary(result.character);
  const generated = await generateWithGemini(prepared);
  const summary: SummaryResult = "text" in generated
    ? { source: "gemini", facts: prepared.facts, text: generated.text }
    : simulatedSummary(prepared, generated.notice);

  return NextResponse.json(summary, { headers: { "Cache-Control": "no-store" } });
}
