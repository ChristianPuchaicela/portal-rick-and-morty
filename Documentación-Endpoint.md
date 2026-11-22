# Obtener un personaje por ID

`GET /character/{id}`

Devuelve la ficha completa de un único personaje de *Rick and Morty*: nombre, estado, especie, origen, última ubicación, imagen y episodios en los que aparece.
Úsalo cuando ya conoces el identificador del personaje y necesitas cargar su perfil o una vista de detalle.
Para buscar por nombre o listar varios personajes, usa `GET /character` con filtros.

---

## Antes de empezar

Si nunca has consumido una API, estos conceptos bastan para seguir esta página:

| Concepto | Significado |
| :--- | :--- |
| **Endpoint** | Una dirección (URL) a la que se envía una petición para obtener datos. |
| **Parámetro de ruta (path)** | Un valor que va dentro de la URL. En `/character/{id}`, sustituye `{id}` por un entero positivo. Por ejemplo, `/character/1`. |
| **Petición GET** | Una solicitud de solo lectura: pide datos y no modifica nada en el servidor. |
| **JSON** | El formato de texto en que responde la API. Se compone de pares `"clave": valor`. |
| **Código de estado HTTP** | Un número con el que el servidor indica el resultado: `200` significa éxito y `404`, que el recurso no existe. |

---

## Información general

| Propiedad | Valor |
| :--- | :--- |
| URL base | `https://rickandmortyapi.com/api` |
| URL completa del endpoint | `https://rickandmortyapi.com/api/character/{id}` |
| Método HTTP | `GET` |
| Credenciales | No se requiere clave de API ni token. |
| Protocolo | HTTPS |
| Formato de respuesta | `application/json` |
| Última verificación | 20 de noviembre de 2026 |

---

## Parámetros

| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | Ruta | Entero | Sí | Identificador numérico único y positivo del personaje. El valor `1` devuelve a Rick Sanchez. |

Este endpoint no define filtros de consulta. En la verificación, `GET /character/1?name=morty` devolvió igualmente a Rick Sanchez. Usa los filtros `name`, `status` y `species` en `GET /character`.

---

## Ejemplo de solicitud

### curl

Ejecuta este comando en tu terminal. En Windows puedes usar `curl.exe` si PowerShell interpreta `curl` como un alias.

```bash
curl -X GET "https://rickandmortyapi.com/api/character/1" -H "Accept: application/json"
```

Para ver además el código de estado y las cabeceras de la respuesta, agrega la opción `-i`:

```bash
curl -i "https://rickandmortyapi.com/api/character/1"
```

### JavaScript (fetch)

```javascript
const response = await fetch("https://rickandmortyapi.com/api/character/1");

if (!response.ok) {
  throw new Error(`Error ${response.status}`);
}

const character = await response.json();
console.log(character.name); // "Rick Sanchez"
```

---

## Respuesta exitosa (200 OK)

La respuesta contiene un objeto JSON con los datos del personaje. La API devuelve las 51 URL de episodios de Rick Sanchez. El ejemplo incluye las tres primeras.

```json
{
  "id": 1,
  "name": "Rick Sanchez",
  "status": "Alive",
  "species": "Human",
  "type": "",
  "gender": "Male",
  "origin": {
    "name": "Earth (C-137)",
    "url": "https://rickandmortyapi.com/api/location/1"
  },
  "location": {
    "name": "Citadel of Ricks",
    "url": "https://rickandmortyapi.com/api/location/3"
  },
  "image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  "episode": [
    "https://rickandmortyapi.com/api/episode/1",
    "https://rickandmortyapi.com/api/episode/2",
    "https://rickandmortyapi.com/api/episode/3"
  ],
  "url": "https://rickandmortyapi.com/api/character/1",
  "created": "2017-11-04T18:48:46.250Z"
}
```

### Campos de la respuesta

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Integer | Identificador único del personaje. Es el mismo valor que se envía en la ruta. |
| `name` | String | Nombre del personaje. |
| `status` | String | Estado vital. Valores posibles: `Alive`, `Dead` o `unknown`. |
| `species` | String | Especie del personaje (por ejemplo, `Human`). |
| `type` | String | Tipo o subespecie. Es una cadena vacía (`""`) cuando no aplica. |
| `gender` | String | Género. Valores posibles: `Female`, `Male`, `Genderless` o `unknown`. |
| `origin` | Object | Lugar de origen. Contiene `name` y `url` (ver tabla siguiente). |
| `location` | Object | Última ubicación conocida. Contiene `name` y `url` (ver tabla siguiente). |
| `image` | String (URL) | Enlace a la imagen del personaje, en formato JPEG de 300 × 300 px. |
| `episode` | Array de String (URL) | Lista de las URL de los episodios en los que aparece el personaje. |
| `url` | String (URL) | Enlace al propio recurso del personaje. |
| `created` | String (fecha ISO 8601, UTC) | Fecha y hora en que el personaje fue creado en la base de datos. |

