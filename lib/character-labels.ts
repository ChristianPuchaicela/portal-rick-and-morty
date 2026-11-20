import type { Character } from "@/lib/characters";

export const characterStatuses = {
  Alive: { text: "Vivo", icon: "●" },
  Dead: { text: "Fallecido", icon: "✕" },
  unknown: { text: "Desconocido", icon: "?" },
} satisfies Record<Character["status"], { text: string; icon: string }>;

export const characterGenders = {
  Female: "Femenino",
  Male: "Masculino",
  Genderless: "Sin género",
  unknown: "Desconocido",
} satisfies Record<Character["gender"], string>;
