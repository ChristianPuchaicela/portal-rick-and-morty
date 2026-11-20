import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de personajes",
  description: "Explora los personajes de Rick and Morty, abre sus fichas y consulta la respuesta original de la API.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a href="#contenido" className="skip-link rounded-lg bg-primary font-semibold text-primary-foreground">
          Saltar al contenido
        </a>
        <header className="site-header">
          <div className="shell header-content">
            <Link href="/#inicio" className="header-link">
              <Image src="/icons8-rick-sanchez.svg" width={44} height={44} alt="Rick Sanchez · Inicio" />
            </Link>
            <nav aria-label="Principal" className="primary-nav">
              <Link href="/#personajes" className="header-link">
                Personajes
              </Link>
              <Link href="/#buscar" className="header-link">
                Buscar por ID
              </Link>
              <Link href="/probar" className="header-link">
                Probar endpoint
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="shell mt-auto py-6 text-sm text-muted-foreground">
          <a
            className="header-link underline underline-offset-4"
            href="https://rickandmortyapi.com/documentation"
          >
            Documentación de Rick and Morty API
          </a>
        </footer>
      </body>
    </html>
  );
}
