import Image from "next/image";
import { connection } from "next/server";
import { characterApiUrl, getFirstCharacterPage, type CharacterSummary } from "@/lib/characters";
import { CatalogRetry } from "@/components/catalog-retry";

function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <li>
      <a
        className="character-card"
        href={characterApiUrl(character.id)}
        aria-labelledby={`character-name-${character.id} character-action-${character.id}`}
      >
        <div className="character-portrait">
          <Image
            src={character.image}
            alt={`Retrato de ${character.name}`}
            width={300}
            height={300}
            sizes="(min-width: 80rem) 15rem, (min-width: 68rem) 20vw, (min-width: 54rem) 25vw, (min-width: 37rem) 33vw, 50vw"
          />
        </div>
        <div className="character-caption">
          <span className="character-id font-mono">ID {character.id}</span>
          <div className="character-caption-row">
            <h3 id={`character-name-${character.id}`} className="character-name">{character.name}</h3>
            <span className="character-arrow" aria-hidden="true">↗</span>
          </div>
          <span id={`character-action-${character.id}`} className="sr-only">Ver en la API</span>
        </div>
      </a>
    </li>
  );
}

export function CatalogLoading() {
  return (
    <>
      <p role="status" className="catalog-summary">Cargando personajes…</p>
      <div aria-hidden="true" className="character-grid">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="character-placeholder">
            <div className="character-portrait" />
            <div className="character-caption">
              <div className="skeleton-line skeleton-id" />
              <div className="skeleton-line skeleton-name" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export async function CharacterCatalog() {
  await connection();

  let characters: CharacterSummary[];

  try {
    characters = await getFirstCharacterPage();
  } catch (error) {
    console.error("Character catalog request failed", error);
    return (
      <div className="catalog-notice">
        <p role="status" className="font-semibold text-destructive">No pudimos cargar los personajes.</p>
        <p className="mt-2 text-sm text-muted-foreground">La API puede estar temporalmente indisponible.</p>
        <CatalogRetry />
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="catalog-notice">
        <p role="status" className="font-semibold">El catálogo está vacío.</p>
        <p className="mt-2 text-sm text-muted-foreground">La API respondió sin personajes en la primera página.</p>
        <CatalogRetry />
      </div>
    );
  }

  return (
    <>
      <p role="status" className="catalog-summary">
        {characters.length === 1 ? "1 personaje" : `${characters.length} personajes`} en la primera página
      </p>
      <ul role="list" className="character-grid">
        {characters.map((character) => <CharacterCard key={character.id} character={character} />)}
      </ul>
    </>
  );
}
