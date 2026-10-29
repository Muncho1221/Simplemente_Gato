# Simplemente Gato

App web con estética pixel retro que muestra las razas de gatos y fotos de gatos usando [TheCatAPI](https://thecatapi.com).

## Funciones

- **Pantalla de razas:** al abrir la app se muestran más de 100 razas de gatos, cada una con su origen, temperamento y descripción en español.
- **Gatos por raza:** al elegir una raza se ven fotos de gatos de esa raza. También se pueden ver gatos de cualquier raza.
- **Botón OTRO GATO:** muestra una foto nueva cada vez que se presiona. Después de cada gato hay que esperar 8 segundos (el botón muestra una cuenta regresiva) para no pasar el límite de peticiones de la API.
- **Maullido retro:** el botón suena con un maullido de 8 bits generado con la Web Audio API (sin archivos de audio). Un botón 🔊/🔇 permite silenciarlo.
- **Manejo de errores:** la app avisa si no hay conexión, si la API no responde o si se llega al límite de peticiones.

## Cómo funciona

La app usa una arquitectura cliente-servidor. El navegador nunca habla directamente con TheCatAPI: le pide los datos a un servidor propio hecho con Node.js y Express, que funciona como proxy y es el único que conoce la API key.

```
Navegador (public/)  →  server.js (/api/...)  →  TheCatAPI
     sin clave            lee la clave del .env      con clave
```

Así la clave no aparece en el código del navegador ni en el repositorio.

El servidor tiene dos rutas:

| Ruta | Qué devuelve |
|---|---|
| `GET /api/razas` | La lista de razas, traducida al español con `data/razas-es.json` |
| `GET /api/gato` | Un gato aleatorio. Con `?raza=<id>` (ej. `?raza=pers`) solo de esa raza |

TheCatAPI solo da los textos de las razas en inglés, por eso el servidor los combina con las traducciones del archivo `data/razas-es.json`. Si una raza no tiene traducción, se muestra en inglés.

## Requisitos

- [Node.js](https://nodejs.org) 18 o superior
- Una API key gratuita de [TheCatAPI](https://thecatapi.com)

## Instrucciones para ejecutarla

1. Clona el repositorio y entra a la carpeta:
   ```bash
   git clone https://github.com/Muncho1221/Simplemente_Gato.git
   cd Simplemente_Gato
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea el archivo `.env` copiando la plantilla:
   ```bash
   cp .env.example .env
   ```
4. Abre `.env` y pega tu clave después de `API_KEY=` (sin comillas ni espacios).
5. Inicia el servidor:
   ```bash
   npm start
   ```
6. Abre [http://localhost:3000](http://localhost:3000) en el navegador.

> **Importante:** la app no funciona abriendo `index.html` directamente (doble clic), porque las rutas `/api/...` solo existen cuando el servidor está encendido.
>
> El archivo `.env` está en `.gitignore`, por lo que tu clave nunca se sube al repositorio.

## Manejo de errores

| Caso | Mensaje que ve el usuario |
|---|---|
| Sin conexión a internet | Sin conexión a internet. |
| El servidor no responde | No se pudo conectar con el servidor. |
| Falta la API key | Falta la API key en el servidor. |
| API key inválida | La API key no es válida. |
| Límite de peticiones (429) | Demasiadas peticiones, espera un momento. (Además, la espera de 8 segundos entre gatos ayuda a no llegar a este límite.) |
| Respuesta vacía | No se encontraron gatos. / No se encontraron razas. |
| Raza con id inválido | Raza no válida. |
| La imagen no carga | No se pudo cargar la imagen del gato. |

## Estructura del proyecto

```
Simplemente_Gato/
├── public/
│   ├── index.html       ← estructura de la página (pantalla de razas y de gatos)
│   ├── css/styles.css   ← estilos pixel retro y patrón de gatos
│   ├── js/app.js        ← lógica de las pantallas, botones, sonido y mensajes
│   └── img/
├── data/razas-es.json   ← traducciones al español de las razas
├── docs/bitacora.md     ← bitácora de programación con IA
├── server.js            ← servidor proxy que usa la API key
├── .env.example         ← plantilla de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## Tecnologías

- HTML, CSS y JavaScript
- Node.js con Express y dotenv
- TheCatAPI
- Web Audio API (para el maullido)
- Fuentes pixel [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) y [VT323](https://fonts.google.com/specimen/VT323) de Google Fonts

## Declaración de uso de IA

Para la creación de este proyecto se usó Claude Pro :P

### Herramientas utilizadas

| Herramienta | Para qué la usé |
|---|---|
| Claude (Claude Code) | Entender los requisitos de la tarea y planear las partes del proyecto. |
| Claude (Claude Code) | Crear la estructura de carpetas y los archivos base. |
| Claude (Claude Code) | Generar el código del servidor proxy (`server.js`) y del manejo de errores. |
| Claude (Claude Code) | Generar el HTML y CSS a partir del diseño que le describí. |
| Claude (Claude Code) | Conectar los botones con la API (`app.js`) y probar la app en el navegador. |
| Claude (Claude Code) | Explicarme la Web Audio API y generar el maullido retro con el botón de silencio. |
| Claude (Claude Code) | Crear la pantalla de razas y traducir las descripciones de las razas al español. |
| Claude (Claude Code) | Inicializar Git, explicarme cómo hacer commits y resolver errores (`dubious ownership`, `EADDRINUSE`). |
| Claude (Claude Code) | Redactar este README. |

### Lo que hice yo sin ayuda de IA

<!-- COMPLETAR: revisa esta lista y escríbela con tus palabras -->
- Elegí la API (TheCatAPI) y el tema de la app.
- Diseñé la página: colores (#170E2C y #5B1F61), el título "Simplemente Gato", la estética pixel retro y la distribución del recuadro y el botón.
- Decidí agregar el maullido, el botón de silencio, la pantalla de razas y que las razas estuvieran en español.
- Obtuve mi API key y configuré el archivo `.env`.
- Decidí que la clave no debía ser visible al subir el proyecto a GitHub.
- Hice yo mismo los commits y los subí a GitHub, y probé la app.
