import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache, type ReactNode } from "react";
import { CharacterStatus } from "@/components/character-status";
import { CharacterShowcase } from "@/components/character-showcase";
import { CharacterSummaryPanel } from "@/components/character-summary-panel";
import { ArchiveIcon, CoordinatesIcon, IdentityIcon } from "@/components/detail-icons";
import { RequestRetry } from "@/components/request-retry";
import { parseCharacterId } from "@/lib/character-id";
import { characterGenders } from "@/lib/character-labels";
import { characterApiUrl, characterErrorMessage, getCharacter } from "@/lib/characters";

type DetailProps = { params: Promise<{ id: string }> };

const loadCharacter = cache(async (segment: string) => {
  await connection();
  const id = parseCharacterId(segment);
  if (id === null) notFound();
  const result = await getCharacter(id);
  if (result.kind === "http-error" && result.status === 404) notFound();
  return result;
});

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const result = await loadCharacter((await params).id);
  if (result.kind !== "success") {
    return { title: "Ficha no disponible | Portal de personajes", robots: { index: false } };
  }

  return {
    title: `${result.character.name} | Portal de personajes`,
    description: `Ficha de ${result.character.name} en la API de Rick and Morty, con su origen, ubicación y episodios.`,
  };
}

const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" });

function displayValue(value: string) {
  return value.trim().toLowerCase() === "unknown" ? "Desconocido" : value.trim() || "Sin especificar";
}

function SectionHeading({ index, eyebrow, title, id }: { index: string; eyebrow: string; title: string; id: string }) {
  return (
    <div className="section-heading">
      <span className="section-index" aria-hidden="true">{index}</span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="search-title">{title}</h2>
      </div>
    </div>
  );
}

function FactCard({ icon, title, facts }: { icon: ReactNode; title: string; facts: { label: string; value: ReactNode }[] }) {
  return (
    <article className="fact-card">
      <h3>{icon}{title}</h3>
      <dl>
        {facts.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default async function CharacterPage({ params }: DetailProps) {
  const result = await loadCharacter((await params).id);

  if (result.kind !== "success") {
    return (
      <main id="contenido" tabIndex={-1} className="shell inner-page character-error">
        <section aria-labelledby="detail-error-title">
          {result.kind === "http-error" && (
            <p className="character-error-code">{result.status}</p>
          )}
          <h1 id="detail-error-title" className="search-title">Ficha no disponible</h1>
          <p className="mt-2 text-destructive">{characterErrorMessage(result)}</p>
          <RequestRetry pendingMessage="Volviendo a consultar la ficha…" />
          <Link href="/#personajes" className="header-link text-secondary-foreground">← Volver al catálogo</Link>
        </section>
      </main>
    );
  }

  const { character } = result;
  const placeValue = (place: { name: string; url: string }) => (
    place.url
      ? <a href={place.url} className="inline-data-link">{displayValue(place.name)}</a>
      : displayValue(place.name)
  );

  const identityFacts: { label: string; value: ReactNode }[] = [
    { label: "Especie", value: displayValue(character.species) },
    { label: "Tipo", value: displayValue(character.type) },
    { label: "Género", value: characterGenders[character.gender] },
  ];

  const coordinateFacts: { label: string; value: ReactNode }[] = [
    { label: "Origen", value: placeValue(character.origin) },
    { label: "Última ubicación", value: placeValue(character.location) },
  ];

  const recordFacts: { label: string; value: ReactNode }[] = [
    { label: "Identificador", value: <span className="font-mono">#{character.id}</span> },
    { label: "Apariciones", value: <span className="font-mono">{character.episode.length}</span> },
    {
      label: "Creado en la API",
      value: <time dateTime={character.created}>{dateFormat.format(new Date(character.created))} (UTC)</time>,
    },
  ];

  return (
    <main id="contenido" tabIndex={-1} className="shell inner-page detail-page">
      <nav className="detail-breadcrumb" aria-label="Ruta de navegación">
        <Link href="/#personajes">Personajes</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Ficha #{character.id}</span>
      </nav>

      <article className="dossier" aria-labelledby="character-title">
        <header className="dossier-hero">
          <CharacterShowcase
            image={character.image}
            name={character.name}
          />
          <div className="dossier-identity">
            <p className="eyebrow">Expediente</p>
            <h1 id="character-title" className="inner-title">{character.name}</h1>
            <div className="identity-chips">
              <CharacterStatus status={character.status} badge />
              <span className="meta-chip">{displayValue(character.species)}</span>
              <span className="meta-chip">{characterGenders[character.gender]}</span>
            </div>
          </div>
        </header>

        <div className="dossier-body">
          <section aria-labelledby="data-title">
            <SectionHeading index="01" eyebrow="Fuente: API" title="Datos de la ficha" id="data-title" />
            <div className="fact-grid">
              <FactCard icon={<IdentityIcon />} title="Identidad" facts={identityFacts} />
              <FactCard icon={<CoordinatesIcon />} title="Coordenadas" facts={coordinateFacts} />
              <FactCard icon={<ArchiveIcon />} title="Registro" facts={recordFacts} />
            </div>
          </section>

          <CharacterSummaryPanel key={character.id} id={character.id} />

          <section aria-labelledby="episodes-title">
            <SectionHeading index="03" eyebrow="Fuente: API" title="Apariciones" id="episodes-title" />
            <div className="episodes-panel">
              <div className="episodes-overview">
                <p className="episode-stat">
                  <strong>{character.episode.length}</strong>
                  <span>{character.episode.length === 1 ? "episodio registrado" : "episodios registrados"}</span>
                </p>
                <a className="header-link text-sm text-secondary-foreground" href={characterApiUrl(character.id)}>
                  Ver recurso completo ↗
                </a>
              </div>
              {character.episode.length > 0 ? (
                <details className="episodes-disclosure" open={character.episode.length <= 6}>
                  <summary>Ver lista de apariciones ({character.episode.length})</summary>
                  <ol role="list" className="episode-grid">
                    {character.episode.map((url) => {
                      const number = url.slice(url.lastIndexOf("/") + 1);
                      return (
                        <li key={url}>
                          <a className="episode-chip" href={url}>
                            <small>EP</small>
                            {number.padStart(2, "0")}
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </details>
              ) : (
                <p className="text-sm text-muted-foreground">La API no registra apariciones para este personaje.</p>
              )}
            </div>
          </section>
          <section>
            <div className="dossier-actions">
              <Link className="search-submit inline-flex items-center" href={`/probar?id=${character.id}`}>
                Probar endpoint
              </Link>
              <a className="header-link text-sm text-secondary-foreground" href={characterApiUrl(character.id)}>
                Ver JSON original ↗
              </a>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
