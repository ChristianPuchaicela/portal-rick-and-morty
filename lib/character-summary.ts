import { characterStatuses, displayCharacterValue } from "@/lib/character-labels";
import type { Character } from "@/lib/characters";

type SummaryFact = { label: string; value: string };

export type SummaryResult = {
  source: "gemini" | "simulated";
  sentences: string[];
  facts: SummaryFact[];
  notice?: string;
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[«»"“”'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function prepareSummary(character: Character) {
  const name = character.name;
  const species = displayCharacterValue(character.species);
  const status = characterStatuses[character.status].text;
  const origin = displayCharacterValue(character.origin.name);
  const location = displayCharacterValue(character.location.name);
  const count = character.episode.length;
  const appearances = count === 1 ? "aparición" : "apariciones";
  const facts: SummaryFact[] = [
    { label: "Nombre", value: name },
    { label: "Especie", value: species },
    { label: "Estado", value: status },
    { label: "Origen", value: origin },
    { label: "Última ubicación", value: location },
    { label: "Apariciones", value: String(count) },
  ];

  // Texto de respaldo: se usa tal cual cuando Gemini no está disponible o falla la validación.
  const lines = {
    introduction: `En el archivo del multiverso, ${name} figura como ${species} con estado ${status}.`,
    places: `Su origen se registra como «${origin}» y su última ubicación como «${location}».`,
    episodes: `El registro consigna ${count} ${appearances}.`,
  };

  const vocabulary = [
    ...facts.map(({ value }) => value),
    count === 1 ? "episodio" : "episodios",
    "archivo", "registro", "multiverso", "ficha", "coordenadas", "portal", "interdimensional", "tierra",
    "en", "el", "la", "los", "las", "su", "sus", "un", "una", "de", "del", "al", "y", "con", "como", "por", "para",
    "se", "es", "son", "este", "esta", "estos", "estas", "según", "además", "pero", "sin", "cada", "todo", "toda",
  ].join(" ");

  const allowedNumbers = [...new Set([...vocabulary.matchAll(/\d+/g)].map((match) => match[0]))];

  return {
    name,
    facts,
    lines,
    expected: {
      introduction: [name, species, status],
      places: [origin, location],
      episodes: String(count),
    },
    vocabulary: normalize(vocabulary),
    allowedNumbers,
  };
}

export type PreparedSummary = ReturnType<typeof prepareSummary>;

/**
 * Comprueba campos esperados y patrones que pueden indicar datos no respaldados.
 */
export function validateSummary(prepared: PreparedSummary, candidate: unknown): string[] | null {
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) return null;
  const record = candidate as Record<string, unknown>;
  const slots = ["introduction", "places", "episodes"] as const;
  if (Object.keys(record).length !== 3 || !slots.every((slot) => typeof record[slot] === "string")) return null;

  const sentences = slots.map((slot) => (record[slot] as string).replace(/\s+/g, " ").trim());
  if (sentences.some((sentence) => !sentence || sentence.length > 240)) return null;
  if (sentences.some((sentence) => {
    if (!/[.!?]$/.test(sentence)) return true;
    const content = prepared.facts.reduce(
      (remaining, { value }) => remaining.replaceAll(normalize(value), ""),
      normalize(sentence.slice(0, -1)),
    );
    return /[.!?]/.test(content);
  })) {
    return null;
  }

  const text = sentences.join(" ");
  if (text.length > 600) return null;
  const normalized = sentences.map(normalize);

  for (const [index, values] of [prepared.expected.introduction, prepared.expected.places].entries()) {
    if (!values.every((value) => normalized[index].includes(normalize(value)))) return null;
  }
  const episodeNumbers = normalized[2].match(/\d+/g);
  if (episodeNumbers?.length !== 1 || episodeNumbers[0] !== prepared.expected.episodes) return null;
  if (!/(?:aparici|episod)/.test(normalized[2]) || /\b(?:no|nunca|jamas)\b/.test(normalized[2])) return null;

  const numbers = [...text.matchAll(/\d+/g)].map((match) => match[0]);
  if (numbers.some((number) => !prepared.allowedNumbers.includes(number))) return null;

  const forbidden = /\b(?:api|json|endpoint|prompt|instrucciones?|gemini|modelo|id|url|http|www|temporada|capitulo|hij[oa]s?|padre|madre|espos[ao]s?|herman[oa]s?|amig[oa]s?|compañer[oa]s?|enemig[oa]s?)\b/i;
  if (forbidden.test(normalized.join(" "))) return null;

  // Cualquier valor entre comillas debe ser literalmente uno de los campos usados.
  const quoted = [...text.matchAll(/[«"“]([^»"”]+)[»"”]/g)].map((match) => normalize(match[1]));
  if (quoted.some((value) => !prepared.facts.some(({ value: fact }) => normalize(fact) === value))) return null;

  // Las palabras con inicial mayúscula deben aparecer en la ficha (o ser conectores habituales).
  for (const sentence of sentences) {
    for (const word of sentence.split(/\s+/).slice(1)) {
      const token = word.replace(/^[«"“(]+/, "").replace(/[.,;:!?»"”)]+$/, "");
      if (/^[A-ZÁÉÍÓÚÑÜ]/.test(token) && !prepared.vocabulary.includes(normalize(token))) return null;
    }
  }

  return sentences;
}

export function simulatedSummary(prepared: PreparedSummary, notice: string): SummaryResult {
  const sentences = [prepared.lines.introduction, prepared.lines.places, prepared.lines.episodes];
  return {
    source: "simulated",
    facts: prepared.facts,
    sentences,
    notice,
  };
}
