import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de personajes",
  description: "Explora la documentación del endpoint de personajes de Rick and Morty y valida un ID para preparar tu consulta.",
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
            <Link href="/" className="header-link font-display font-bold">
              <span aria-hidden="true" className="brand-mark" />
              Portal de personajes
            </Link>
            <nav aria-label="Principal">
              <Link href="/#buscar" className="header-link text-sm font-semibold text-secondary-foreground">
                Buscar por ID
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
