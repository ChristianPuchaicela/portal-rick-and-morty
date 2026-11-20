"use client";

import { useState } from "react";
import { SparkIcon } from "@/components/detail-icons";
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

  const source = summary?.source === "gemini" ? "IA · Gemini" : "Simulado";
  const message = error || (pending ? "Preparando el resumen…" : summary ? `Resumen disponible. ${source}.` : "");

  return (
    <section aria-labelledby="summary-title">
      <header className="insight-header">
        <div className="section-heading">
          <span className="section-index" aria-hidden="true">02</span>
          <div>
            <p className="eyebrow">Lectura generada · contrastada</p>
            <h2 id="summary-title" className="search-title">Resumen del multiverso</h2>
          </div>
        </div>
        <button type="button" className="insight-action" onClick={requestSummary} aria-disabled={pending}>
          <SparkIcon />
          {summary ? "Regenerar resumen" : "Generar resumen con IA"}
        </button>
      </header>

      <p
        role="status"
        aria-atomic="true"
        className={error ? "insight-status" : "sr-only"}
        data-tone={error ? "error" : undefined}
      >
        {message}
      </p>

      {(pending || summary) && (
        <div className="insight-panel">
          {pending && (
            <div className="insight-skeleton" aria-hidden="true">
              <span /><span /><span />
            </div>
          )}

          {summary && (
            <div className="insight-result">

              <ol className="insight-lines" role="list" aria-label="Resumen en tres oraciones">
                {summary.sentences.map((sentence, index) => (
                  <li key={sentence}>
                    <span className="insight-line-index" aria-hidden="true">0{index + 1}</span>
                    <p>{sentence}</p>
                  </li>
                ))}
              </ol>

              {summary.notice && (
                <p className="insight-notice">{summary.notice} Se muestra el texto de respaldo construido con la ficha.</p>
              )}

              <div className="insight-facts">
                <h3>Datos usados</h3>
                <ul className="fact-chips">
                  {summary.facts.map(({ label, value }) => (
                    <li key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
