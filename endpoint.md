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
| **Parámetro de ruta (path)** | Un valor que va dentro de la URL. En `/character/{id}`, `{id}` se reemplaza por un número real, por ejemplo `/character/1`. |
| **Petición GET** | Una solicitud de solo lectura: pide datos y no modifica nada en el servidor. |
| **JSON** | El formato de texto en que responde la API. Se compone de pares `"clave": valor`. |
| **Código de estado HTTP** | Un número con el que el servidor indica el resultado: `200` significa éxito y `404`, que el recurso no existe. |

---

## Información general

| Propiedad | Valor |
| :--- | :--- |
| URL base | `https://rickandmortyapi.com/api` |
| URL completa del endpoint | `https://rickandmortyapi.com/api/character/{id}` |
| Método HTTP | `GET` (es el único método de la API; otros, como `POST`, devuelven `404`) |
| Credenciales | No se necesitan (sin API key ni token) |
| Protocolo | HTTPS |
| Formato de respuesta | `application/json` |
| Última verificación | 20 de noviembre de 2026 |

---

## Parámetros

| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | Path (ruta) | Integer | Sí | Identificador numérico único del personaje. Existen 826 personajes, ordenados por id (de `1` a `826`). Ejemplo: `1` devuelve a Rick Sanchez. |

Este endpoint no acepta parámetros de consulta (query string). Los filtros (`name`, `status`, `species`, etc.) pertenecen a `GET /character`.

---

## Ejemplo de solicitud

### cURL

Copia y pega el comando tal como está en tu terminal:

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

Se devuelve un único objeto JSON con los datos del personaje. En el ejemplo, la lista `episode` se abrevió: Rick aparece en 51 episodios y la API devuelve las 51 URLs.

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
| `episode` | Array de String (URL) | Lista de URLs de los episodios en los que aparece el personaje. |
| `url` | String (URL) | Enlace al propio recurso del personaje. |
| `created` | String (fecha ISO 8601, UTC) | Fecha y hora en que el personaje fue creado en la base de datos. |

### Estructura de `origin` y `location`

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | String | Nombre de la ubicación. |
| `url` | String (URL) | Endpoint de la ubicación (`/location/{id}`), para consultar sus detalles. |

> **Nota:** `origin` y `location` son referencias. Si necesitas el detalle de la ubicación (tipo, dimensión, residentes), haz una segunda petición a la `url` que contienen. Lo mismo aplica a cada URL de `episode`.

---

## Códigos de respuesta

El código de estado HTTP indica si la petición tuvo éxito. Puedes verlo con `curl -i`.

| Código | Significado | Cuándo ocurre |
| :--- | :--- | :--- |
| `200 OK` | Éxito | El personaje existe y se devuelve su información. |
| `404 Not Found` | No encontrado | El `id` es un número, pero no existe un personaje con él (por ejemplo, `9999`). También se obtiene al usar un método distinto de `GET`. |
| `500 Internal Server Error` | Id no válido | El `id` no es numérico (por ejemplo, `uno`). |

### 404 Not Found

**Causa:** el `id` no corresponde a ningún personaje. El catálogo llega hasta el `826`, así que `/character/9999` no existe.

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
2. Confirma que esté dentro del rango existente (de `1` a `826`). El total vigente se consulta en el campo `info.count` de `GET /character`.
3. Si no conoces el id, búscalo con `GET /character/?name=rick` y usa el campo `id` del resultado.
4. En tu código, valida `response.ok` (o el código de estado) antes de procesar el JSON, para no tratar el mensaje de error como si fuera un personaje.

### 500 Internal Server Error (id no numérico)

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

> **Atención:** el mensaje puede confundir, porque dice que falta el id cuando en realidad se envió uno con formato incorrecto.

**Cómo resolverlo:** reemplaza el texto por un número entero entre `1` y `826`. Por ejemplo, usa `/character/1` en lugar de `/character/uno`. Si el id llega desde un formulario o una variable, valida que sea numérico antes de armar la URL.

---

## Recursos relacionados

- Documentación oficial: <https://rickandmortyapi.com/documentation>
- Listar y filtrar personajes: `GET /character`
- Obtener varios personajes a la vez: `GET /character/1,2,3`