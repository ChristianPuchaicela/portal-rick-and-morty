import Image from "next/image";
import { Suspense } from "react";
import { CatalogLoading, CharacterCatalog } from "@/components/character-catalog";
import { CharacterIdForm } from "@/components/character-id-form";

export default function Home() {
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
          <h2 id="buscar-titulo" className="search-title">Buscar por ID</h2>
          <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
            Abre la ficha del personaje con su identificador.
          </p>
        </div>
        <CharacterIdForm />
      </section>
      <section id="personajes" className="catalog-section" aria-labelledby="catalog-title">
        <h2 id="catalog-title" className="search-title">Personajes</h2>
        <Suspense fallback={<CatalogLoading />}>
          <CharacterCatalog />
        </Suspense>
      </section>
    </main>
  );
}
