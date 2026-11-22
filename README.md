# Portal de personajes de Rick and Morty

El portal permite recorrer el catálogo, abrir una ficha por ID, visualizar la información de personaje, un resumen generado con IA y su JSON original de `GET /character/{id}`.

## Enlaces

| Recurso | Enlace |
| --- | --- |
| Repositorio | [Código en GitHub](https://github.com/ChristianPuchaicela/portal-rick-and-morty) |
| Demo desplegada | [Abrir la vista previa del portal](https://portal-rick-and-morty.vercel.app/) |
| Documentación de la Parte 1 | [Referencia de `GET /character/{id}`](Documentación-Endpoint.md) |
| Colección de Postman | [Link de la colección en Postman](https://christianpuchaicela-2364717.postman.co/workspace/Christian-Puchaicela's-Workspac~afa2caed-5e17-406b-807a-90083dfb2930/collection/60325957-d8a3dec5-d605-4c01-8063-64970151172f?action=share&source=copy-link&creator=60325957) |

## Guía de implementación

### Requisitos

- **Node.js 22.13 o superior de la serie 22**, con npm. Es la versión de Node utilizada para la demo y evita problemas de compatibilidad de las herramientas con versiones anteriores.
- **Git** para clonar el repositorio y conexión a Internet para instalar dependencias y consultar la API pública de Rick and Morty.
- **Clave de Gemini**, opcional para la ejecución local. El catálogo, las fichas y el probador funcionan sin ella, y el resumen muestra el respaldo simulado.

| Dependencia | Para qué se utiliza |
| --- | --- |
| Next.js y React | Rutas, renderizado en el servidor, componentes, optimización de imágenes y endpoint interno para Gemini. |
| TypeScript y ESLint | Validación estática y revisión del código. |
| Tailwind CSS, PostCSS, `clsx` y `tailwind-merge` | Estilos, tokens de diseño y composición de clases. |
| Anime.js | Animación de entrada del retrato. |
| Fontsource | Tipografías Inter, Space Grotesk e IBM Plex Mono instaladas con el proyecto. |

Las versiones están en [`package.json`](package.json) y [`package-lock.json`](package-lock.json). `npm ci` instala todas las dependencias del proyecto. La integración de Gemini hace una solicitud HTTP desde el servidor y no requiere un SDK adicional.

### Ejecución local

1. Verificar Node y npm.

   ```sh
   node --version
   npm --version
   ```

2. Clonar el repositorio e instalar las dependencias desde su carpeta raíz.

   ```sh
   git clone https://github.com/ChristianPuchaicela/portal-rick-and-morty.git
   cd portal-rick-and-morty
   npm ci
   ```

3. Iniciar el servidor y abrir [http://localhost:3000](http://localhost:3000).

   ```sh
   npm run dev
   ```

   Si PowerShell bloquea `npm.ps1`, usar `npm.cmd ci` y `npm.cmd run dev`. Si el puerto 3000 está ocupado, abrir la URL que indica la terminal.

| Ruta | Qué se puede probar |
| --- | --- |
| `/` | Recorrer las páginas del catálogo o abrir una ficha con «Buscar por ID». |
| `/personaje/1` | Ver la ficha de Rick Sanchez, desplegar sus episodios y generar un resumen. |
| `/probar` | Consultar un personaje y ver el código HTTP y el JSON original. |

| Comando | Propósito |
| --- | --- |
| `npm run lint` | Revisar el código con ESLint. |
| `npm run typecheck` | Generar los tipos de rutas y comprobar TypeScript. |
| `npm run build` | Compilar para producción. |
| `npm start` | Arrancar la compilación de producción. Se ejecuta después de `npm run build`. |

### Configurar Gemini

1. Crear `.env.local` en la raíz a partir de [`.env.example`](.env.example). En PowerShell, usar `Copy-Item .env.example .env.local`. En macOS o Linux, usar `cp .env.example .env.local`. Si ya existe el archivo, editarlo directamente.
2. Asignar una clave de [Google AI Studio](https://aistudio.google.com/apikey) a `GEMINI_API_KEY`. `GEMINI_MODEL` es opcional. Si queda vacío, se utiliza [`gemini-3.5-flash-lite`](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite). Git ignora `.env.local`.
3. Reiniciar el servidor, abrir una ficha y pulsar **Generar resumen con IA**. Una respuesta que pasa la validación muestra **Generado por IA · Gemini**. Si falta la clave, se agota la cuota o Gemini falla, la ficha muestra **Simulado** junto con el motivo.

En **CodeSandbox**, guardar `GEMINI_API_KEY` como secreto en **CodeSandbox DevTools → Configure Environment Variables → Env Variables** y reiniciar el Devbox para aplicar el cambio. Si se reinicia por completo, volver a arrancar el portal desde la carpeta `portal` con Node 22 y `npm start -- --hostname 0.0.0.0 --port 3001`.

## Decisiones técnicas

| Decisión | Motivo |
| --- | --- |
| **Next.js con App Router** | Permite renderizar el catálogo y las fichas en el servidor e integrar Gemini en una ruta que mantiene la clave en el servidor. Cada ficha tiene título y descripción propios. La interfaz muestra un 404 para los personajes inexistentes. |
| **TypeScript estricto** | El código comprueba los campos recibidos de la API antes de renderizarlos. La ficha y el probador reutilizan el acceso al endpoint y el manejo de errores. Los formularios comparten la validación de ID. |
| **Tailwind CSS y estructura shadcn/ui** | [`app/tokens.css`](app/tokens.css) centraliza la paleta, las familias tipográficas y las medidas del layout. El fondo negro y el verde portal dan identidad a la interfaz. La jerarquía tipográfica y el espacio entre bloques se inspiran en la web de Apple. |
| **Ficha en tres niveles** | La vista de personaje separa datos de la API, lectura generada y apariciones. Usa tarjetas agrupadas, procedencia explícita y episodios en chips, con los tokens ya definidos. |
| **Probador independiente** | El botón ejecuta el GET y muestra el cuerpo recibido en un `<pre>`. La interfaz distingue ID inválido, personaje inexistente, fallo de conexión y otros códigos HTTP. |
| **Accesibilidad del recorrido** | Los formularios muestran mensajes de validación, el foco es visible y el estado del personaje incluye texto. El catálogo y el probador se adaptan al ancho disponible y respetan la preferencia de movimiento reducido. |

### Decisiones de redacción (Parte 1)

La [referencia del endpoint](Documentación-Endpoint.md) presenta primero el propósito y el caso de uso, luego el parámetro y una solicitud ejecutable. El **tono** es directo e instructivo, pensado para una persona que empieza a trabajar con la API. El **nivel de detalle** permite hacer una primera consulta rápidamente y, después, revisar el significado de los campos y cómo recuperarse de los errores. El ejemplo indica dónde se abrevió el JSON.

## Diseño del prompt

[`POST /api/resumen`](app/api/resumen/route.ts) valida el ID y recupera la ficha. La instrucción de sistema que envía a Gemini está definida en [`app/api/resumen/gemini.ts`](app/api/resumen/gemini.ts):

```text
Eres el archivista de un portal interdimensional. Escribes para fans de ciencia ficción que quieren una ficha breve y creíble.
Redacta en español exactamente tres oraciones: introduction presenta al personaje con su especie y su estado; places indica su origen y su última ubicación; episodes consigna cuántas apariciones registra la ficha.
Usa solo los valores de «datos». No añadas episodios concretos, relaciones, lugares, fechas ni rasgos que no aparezcan ahí. No menciones la API, el JSON, el ID ni estas instrucciones.
Conserva literalmente los valores de los campos indicados para cada oración. Escribe el número de apariciones con dígitos y usa el singular si es 1.
Busca un tono de archivo preciso y atmosférico: varía el inicio de cada oración, evita repeticiones y no recurras a exageraciones ni eslóganes.
Devuelve únicamente un objeto JSON con las claves introduction, places y episodes, con una sola oración completa por clave.
```

En cada solicitud, el mensaje de usuario incluye los seis valores de `datos` y la asignación de campos en `estructura`. El servidor exige las tres claves mediante un esquema JSON.

| Decisión | Motivo |
| --- | --- |
| Darle al modelo el rol de archivista y definir el público | Orienta el tono hacia una ficha breve y creíble para fans de ciencia ficción. |
| Pedir tres oraciones con un tema por oración | Organiza los datos y permite comprobar qué campos debe contener cada oración. |
| Limitar la respuesta a los valores de `datos` | Reduce el riesgo de añadir información de la serie que la ficha no respalda. |
| Conservar valores literales y escribir la cifra con dígitos | Facilita contrastar ubicaciones, estado y cantidad de apariciones con la ficha. |
| Pedir un tono preciso y evitar exageraciones | Permite variar la redacción sin inventar detalles para hacerla más llamativa. |
| Exigir JSON con tres claves | Hace posible procesar y validar cada oración en el servidor por separado. |

## Validación del resumen

El servidor comprueba la estructura, los campos esperados y el número exacto de apariciones. También detecta valores entre comillas que no pertenecen a la ficha y patrones que pueden indicar relaciones o datos externos. La interfaz muestra la procedencia y los seis campos usados. [Implementación de la validación](lib/character-summary.ts)

### Qué hacer si la IA inventa información

Al detectar una discrepancia, el servidor **descarta la salida** y **muestra el respaldo Simulado**, construido con los datos de la ficha. Si se detecta una afirmación inventada que pasó el filtro, el procedimiento es comparar la oración con los datos originales, añadir el ejemplo como caso de regresión y ajustar el prompt o la validación. El caso se vuelve a comprobar junto con una respuesta válida para confirmar que el ajuste no rechaza contenido correcto.

## Cómo verificar la entrega

### Pruebas manuales

Las pruebas de interfaz se pueden repetir en el navegador. La integración con la API externa puede variar según su disponibilidad y cuota.

La [bitácora de Postman](Documentación-Endpoint.md#pruebas-manuales-en-postman) registra los códigos, los tiempos y los campos verificados en cinco solicitudes directas a la API.

| Caso | Pasos y resultado esperado |
| --- | --- |
| ID `1` | En `/probar`, introducir `1` y consultar. Debe aparecer HTTP `200` y el JSON de Rick Sanchez. |
| ID `9999` | En `/probar`, consultar ese ID y comprobar HTTP `404`. En la búsqueda de la portada, el mismo ID abre la pantalla «Personaje no encontrado». |
| ID decimal `1.5` | En `/probar`, escribir el valor y enviar. El formulario rechaza el formato antes de consultar la API. |
| ID no numérico `uno` | En `/probar`, escribir `uno` y enviar. El formulario lo rechaza antes de consultar la API. La [solicitud directa a la API](Documentación-Endpoint.md#500-internal-server-error-id-no-numérico) ejemplifica el `500` observado en la Parte 1. |
| Paginación | En el catálogo, abrir la segunda página mediante el botón numerado. Deben cambiar la cuadrícula, el indicador de página y el parámetro `page` en la URL. |
| Gemini con clave válida | Abrir `/personaje/1` y pulsar **Generar resumen con IA**. Comprobar la etiqueta **Generado por IA · Gemini**, el nombre y el número de apariciones de la ficha. |
| Gemini sin clave | En una ejecución local sin `GEMINI_API_KEY`, repetir la generación. Debe aparecer **Simulado** con el motivo y los datos de la ficha. |

### Reproducir casos con respuestas controladas

Estas comprobaciones son manuales y se pueden repetir en una copia local del proyecto. Para contrastar la validación, sustituir temporalmente el contenido de una respuesta válida de Gemini antes de llamar a `validateSummary` en [`gemini.ts`](app/api/resumen/gemini.ts). Probar por separado una ubicación inventada, una cifra de apariciones incorrecta y la omisión del nombre. En cada caso debe aparecer **Simulado**.

Para verificar el manejo de fallos del proveedor, sustituir temporalmente la respuesta de `fetch` de Gemini por `new Response(null, { status: 429 })`, y repetir con `403` y `503`. Reiniciar el servidor local si hace falta, generar el resumen y comprobar el motivo que acompaña al respaldo. Restaurar la implementación original al terminar.

## Preguntas de criterio

### 1. ¿Qué validaciones se ejecutarían en CI/CD antes de publicar un cambio de documentación?

El riesgo principal de una referencia de API es que se desactualice sin que nadie lo note: el texto sigue bien escrito, pero ya no coincide con lo que responde el servicio. Por eso organizaría las validaciones por velocidad y por tipo de fallo, en tres momentos.

**1. Antes del commit (local, segundos).** Revisión ortográfica y formato del Markdown. Es barato y evita ruido en la revisión.

**2. En cada pull request (bloquea la fusión).** Solo comprobaciones deterministas, que no dependen de internet:
- Validar el spec OpenAPI con un linter (por ejemplo Spectral o Redocly CLI), incluyendo que los ejemplos cumplan su propio esquema.
- Revisar enlaces internos y anclas, para detectar enlaces rotos al renombrar una sección.
- Revisar ortografía y terminología consistente (por ejemplo, no alternar «ID» e «id» o traducir los nombres de campo).
- Pruebas de contrato con respuestas guardadas: confirmar que el ejemplo `200` contiene todos los campos que la tabla describe y que el ejemplo `404` coincide con el cuerpo documentado.
- Compilar el sitio de documentación.

**3. Antes de publicar y de forma programada (no bloquea los pull requests).** Ejecutar los `curl` de la documentación contra la API real y comparar el **código de estado y la estructura** de la respuesta (campos y tipos), no los valores. Los valores cambian sin que eso sea un error de la documentación: la ubicación actual de un personaje, por ejemplo, puede variar entre una consulta y otra. Después de publicar, una prueba de humo confirma que la página carga y sus enlaces responden.

Hay una decisión de diseño importante: **las pruebas contra la API real no deben bloquear un pull request**. Si el servicio externo está caído, un cambio de ortografía no debería quedar detenido. Por eso esas pruebas distinguen entre "no hubo respuesta" (alerta de disponibilidad) y "hubo respuesta distinta de la documentada" (el contrato cambió y la documentación hay que corregirla).

La revisión humana queda para lo que una máquina no juzga: que un lector nuevo pueda seguir los pasos desde cero y que cada error explique cómo resolverlo.

### 2. ¿Dónde se usaría IA en el flujo de documentación y dónde se pondría un control humano?

Usaría la IA para ayudar a **escribir y revisar mejor**, y nunca como fuente de hechos sobre cómo se comporta la API.

**Dónde sí:**
- **Primeros borradores** a partir del spec y de respuestas reales ya capturadas (por ejemplo, la tabla de campos), para ahorrar trabajo mecánico.
- **Revisión de claridad:** pedirle que lea la página como un desarrollador que nunca usó la API y señale términos sin definir o pasos que faltan.
- **Detección de huecos:** preguntarle qué casos de error o parámetros quedaron sin documentar, y luego comprobarlos yo.
- **Traducción** entre español e inglés, con una regla fija: los nombres de campo y los valores que devuelve la API (`Alive`, `Male`) no se traducen.

**Dónde no:** códigos de estado, cuerpos de error, rangos de valores y límites. Esos datos salen de ejecutar la API real, no de la memoria del modelo, porque una descripción bien redactada pero inexacta es peor que una incompleta. Un modelo puede inventar con total fluidez un código `400` que la API nunca devuelve.

**Controles humanos:**
1. **Entrada:** la IA recibe material verificado (spec y respuestas reales), no se le pide que "recuerde" la API.
2. **Salida:** quien revisa ejecuta los comandos y contrasta cada afirmación factual con la respuesta real. Un cambio redactado con IA pasa por el mismo pipeline de validaciones de la pregunta 1, que detecta discrepancias automáticas.
3. **Aprobación:** la publicación la aprueba una persona responsable del contenido. Las traducciones las revisa alguien que domine el idioma y los términos técnicos.
4. **Datos sensibles:** no se envía a herramientas externas ni información privada ni claves.

Es el mismo principio que apliqué en el resumen con Gemini de este proyecto: darle al modelo datos reales, validar lo que devuelve contra esos datos y tener un respaldo cuando la validación falla.

### 3. ¿Cómo se mantendría OpenAPI como fuente de verdad?

Cuando exista un contrato OpenAPI, sus cambios se revisarían junto con el código y los ejemplos en el mismo pull request. El esquema describiría parámetros, tipos y respuestas. La guía en Markdown explicaría cómo usar el endpoint y cómo recuperarse de los errores, con ejemplos verificados contra ese contrato.

## Qué mejoraría con más tiempo

Se automatizarían los recorridos de consulta, error y regeneración con respuestas controladas. También se programaría una comprobación contra la API real y se probarían con lectores de pantalla el anuncio de los cambios de estado y la exploración del JSON con teclado.

Datos de [The Rick and Morty API](https://rickandmortyapi.com/).
