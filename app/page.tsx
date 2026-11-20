import Image from "next/image";
import { Suspense } from "react";
import { CatalogLoading, CharacterCatalog } from "@/components/character-catalog";
import { CharacterIdForm } from "@/components/character-id-form";
import { HttpResponseGuide } from "@/components/http-response-guide";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function Home() {
  return (
    <main id="contenido" tabIndex={-1} className="shell">
      <div id="inicio" className="hero">
        <Image
          src="/rick-and-morty.svg"
          loading="eager"
          width={1024}
          height={313}
          alt="Rick and Morty"
          className="hero-logo"
        />
        <div>
          <code className="endpoint rounded-lg border border-border bg-secondary px-3 py-2 text-secondary-foreground">
            <span className="text-primary">GET</span>
            <span>/character/{"{id}"}</span>
          </code>
          {/* <h1 className="hero-title">
            API de <span className="text-primary">personajes</span>
          </h1> */}
          <p className="hero-description text-muted-foreground">
            Explora cómo la API de Rick y Morty identifica a cada personaje del multiverso.
          </p>
        </div>
      </div>
      <section id="buscar" aria-labelledby="buscar-titulo" className="search-panel">
        <DotPattern />
        <h2 id="buscar-titulo" className="search-title">Buscar por ID</h2>
        <CharacterIdForm />
      </section>
      <section id="personajes" className="catalog-section" aria-labelledby="catalog-title">
        <h2 id="catalog-title" className="search-title">Personajes</h2>
        <Suspense fallback={<CatalogLoading />}>
          <CharacterCatalog />
        </Suspense>
      </section>
      <HttpResponseGuide />
    </main>
  );
}
