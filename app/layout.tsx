import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeSectionLink } from "@/components/home-section-link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de personajes",
  description: "Explora los personajes de Rick and Morty, abre sus fichas y consulta la respuesta original de la API.",
  icons: {
    icon: [
      {
        url: "/icons8-morty-smith-32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  },
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
            <HomeSectionLink section="inicio">
              <Image src="/icons8-rick-sanchez.svg" width={44} height={44} alt="Rick Sanchez · Inicio" />
            </HomeSectionLink>
            <nav aria-label="Principal" className="primary-nav">
              <HomeSectionLink section="personajes">
                Personajes
              </HomeSectionLink>
              <HomeSectionLink section="buscar">
                Buscar por ID
              </HomeSectionLink>
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
