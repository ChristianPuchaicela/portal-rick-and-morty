"use client";

import { useState } from "react";
import type { SummaryResult } from "@/lib/character-summary";

export function CharacterSummaryPanel({ id }: { id: number }) {
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function requestSummary() {
    if (pending) return;
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setSummary(await response.json() as SummaryResult);
      } else {
        const body: unknown = await response.json();
        setError(
          typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
            ? body.error
            : "No pudimos preparar el resumen. Intenta nuevamente.",
        );
      }
    } catch {
      setError("No pudimos conectar con el servidor. Intenta nuevamente.");
    } finally {
      setPending(false);
    }
  }

  const source = summary?.source === "gemini" ? "Generado por IA" : "Simulado";

  return (
    <section className="summary-panel tool-panel" aria-labelledby="summary-title">
      <div className="summary-toolbar">
        <h2 id="summary-title" className="search-title">Resumen del personaje</h2>
        <button type="button" className="search-submit" onClick={requestSummary} aria-disabled={pending}>
          {summary ? "Regenerar resumen" : "Generar resumen con IA"}
        </button>
      </div>
      <p
        role="status"
        aria-atomic="true"
        className={error ? "summary-feedback text-destructive" : pending ? "summary-feedback text-muted-foreground" : "sr-only"}
      >
        {error || (pending ? "Preparando el resumen…" : summary ? `Resumen disponible. ${source}.` : "")}
      </p>

      {summary && (
        <div className="summary-result">
          <p className="summary-source" data-source={summary.source}>{source}</p>
          {summary.notice && <p className="text-sm text-muted-foreground">{summary.notice}</p>}
          <p className="hero-description summary-text">{summary.text}</p>
          <h3 className="mt-5 font-semibold">Datos usados</h3>
          <dl className="detail-facts mt-2">
            {summary.facts.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
