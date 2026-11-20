"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { characterPath, parseCharacterId } from "@/lib/character-id";

type CharacterIdFormProps = {
  initialId?: number;
  onConsult?: (id: number) => void;
  pending?: boolean;
};

export function CharacterIdForm({ initialId, onConsult, pending = false }: CharacterIdFormProps) {
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const feedbackId = `${inputId}-feedback`;
  const busy = pending || navigating;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const value = String(new FormData(event.currentTarget).get("id") ?? "");
    const id = parseCharacterId(value);

    if (id === null) {
      setError(
        value.trim()
          ? "Escribe un número entero positivo, como 1."
          : "Escribe el ID del personaje.",
      );
      inputRef.current?.focus();
      return;
    }

    setError("");
    if (onConsult) {
      onConsult(id);
    } else {
      startTransition(() => router.push(characterPath(id)));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">
        ID del personaje
      </label>
      <div className="search-controls">
        <input
          ref={inputRef}
          id={inputId}
          name="id"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          defaultValue={initialId}
          readOnly={busy}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${hintId} ${feedbackId}` : hintId}
          onChange={() => setError("")}
          className="search-input"
        />
        <button type="submit" className="search-submit" aria-disabled={busy}>
          {onConsult ? "Consultar personaje" : "Buscar personaje"}
        </button>
      </div>
      <p id={hintId} className="mt-2 text-sm text-muted-foreground">
        Escribe un entero positivo. Por ejemplo, 1.
      </p>
      <p
        id={feedbackId}
        role="status"
        aria-atomic="true"
        className={error ? "mt-2 text-sm text-destructive" : "mt-2 text-sm text-muted-foreground"}
      >
        {error || (navigating ? "Abriendo la ficha…" : "")}
      </p>
    </form>
  );
}
