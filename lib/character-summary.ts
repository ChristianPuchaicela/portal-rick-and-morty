import { characterStatuses } from "@/lib/character-labels";
import type { Character } from "@/lib/characters";

export type SummaryFact = { label: string; value: string };

export type SummaryResult = {
  source: "gemini" | "simulated";
  text: string;
  facts: SummaryFact[];
  notice?: string;
};

function displayData(value: string) {
  const cleaned = value.trim();
  return cleaned.toLowerCase() === "unknown" ? "Desconocido" : cleaned || "Sin especificar";
}

export function prepareSummary(character: Character) {
  const name = character.name;
  const species = displayData(character.species);
  const status = characterStatuses[character.status].text;
  const origin = displayData(character.origin.name);
  const location = displayData(character.location.name);
  const count = character.episode.length;
  const appearances = `${count} ${count === 1 ? "episodio" : "episodios"}`;
  const facts = [
    { label: "Nombre", value: name },
    { label: "Especie", value: species },
    { label: "Estado", value: status },
    { label: "Origen", value: origin },
    { label: "Última ubicación", value: location },
    { label: "Apariciones", value: String(count) },
  ];

  const lines = {
    introduction: [
      `En el archivo del multiverso, ${name} figura con la especie «${species}» y el estado «${status}».`,
      `La ficha interdimensional de ${name} registra la especie «${species}» y el estado «${status}».`,
      `El catálogo del multiverso identifica a ${name}: especie «${species}», estado «${status}».`,
    ],
    places: [
      `Su origen figura como «${origin}» y su última ubicación como «${location}».`,
      `Sus coordenadas en la ficha registran «${origin}» como origen y «${location}» como última ubicación.`,
    ],
    episodes: [
      `La API registra su aparición en ${appearances}.`,
      `El recuento de apariciones en la API es de ${appearances}.`,
    ],
  };

  return { name, facts, lines };
}

export type PreparedSummary = ReturnType<typeof prepareSummary>;

export function summaryFromSelection(prepared: PreparedSummary, selection: unknown) {
  if (
    typeof selection !== "object" ||
    selection === null ||
    Object.keys(selection).length !== 3 ||
    !("introduction" in selection) ||
    !("places" in selection) ||
    !("episodes" in selection)
  ) return null;

  const { introduction, places, episodes } = selection;
  if (
    typeof introduction !== "string" || !prepared.lines.introduction.includes(introduction) ||
    typeof places !== "string" || !prepared.lines.places.includes(places) ||
    typeof episodes !== "string" || !prepared.lines.episodes.includes(episodes)
  ) return null;

  const text = [introduction, places, episodes].join(" ");
  return text.includes(prepared.name) ? text : null;
}

export function simulatedSummary(prepared: PreparedSummary, notice: string): SummaryResult {
  return {
    source: "simulated",
    facts: prepared.facts,
    text: [prepared.lines.introduction[0], prepared.lines.places[0], prepared.lines.episodes[0]].join(" "),
    notice,
  };
}