### Estructura de `origin` y `location`

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | String | Nombre de la ubicación o `unknown` si se desconoce. |
| `url` | String (URL) | Endpoint de la ubicación (`/location/{id}`). Puede ser una cadena vacía si se desconoce la ubicación. |

> **Nota:** `origin` y `location` son referencias. Si necesitas el detalle de la ubicación (tipo, dimensión, residentes), haz una segunda petición a la `url` que contienen. Lo mismo aplica a cada URL de `episode`.

---

## Códigos de respuesta

El código de estado HTTP indica si la petición tuvo éxito. Puedes verlo con `curl -i`.

| Código | Significado | Cuándo ocurre |
| :--- | :--- | :--- |
| `200 OK` | Éxito | El personaje existe y se devuelve su información. |
| `404 Not Found` | No encontrado | El ID no corresponde a un personaje. Por ejemplo, `9999`. |
| `500 Internal Server Error` | Error al procesar la solicitud | La API devuelve este código, por ejemplo, con un ID no numérico como `uno`. |

### 404 Not Found

El ID `9999` no corresponde a ningún personaje. Al verificar el ejemplo, el catálogo devolvía 826 personajes y existía el ID `826`.

**Solicitud que lo provoca:**

```bash
curl -i "https://rickandmortyapi.com/api/character/9999"
```

**Cuerpo de la respuesta:**

```json
{
  "error": "Character not found"
}
```

**Cómo resolverlo:**

1. Revisa que el `id` sea un número entero positivo, sin letras ni espacios.
2. Si no conoces el ID, busca el nombre con `GET /character/?name=rick` y usa el campo `id` del resultado correspondiente.
3. Para consultar el total vigente de personajes, revisa `info.count` en `GET /character`.
4. En tu código, valida `response.ok` (o el código de estado) antes de procesar el JSON, para no tratar el mensaje de error como si fuera un personaje.

Durante la verificación, `POST /character/1` también devolvió `404`, con el cuerpo `{"error":"There is nothing here."}`. Para obtener la ficha, usa `GET`.

### 500 Internal Server Error (ID no numérico)

**Causa:** el `id` enviado no es un número. Aunque `500` suele indicar un fallo del servidor, aquí lo provoca un valor inválido en la ruta.

**Solicitud que lo provoca:**

```bash
curl -i "https://rickandmortyapi.com/api/character/uno"
```

**Cuerpo de la respuesta:**

```json
{
  "error": "Hey! you must provide an id"
}
```

> **Atención:** el mensaje indica que falta el ID incluso cuando la ruta contiene un valor con formato incorrecto.

Para resolverlo, usa un ID entero positivo que corresponda a un personaje. Por ejemplo, usa `/character/1`. Si el ID llega desde un formulario, valida el formato antes de construir la URL.

---

## Recursos relacionados

- Documentación oficial: <https://rickandmortyapi.com/documentation>
- Listar y filtrar personajes: `GET /character`
- Obtener varios personajes a la vez: `GET /character/1,2,3`

## Pruebas manuales en Postman

Esta bitácora corresponde a la API pública. Las pruebas HTTP del portal Next.js están en la [colección de Postman de la aplicación](postman/portal-rick-and-morty.postman_collection.json), con instrucciones de ejecución en el [README](README.md#pruebas-de-la-aplicación-en-postman).

El 21 de noviembre de 2026 se ejecutaron cinco solicitudes `GET` en Postman Desktop contra la API pública, sin autenticación ni cuerpo. Los tiempos corresponden a una ejecución de cada caso.

| Solicitud | Estado observado | Tiempo | Evidencia en el JSON |
| --- | --- | --- | --- |
| `/character/1` | `200 OK` | 98 ms | Devuelve el ID `1`, el nombre `Rick Sanchez` y el estado `Alive`. |
| `/character/9999` | `404 Not Found` | 36 ms | `{"error":"Character not found"}`. |
| `/character/uno` | `500 Internal Server Error` | 33 ms | `{"error":"Hey! you must provide an id"}`. |
| `/character` | `200 OK` | 30 ms | `info.count` es `826`, `info.pages` es `42`, `info.prev` es `null` y el primer ID es `1`. |
| `/character?page=2` | `200 OK` | 27 ms | El primer ID es `21`. `info.prev` apunta a la página 1 e `info.next` apunta a la 3. |

Para repetir las pruebas, abre una solicitud nueva en Postman, selecciona `GET`, añade cada ruta a `https://rickandmortyapi.com/api` y pulsa **Send**. Revisa el código HTTP y el cuerpo en **Response → Body**. Para la paginación, compara `info` y el primer elemento de `results` de las dos últimas consultas.

El `500` se observó al enviar directamente `uno` a la API. El formulario del portal valida el ID antes de enviarlo.
