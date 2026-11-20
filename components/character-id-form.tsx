"use client";

import { useRef, useState, type FormEvent } from "react";
import { parseCharacterId } from "@/lib/character-id";

type Feedback = { kind: "error" | "success"; message: string };

export function CharacterIdForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const invalid = feedback?.kind === "error";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = String(new FormData(event.currentTarget).get("id") ?? "");
    const id = parseCharacterId(value);

    if (id === null) {
      setFeedback({
        kind: "error",
        message: value.trim()
          ? "Escribe un número entero positivo, como 1."
          : "Escribe el ID del personaje.",
      });
      inputRef.current?.focus();
      return;
    }

    setFeedback({
      kind: "success",
      message: `ID ${id} válido. La consulta se habilitará en una fase posterior.`,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="character-id" className="mb-2 block text-sm font-semibold">
        ID del personaje
      </label>
      <div className="search-controls">
        <input
          ref={inputRef}
          id="character-id"
          name="id"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "character-id-hint character-id-feedback" : "character-id-hint"}
          onChange={() => setFeedback(null)}
          className="search-input"
        />
        <button type="submit" className="search-submit">Validar ID</button>
      </div>
      <p id="character-id-hint" className="mt-2 text-sm text-muted-foreground">
        Escribe un entero positivo. Por ejemplo, 1.
      </p>
      <p
        id="character-id-feedback"
        role="status"
        aria-atomic="true"
        className={invalid ? "mt-2 text-sm text-destructive" : "mt-2 text-sm text-primary"}
      >
        {feedback?.message}
      </p>
    </form>
  );
}
