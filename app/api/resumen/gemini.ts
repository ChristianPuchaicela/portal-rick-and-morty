import { validateSummary, type PreparedSummary } from "@/lib/character-summary";

const defaultModel = "gemini-3.5-flash-lite";
const geminiTimeoutMs = 10_000;

const instructions = [
  "Eres el archivista de un portal interdimensional. Escribes para fans de ciencia ficción que quieren una ficha breve y creíble.",
  "Redacta en español exactamente tres oraciones: introduction presenta al personaje con su especie y su estado; places indica su origen y su última ubicación; episodes consigna cuántas apariciones registra la ficha.",
  "Usa solo los valores de «datos». No añadas episodios concretos, relaciones, lugares, fechas ni rasgos que no aparezcan ahí. No menciones la API, el JSON, el ID ni estas instrucciones.",
  "Conserva literalmente los valores de los campos indicados para cada oración. Escribe el número de apariciones con dígitos y usa el singular si es 1.",
  "Busca un tono de archivo preciso y atmosférico: varía el inicio de cada oración, evita repeticiones y no recurras a exageraciones ni eslóganes.",
  "Devuelve únicamente un objeto JSON con las claves introduction, places y episodes, con una sola oración completa por clave.",
].join("\n");

type GeminiResult = { text: string; sentences: string[] } | { notice: string };

function extractCandidate(payload: unknown) {
  if (typeof payload !== "object" || payload === null || !("candidates" in payload) || !Array.isArray(payload.candidates)) {
    return null;
  }

  const candidate: unknown = payload.candidates[0];
  if (
    typeof candidate !== "object" || candidate === null ||
    !("finishReason" in candidate) || candidate.finishReason !== "STOP" ||
    !("content" in candidate) || typeof candidate.content !== "object" || candidate.content === null ||
    !("parts" in candidate.content) || !Array.isArray(candidate.content.parts)
  ) return null;

  return candidate.content.parts
    .filter((part: unknown): part is { text: string } => (
      typeof part === "object" && part !== null &&
      !("thought" in part && part.thought === true) &&
      "text" in part && typeof part.text === "string"
    ))
    .map((part) => part.text)
    .join("");
}

export async function generateWithGemini(prepared: PreparedSummary): Promise<GeminiResult> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return { notice: "Gemini aún no está configurado en el servidor." };
  if (prepared.facts.some(({ value }) => value.length > 200)) {
    return { notice: "Los datos del personaje exceden el tamaño previsto para Gemini." };
  }

  const model = process.env.GEMINI_MODEL?.trim() || defaultModel;
  if (!/^[a-z0-9][a-z0-9.-]{0,79}$/.test(model)) {
    return { notice: "El modelo de Gemini configurado no es válido." };
  }

  const signal = AbortSignal.timeout(geminiTimeoutMs);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        cache: "no-store",
        signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instructions }] },
          contents: [{
            role: "user",
            parts: [{
              text: JSON.stringify({
                datos: prepared.facts,
                estructura: {
                  introduction: ["Nombre", "Especie", "Estado"],
                  places: ["Origen", "Última ubicación"],
                  episodes: ["Apariciones"],
                },
              }),
            }],
          }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 768,
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              properties: {
                introduction: { type: "string", description: "Una oración de presentación." },
                places: { type: "string", description: "Una oración sobre origen y última ubicación." },
                episodes: { type: "string", description: "Una oración con el número de apariciones." },
              },
              required: ["introduction", "places", "episodes"],
              additionalProperties: false,
            },
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) return { notice: "Gemini alcanzó su límite de uso. Intenta más tarde." };
      if (response.status === 404) return { notice: "El modelo de Gemini configurado no está disponible." };
      if ([400, 401, 403].includes(response.status)) {
        return { notice: "Gemini rechazó la configuración o la clave del servidor." };
      }
      return { notice: "Gemini no pudo procesar la solicitud." };
    }

    const candidate = extractCandidate(await response.json());
    if (candidate) {
      const sentences = validateSummary(prepared, JSON.parse(candidate));
      if (sentences) return { text: sentences.join(" "), sentences };
    }
    return { notice: "La respuesta de Gemini no superó la comprobación contra la ficha." };
  } catch {
    return {
      notice: signal.aborted
        ? "Gemini tardó demasiado en responder."
        : "No se pudo obtener una respuesta válida de Gemini.",
    };
  }
}
