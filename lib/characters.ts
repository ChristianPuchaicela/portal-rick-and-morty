const API_BASE = "https://rickandmortyapi.com/api";
const avatarUrl = /^https:\/\/rickandmortyapi\.com\/api\/character\/avatar\/[\w.-]+\.jpeg$/;

export type CharacterSummary = {
  id: number;
  name: string;
  image: string;
};

export function characterApiUrl(id: number) {
  return `${API_BASE}/character/${id}`;
}

function isCharacter(value: unknown): value is CharacterSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    "name" in value &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    "image" in value &&
    typeof value.image === "string" &&
    avatarUrl.test(value.image)
  );
}

export async function getFirstCharacterPage(): Promise<CharacterSummary[]> {
  const response = await fetch(`${API_BASE}/character`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Character catalog returned HTTP ${response.status}`);
  }

  const body: unknown = await response.json();
  if (
    typeof body !== "object" ||
    body === null ||
    !("results" in body) ||
    !Array.isArray(body.results) ||
    !body.results.every(isCharacter)
  ) {
    throw new Error("Invalid character catalog response");
  }

  return body.results;
}
