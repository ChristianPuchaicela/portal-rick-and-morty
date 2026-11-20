import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { characterPath } from "@/lib/character-id";
import { getFirstCharacterPage, type CharacterSummary } from "@/lib/characters";
import { RequestRetry } from "@/components/request-retry";

function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <li>
      <Link
        className="character-card"
        href={characterPath(character.id)}
        prefetch={false}
      >
        <div className="character-portrait">
          <Image
            src={character.image}
            alt=""
            width={300}
            height={300}
            sizes="(min-width: 80rem) 15rem, (min-width: 68rem) 20vw, (min-width: 54rem) 25vw, (min-width: 37rem) 33vw, 50vw"
          />
        </div>
        <div className="character-caption">
          <h3 className="character-name">{character.name}</h3>
        </div>
        <span className="character-card-action">Ver detalle <span aria-hidden="true">↗</span></span>
      </Link>
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
        <RequestRetry pendingMessage="Volviendo a consultar el catálogo…" />
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="catalog-notice">
        <p role="status" className="font-semibold">El catálogo está vacío.</p>
        <p className="mt-2 text-sm text-muted-foreground">La API respondió sin personajes en la primera página.</p>
        <RequestRetry pendingMessage="Volviendo a consultar el catálogo…" />
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
