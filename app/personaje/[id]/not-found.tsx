import Link from "next/link";
import { characterNotFoundMessage } from "@/lib/characters";

export default function CharacterNotFound() {
  return (
    <main id="contenido" tabIndex={-1} className="shell inner-page character-error">
      <div>
        <p className="character-error-code">404</p>
        <h1 className="search-title">{characterNotFoundMessage}</h1>
        <Link href="/#buscar" className="header-link mt-4 text-secondary-foreground">← Buscar otro personaje</Link>
      </div>
    </main>
  );
}
