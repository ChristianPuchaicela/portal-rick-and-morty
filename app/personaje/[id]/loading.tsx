export default function CharacterLoading() {
  return (
    <main id="contenido" tabIndex={-1} className="shell inner-page">
      <p role="status" className="sr-only">Cargando ficha del personaje…</p>
      <div aria-hidden="true" className="detail-skeleton">
        <div className="skeleton-block h-4 w-32" />
        <div className="dossier">
          <div className="dossier-hero">
            <div className="portrait-frame">
              <div className="character-showcase">
                <div className="detail-image skeleton-block" />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="skeleton-block h-3 w-28" />
              <div className="skeleton-block h-[clamp(2.25rem,6vw,4.5rem)] w-3/4" />
              <div className="skeleton-block h-8 w-48 max-w-full" />
            </div>
          </div>
          <div className="dossier-body">
            <div>
              <div className="skeleton-block mb-5 h-8 w-48 max-w-full" />
              <div className="fact-grid">
                {[0, 1, 2].map((card) => (
                  <div className="fact-card grid gap-4" key={card}>
                    <div className="skeleton-block h-4 w-24" />
                    <div className="skeleton-block h-3 w-3/4" />
                    <div className="skeleton-block h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
