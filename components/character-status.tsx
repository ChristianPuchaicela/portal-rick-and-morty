import { characterStatuses } from "@/lib/character-labels";
import type { Character } from "@/lib/characters";

type CharacterStatusProps = {
  status: Character["status"];
  badge?: boolean;
};

export function CharacterStatus({ status, badge = false }: CharacterStatusProps) {
  const { icon, text } = characterStatuses[status];

  return (
    <span className={badge ? "status-badge" : "vital-status"} data-status={status}>
      <span aria-hidden="true">{icon}</span> {text}
    </span>
  );
}
