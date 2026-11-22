const API_BASE = "https://rickandmortyapi.com/api";
const avatarUrl = /^https:\/\/rickandmortyapi\.com\/api\/character\/avatar\/[\w.-]+\.jpeg$/;

export type CharacterSummary = {
  id: number;
  name: string;
  image: string;
};

type CharacterPlace = { name: string; url: string };

export type Character = CharacterSummary & {
  status: "Alive" | "Dead" | "unknown";
  species: string;
  type: string;
  gender: "Female" | "Male" | "Genderless" | "unknown";
  origin: CharacterPlace;
  location: CharacterPlace;
  episode: string[];
  created: string;
};

export type CharacterResponse =
  | { kind: "success"; status: number; character: Character; raw: string }
  | { kind: "http-error"; status: number; raw: string | null }
  | { kind: "invalid-response"; status: number; raw: string | null }
  | { kind: "network-error" | "timeout" };

export const characterNotFoundMessage = "Personaje no encontrado. Intenta con otro ID.";

export function characterErrorMessage(response: Exclude<CharacterResponse, { kind: "success" }>) {
  switch (response.kind) {
    case "http-error":
      return response.status === 404
        ? characterNotFoundMessage
        : `La API devolvió un error HTTP ${response.status}. Intenta nuevamente.`;
    case "invalid-response":
      return "La API devolvió una respuesta inesperada. Intenta nuevamente.";
    case "timeout":
      return "La API tardó demasiado en responder. Intenta nuevamente.";
    case "network-error":
      return "No pudimos conectarnos con la API. Revisa tu conexión e intenta nuevamente.";
  }
}

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

function isPlace(value: unknown): value is CharacterPlace {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string" &&
    "url" in value &&
    typeof value.url === "string" &&
    (value.url === "" || /^https:\/\/rickandmortyapi\.com\/api\/location\/[1-9]\d*$/.test(value.url))
  );
}

function isCharacterDetail(value: unknown, id: number): value is Character {
  return (
    isCharacter(value) &&
    value.id === id &&
    "status" in value &&
    (value.status === "Alive" || value.status === "Dead" || value.status === "unknown") &&
    "species" in value && typeof value.species === "string" &&
    "type" in value && typeof value.type === "string" &&
    "gender" in value &&
    (value.gender === "Female" || value.gender === "Male" || value.gender === "Genderless" || value.gender === "unknown") &&
    "origin" in value && isPlace(value.origin) &&
    "location" in value && isPlace(value.location) &&
    "episode" in value && Array.isArray(value.episode) &&
    value.episode.every((url: unknown) => (
      typeof url === "string" && /^https:\/\/rickandmortyapi\.com\/api\/episode\/[1-9]\d*$/.test(url)
    )) &&
    "created" in value && typeof value.created === "string" &&
    Number.isFinite(Date.parse(value.created))
  );
}

export async function getCharacter(id: number): Promise<CharacterResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(characterApiUrl(id), {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    const raw = await response.text();
    let body: unknown;

    try {
      body = JSON.parse(raw);
    } catch {
      return {
        kind: response.ok ? "invalid-response" : "http-error",
        status: response.status,
        raw: null,
      };
    }

    if (!response.ok) return { kind: "http-error", status: response.status, raw };
    if (!isCharacterDetail(body, id)) return { kind: "invalid-response", status: response.status, raw };
    return { kind: "success", status: response.status, character: body, raw };
  } catch {
    return { kind: controller.signal.aborted ? "timeout" : "network-error" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getCharacterPage(page: number) {
  const response = await fetch(`${API_BASE}/character?page=${page}`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(8_000),
  });

  if (response.status === 404 && page > 1) return null;
  if (response.status === 429) return { kind: "rate-limited" } as const;

  if (!response.ok) {
    throw new Error(`Character catalog returned HTTP ${response.status}`);
  }

  const body: unknown = await response.json();
  if (
    typeof body !== "object" ||
    body === null ||
    !("info" in body) ||
    typeof body.info !== "object" ||
    body.info === null ||
    !("count" in body.info) ||
    typeof body.info.count !== "number" ||
    !Number.isSafeInteger(body.info.count) ||
    body.info.count < 0 ||
    !("pages" in body.info) ||
    typeof body.info.pages !== "number" ||
    !Number.isSafeInteger(body.info.pages) ||
    body.info.pages < 0 ||
    !("results" in body) ||
    !Array.isArray(body.results) ||
    !body.results.every(isCharacter)
  ) {
    throw new Error("Invalid character catalog response");
  }

  return { kind: "success", characters: body.results as CharacterSummary[], total: body.info.count, pages: body.info.pages } as const;
}
