import type { Metadata } from "next";
import { EndpointTester } from "@/components/endpoint-tester";
import { parseCharacterId } from "@/lib/character-id";

export const metadata: Metadata = {
  title: "Probar endpoint | Portal de personajes",
  description: "Consulta un personaje por ID y revisa el código HTTP y el JSON original de la API de Rick and Morty.",
};

export default async function TestEndpointPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const { id } = await searchParams;
  const initialId = typeof id === "string" ? parseCharacterId(id) ?? undefined : undefined;

  return (
    <main id="contenido" tabIndex={-1} className="shell inner-page">
      <header className="mb-6 text-center">
        <h1 className="inner-title">Probar endpoint</h1>
        <p className="hero-description text-muted-foreground">Consulta un personaje por ID e inspecciona la respuesta de la API.</p>
      </header>
      <EndpointTester key={initialId ?? "empty"} initialId={initialId} />
    </main>
  );
}
