export function parseCharacterId(value: string): number | null {
  const input = value.trim();
  if (!/^[0-9]+$/.test(input)) return null;

  const id = Number(input);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function characterPath(id: number) {
  return `/personaje/${id}`;
}
