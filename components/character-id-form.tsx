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
  const feedbackId = `${inputId}-feedback`;
  const busy = pending || navigating;
  const submitLabel = onConsult ? "Consultar personaje" : "Buscar personaje";

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
      <div className={onConsult ? "search-controls flex-wrap gap-2" : "search-controls"}>
        <input
          ref={inputRef}
          id={inputId}
          name="id"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          defaultValue={initialId}
          placeholder="Usa un número, por ejemplo, 1"
          readOnly={busy}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? feedbackId : undefined}
          onChange={() => setError("")}
          className="search-input"
        />
        <button
          type="submit"
          className={onConsult ? "search-submit inline-flex items-center justify-center gap-2" : "search-submit search-submit-icon"}
          aria-label={submitLabel}
          aria-disabled={busy}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          {onConsult && <span>{submitLabel}</span>}
        </button>
      </div>
      <p
        id={feedbackId}
        role="status"
        aria-atomic="true"
        className={error ? "text-sm text-destructive not-empty:mt-2" : "text-sm text-muted-foreground not-empty:mt-2"}
      >
        {error || (navigating ? "Abriendo la ficha…" : "")}
      </p>
    </form>
  );
}
