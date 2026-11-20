const responses = [
  {
    code: 200,
    title: "Consulta exitosa",
    message: "La API devuelve los datos del personaje solicitado.",
  },
  {
    code: 404,
    title: "Personaje no encontrado",
    message: "Personaje no encontrado. Intenta con otro ID.",
  },
  {
    code: 500,
    title: "Error del servidor",
    message: "La API no pudo procesar la solicitud. Intenta nuevamente.",
  },
] as const;

export function HttpResponseGuide() {
  return (
    <section className="response-guide" aria-labelledby="responses-title">
      <h2 id="responses-title" className="search-title">Códigos de respuesta</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Mensajes previstos para <code>GET /character/{"{id}"}</code>.
      </p>
      <ul role="list" className="response-list">
        {responses.map(({ code, title, message }) => (
          <li key={code} data-status={code} className="response-card">
            <h3 className="font-semibold">
              <code className="response-code">{code}</code>
              <span className="block">{title}</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
