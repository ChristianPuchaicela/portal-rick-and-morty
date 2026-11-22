import Image from "next/image";
import { Suspense } from "react";
import { CatalogLoading, CharacterCatalog } from "@/components/character-catalog";
import { CharacterIdForm } from "@/components/character-id-form";
import { parseCharacterId } from "@/lib/character-id";

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const { page } = await searchParams;
  const catalogPage = typeof page === "string" ? parseCharacterId(page) ?? 1 : 1;
  return (
    <main id="contenido" tabIndex={-1} className="shell">
      <div id="inicio" className="hero">
        <h1 className="hero-brand">
          <span className="sr-only">Portal de personajes de Rick and Morty</span>
          <Image src="/rick-and-morty.svg" loading="eager" width={1024} height={313} alt="" />
        </h1>
        <div>
          <code className="endpoint rounded-lg bg-card px-3 py-2 text-secondary-foreground">
            <span className="text-primary">GET</span>
            <span>/character/{"{id}"}</span>
          </code>
          <p className="hero-description text-muted-foreground">
            Explora cómo la API de Rick y Morty identifica a cada personaje del multiverso.
          </p>
        </div>
      </div>
      <section id="buscar" aria-labelledby="buscar-titulo" className="search-panel">
        <div>
          <h2 id="buscar-titulo" className="search-title">Busca un personaje por su ID</h2>
        </div>
        <CharacterIdForm />
      </section>
      <section id="personajes" className="catalog-section" aria-labelledby="catalog-title">
        <h2 id="catalog-title" tabIndex={-1} className="search-title">Personajes</h2>
        <Suspense key={catalogPage} fallback={<CatalogLoading />}>
          <CharacterCatalog page={catalogPage} />
        </Suspense>
      </section>
    </main>
  );
}
