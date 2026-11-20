import { characterStatuses } from "@/lib/character-labels";
import type { Character } from "@/lib/characters";

export function CharacterStatus({ status }: { status: Character["status"] }) {
  const { icon, text } = characterStatuses[status];

  return (
    <span className="vital-status" data-status={status}>
      <span aria-hidden="true">{icon}</span> {text}
    </span>
  );
}
