"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CharacterIdForm } from "@/components/character-id-form";
import { CharacterStatus } from "@/components/character-status";
import { characterPath } from "@/lib/character-id";
import { characterGenders } from "@/lib/character-labels";
import { characterApiUrl, characterErrorMessage, getCharacter, type CharacterResponse } from "@/lib/characters";

export function EndpointTester({ initialId }: { initialId?: number }) {
  const [exchange, setExchange] = useState<{ id: number; response: CharacterResponse | null } | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const response = exchange?.response;
  const pending = exchange !== null && response === null;
  const success = response?.kind === "success";
  const raw = response && "raw" in response ? response.raw : null;
  const status = response && "status" in response ? response.status : null;
  const serverError = response?.kind === "http-error" && response.status >= 500;

  async function consult(id: number) {
    setCopyMessage("");
    setExchange({ id, response: null });
    setExchange({ id, response: await getCharacter(id) });
  }

  async function copyJson() {
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      setCopyMessage("JSON copiado.");
    } catch {
      setCopyMessage("No se pudo copiar. Selecciona el JSON para copiarlo manualmente.");
    }
  }

  return (
    <div className="endpoint-workspace">
      <section aria-labelledby="request-title" className="tool-panel">
        <h2 id="request-title" className="search-title">Solicitud</h2>
        <p className="request-url mt-3 mb-5 text-sm">
          <code><span className="text-primary">GET</span>{" "}{exchange ? characterApiUrl(exchange.id) : "/character/{id}"}</code>
        </p>
        <CharacterIdForm initialId={initialId} onConsult={consult} pending={pending} />
      </section>

      <section aria-labelledby="response-title" className="tool-panel">
        <h2 id="response-title" className="search-title">Respuesta</h2>
        {serverError && exchange ? (
          <div className="character-error mt-4">
            <p className="character-error-code" aria-label={`Error HTTP ${status}`}>{status}</p>
            <p role="status" className="text-muted-foreground">La API no pudo procesar la solicitud.</p>
            <button type="button" className="search-submit mt-4" onClick={() => consult(exchange.id)}>
              Reintentar
            </button>
          </div>
        ) : (
          <p
            role="status"
            aria-atomic="true"
            className={response && !success ? "mt-3 text-destructive" : "mt-3 text-muted-foreground"}
          >
            {status !== null && <strong className="mr-2 font-mono">HTTP {status}</strong>}
            {pending
              ? "Consultando la API…"
              : success
                ? "Consulta exitosa."
                : response
                  ? characterErrorMessage(response)
                  : "La respuesta aparecerá al consultar un personaje."}
          </p>
        )}

        {success && (
          <div className="response-character">
            <Image
              src={response.character.image}
              alt={`Retrato de ${response.character.name}`}
              width={300}
              height={300}
              sizes="96px"
            />
            <div>
              <h3 className="font-display text-xl font-bold">{response.character.name}</h3>
              <dl className="response-facts">
                <div><dt>Estado</dt><dd><CharacterStatus status={response.character.status} /></dd></div>
                <div><dt>Especie</dt><dd>{response.character.species || "Sin especificar"}</dd></div>
                <div><dt>Género</dt><dd>{characterGenders[response.character.gender]}</dd></div>
              </dl>
              <Link href={characterPath(response.character.id)} className="header-link text-sm text-secondary-foreground">
                Ver ficha completa →
              </Link>
            </div>
          </div>
        )}

        {raw && (
          <div className="mt-5">
            <div className="json-toolbar">
              <h3 id="json-title" className="font-semibold">JSON original</h3>
              <button type="button" className="json-copy" onClick={copyJson}>Copiar JSON</button>
            </div>
            <pre tabIndex={0} role="region" aria-labelledby="json-title" className="json-output">{raw}</pre>
            <p role="status" className="mt-2 text-sm text-muted-foreground">{copyMessage}</p>
          </div>
        )}
      </section>
    </div>
  );
}
