import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache, type ReactNode } from "react";
import { CharacterStatus } from "@/components/character-status";
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

export default async function CharacterPage({ params }: DetailProps) {
  const result = await loadCharacter((await params).id);

  if (result.kind !== "success") {
    return (
      <main id="contenido" tabIndex={-1} className="shell inner-page">
        <Link href="/#personajes" className="header-link text-secondary-foreground">← Volver al catálogo</Link>
        <section className="catalog-notice" aria-labelledby="detail-error-title">
          <h1 id="detail-error-title" className="search-title">Ficha no disponible</h1>
          <p className="mt-2 text-destructive">{characterErrorMessage(result)}</p>
          <RequestRetry pendingMessage="Volviendo a consultar la ficha…" />
        </section>
      </main>
    );
  }

  const { character } = result;
  const fields: { label: string; value: ReactNode }[] = [
    { label: "Estado", value: <CharacterStatus status={character.status} /> },
    { label: "Especie", value: displayValue(character.species) },
    { label: "Tipo", value: displayValue(character.type) },
    { label: "Género", value: characterGenders[character.gender] },
    {
      label: "Origen",
      value: character.origin.url
        ? <a href={character.origin.url} className="inline-data-link">{displayValue(character.origin.name)}</a>
        : displayValue(character.origin.name),
    },
    {
      label: "Última ubicación",
      value: character.location.url
        ? <a href={character.location.url} className="inline-data-link">{displayValue(character.location.name)}</a>
        : displayValue(character.location.name),
    },
    {
      label: "Creado en la API",
      value: <time dateTime={character.created}>{dateFormat.format(new Date(character.created))} (UTC)</time>,
    },
  ];

  return (
    <main id="contenido" tabIndex={-1} className="shell inner-page">
      <Link href="/#personajes" className="header-link text-secondary-foreground">← Volver al catálogo</Link>
      <article className="detail-panel" aria-labelledby="character-title">
        <Image
          className="detail-image"
          src={character.image}
          alt={`Retrato de ${character.name}`}
          width={300}
          height={300}
          sizes="(min-width: 48rem) 300px, min(100vw, 300px)"
        />
        <div>
          <p className="character-id font-mono">ID {character.id}</p>
          <h1 id="character-title" className="inner-title">{character.name}</h1>
          <dl className="detail-facts">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link className="search-submit inline-flex items-center" href={`/probar?id=${character.id}`}>
              Probar endpoint
            </Link>
            <a className="header-link text-sm text-secondary-foreground" href={characterApiUrl(character.id)}>
              Abrir recurso en la API ↗
            </a>
          </div>
        </div>
      </article>
      <section className="detail-episodes" aria-labelledby="episodes-title">
        <h2 id="episodes-title" className="search-title">Episodios</h2>
        {character.episode.length > 0 ? (
          <details>
            <summary className="episode-summary">Ver apariciones ({character.episode.length})</summary>
            <ul role="list" className="episode-list">
              {character.episode.map((url) => (
                <li key={url}><a className="episode-link" href={url}>Episodio {url.slice(url.lastIndexOf("/") + 1)}</a></li>
              ))}
            </ul>
          </details>
        ) : (
          <p className="mt-2 text-muted-foreground">La API no registra apariciones para este personaje.</p>
        )}
      </section>
    </main>
  );
}
