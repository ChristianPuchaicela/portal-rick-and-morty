import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { characterPath } from "@/lib/character-id";
import { getCharacterPage, type CharacterSummary } from "@/lib/characters";
import { RequestRetry } from "@/components/request-retry";
import { CatalogPagination } from "@/components/catalog-pagination";

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
              <div className="skeleton-name" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export async function CharacterCatalog({ page }: { page: number }) {
  await connection();

  let result: Awaited<ReturnType<typeof getCharacterPage>>;

  try {
    result = await getCharacterPage(page);
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

  if (!result) {
    return (
      <div className="catalog-notice">
        <p role="status">La página solicitada no existe.</p>
        <Link href="/" scroll={false} className="header-link text-secondary-foreground">Volver a la primera página</Link>
      </div>
    );
  }

  if (result.kind === "rate-limited") {
    return (
      <div className="catalog-notice">
        <p role="status" className="font-semibold text-destructive">La API alcanzó su límite de solicitudes.</p>
        <p className="mt-2 text-sm text-muted-foreground">Espera un momento e intenta cargar el catálogo otra vez.</p>
        <RequestRetry pendingMessage="Volviendo a consultar el catálogo…" />
      </div>
    );
  }

  const { characters, total, pages } = result;

  if (characters.length === 0) {
    return (
      <div className="catalog-notice">
        <p role="status" className="font-semibold">El catálogo está vacío.</p>
        <RequestRetry pendingMessage="Volviendo a consultar el catálogo…" />
      </div>
    );
  }

  return (
    <>
      <div className="catalog-toolbar">
        <p role="status" className="catalog-summary">
          Página {page} de {pages} · {total} personajes
        </p>
        <CatalogPagination page={page} pages={pages} label="Páginas del catálogo" />
      </div>
      <ul role="list" className="character-grid">
        {characters.map((character) => <CharacterCard key={character.id} character={character} />)}
      </ul>
      <CatalogPagination page={page} pages={pages} label="Páginas del catálogo al final de la cuadrícula" />
    </>
  );
}
