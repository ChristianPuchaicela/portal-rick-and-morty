# Portal de personajes de Rick and Morty

Proyecto para la prueba técnica de Technical Writing de Kushki. Permite explorar el catálogo, abrir una ficha por ID y consultar `GET /character/{id}` para inspeccionar el código HTTP y el JSON original.

La [referencia del endpoint](docs/endpoint.md) explica el parámetro, incluye solicitudes reproducibles y describe los campos y los errores de la API.

## Ejecución local

Necesitas **Node.js 20.9 o superior**, npm y conexión a la API pública de Rick and Morty. El catálogo, las fichas y el probador funcionan sin una clave de Gemini.

```sh
npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). En PowerShell puedes usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

| Ruta | Qué puedes probar |
| --- | --- |
| `/` | Ver la primera página del catálogo o abrir una ficha con «Buscar por ID». |
| `/personaje/1` | Ver la ficha de Rick Sanchez, desplegar sus episodios y generar un resumen. |
| `/probar` | Pulsar «Consultar personaje» para ver el código HTTP, el resultado y su JSON original. |

| Comando | Propósito |
| --- | --- |
| `npm run lint` | Revisar el código con ESLint. |
| `npm run typecheck` | Generar los tipos de rutas y comprobar TypeScript. |
| `npm run build` | Compilar para producción. |
| `npm start` | Ejecutar el proyecto compilado. |

### Configurar Gemini

1. Crea `.env.local` en la raíz con la estructura de [`.env.example`](.env.example). Si el archivo local aún no existe, en PowerShell puedes usar `Copy-Item .env.example .env.local` y en una terminal POSIX, `cp .env.example .env.local`.
2. Asigna tu clave de Google AI Studio a `GEMINI_API_KEY` dentro de `.env.local`. Git ignora este archivo. El modelo se puede cambiar con `GEMINI_MODEL`. Si está vacío, la aplicación usa [`gemini-3.5-flash-lite`](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite).
3. Reinicia el servidor y pulsa **Generar resumen con IA** en una ficha. Una respuesta validada de Gemini aparece como **IA · Gemini**. Si falta la clave, se agota la cuota o Gemini falla, aparece **Simulado** junto con el motivo.

Si publicas el proyecto, configura las mismas variables en el entorno de servidor del proveedor de alojamiento. Usa los nombres de la plantilla para mantener la clave fuera del código del navegador.

## Decisiones técnicas

| Decisión | Motivo |
| --- | --- |
| **Next.js con App Router** | Permite renderizar el catálogo y las fichas en el servidor e integrar Gemini en una ruta que mantiene la clave en el servidor. Cada ficha tiene título y descripción propios. Un ID inexistente devuelve HTTP `404`. |
| **TypeScript estricto** | El código comprueba los campos recibidos de la API antes de renderizarlos. La ficha y el probador reutilizan el acceso al endpoint y el manejo de errores. Los formularios comparten la validación de ID. |
| **Tailwind CSS y estructura shadcn/ui** | [`app/tokens.css`](app/tokens.css) centraliza la paleta, las familias tipográficas y las medidas del layout. El fondo negro y el verde portal dan identidad a la interfaz. La jerarquía tipográfica y el espacio entre bloques se inspiran en la web de Apple. |
| **Ficha en tres niveles** | La vista de personaje separa datos de la API, lectura generada y apariciones. Usa tarjetas agrupadas, procedencia explícita y episodios en chips, con los tokens ya definidos en `app/tokens.css`. |
| **Probador independiente** | El botón ejecuta el GET y muestra el cuerpo recibido en un `<pre>`. La interfaz distingue ID inválido, personaje inexistente, fallo de conexión y otros códigos HTTP. |
| **Accesibilidad del recorrido** | Los formularios tienen etiquetas y mensajes asociados, el foco es visible y el estado del personaje incluye texto e icono. El catálogo y el probador se adaptan al ancho disponible y respetan la preferencia de movimiento reducido. |

En la [referencia de la Parte 1](docs/endpoint.md) puse primero el propósito y el caso de uso. Después expliqué el parámetro y ofrecí una solicitud que el lector puede ejecutar antes de revisar cada campo de la respuesta. Definí los términos REST y JSON en lenguaje directo para quien empieza a usar la API. El ejemplo marca dónde se abrevió la respuesta y el caso `404` incluye pasos para recuperarse.

## Validación del resumen

Al pulsar el botón, el servidor recibe un ID entero positivo y recupera la ficha original. Extrae el nombre, la especie, el estado, el origen, la última ubicación y la cantidad de episodios. [Implementación de `POST /api/resumen`](app/api/resumen/route.ts)

Gemini redacta tres oraciones en español —presentación, coordenadas y registro— con tono de archivo para fans de ciencia ficción. La instrucción usa solo los valores de la ficha y prohíbe datos externos, relaciones y menciones de la API. El esquema JSON exige exactamente tres claves y la temperatura baja limita la variación.

Antes de mostrar el texto, el servidor comprueba que cada oración incluya los campos esperados y que no aparezcan cifras ajenas a la ficha, entidades nuevas, relaciones, vocabulario de la API ni comillas con valores inventados. Si algo no pasa, se descarta y se devuelve el texto de respaldo construido con los datos verificados y marcado **Simulado**. La interfaz separa los datos de la API de la lectura generada, indica su procedencia y muestra los seis campos usados como chips.

| Caso verificado | Resultado |
| --- | --- |
| `1`, `9999` y `1.5` en el probador | La API real devolvió HTTP `200` y `404` en los dos primeros casos. El decimal se rechazó antes de enviar la petición. |
| Rick Sanchez con Gemini sin configurar | La interfaz mostró **Simulado**, con el nombre y los 51 episodios que devolvió la API durante la prueba. |
| Llamada autenticada a Gemini con Rick Sanchez | La ficha mostró **Generado por IA** y presentó los seis datos usados, incluidos el nombre y los 51 episodios. |
| Salida de Gemini con una ubicación inventada, otra cifra o sin el nombre | Con respuestas controladas, se aceptaron las tres oraciones verificadas y se descartaron las que introducían datos nuevos. |
| Cuota agotada, clave rechazada, HTTP `503` y tiempo de espera | Las pruebas controladas devolvieron el respaldo con un mensaje acorde al fallo. |

Para repetir la prueba autenticada, configura la clave, genera un resumen y confirma que aparezca **Generado por IA** con los datos usados. Los fallos del proveedor se verificaron con respuestas controladas.

## Preguntas de criterio

### 1. ¿Qué validaciones ejecutaría en CI/CD antes de publicar un cambio de documentación?

En cada pull request ejecutaría lint, validación de tipos y compilación. Añadiría una comprobación de enlaces y anclas en Markdown y pruebas del contrato con respuestas controladas. Esas pruebas confirmarían que el ejemplo `200` incluye los campos descritos y que el ejemplo `404` coincide con el cuerpo documentado.

Antes de publicar, ejecutaría los ejemplos contra la API real para detectar cambios en su comportamiento. Si el servicio externo está indisponible, registraría ese fallo por separado para que la revisión pueda distinguir entre disponibilidad y un cambio de contrato confirmado. La revisión humana comprobaría que las instrucciones se puedan seguir desde un entorno limpio y que los errores expliquen cómo continuar.

### 2. ¿Dónde usaría IA en el flujo de documentación y dónde pondría un control humano?

Usaría IA para proponer títulos, acortar explicaciones o sugerir preguntas que podría hacerse un desarrollador al leer la referencia. Le daría el contrato y ejemplos ya comprobados para que las propuestas partan de datos verificables.

Antes de publicar, la persona responsable ejecutaría los comandos y contrastaría parámetros, campos y errores con la respuesta real. Si la IA introduce un código HTTP no observado o un campo que la API no devuelve, descartaría esa propuesta. La aprobación final seguiría a cargo de quien mantiene la referencia.

## Qué mejoraría con más tiempo

Automatizaría los recorridos de consulta, error y regeneración con respuestas controladas y programaría una comprobación contra la API real. También probaría con lectores de pantalla el anuncio de los cambios de estado y la exploración del panel JSON con teclado.
