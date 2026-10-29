# Simplemente Gato

App web con estética pixel retro que muestra imágenes de gatos aleatorios usando [TheCatAPI](https://thecatapi.com). Cada vez que presionas el botón **OTRO GATO** aparece un gato nuevo.

## Cómo funciona

La app usa una arquitectura cliente-servidor. El navegador nunca habla directamente con TheCatAPI: le pide el gato a un servidor propio hecho con Node.js y Express, que funciona como proxy y es el único que conoce la API key.

```
Navegador (public/)  →  server.js (/api/gato)  →  TheCatAPI
     sin clave            lee la clave del .env       con clave
```

Así la clave no aparece en el código del navegador ni en el repositorio.

## Requisitos

- [Node.js](https://nodejs.org) 18 o superior
- Una API key gratuita de [TheCatAPI](https://thecatapi.com)

## Instrucciones para ejecutarla

1. Clona el repositorio y entra a la carpeta:
   ```bash
   git clone <url-del-repositorio>
   cd Tarea2
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

> El archivo `.env` está en `.gitignore`, por lo que tu clave nunca se sube al repositorio.

## Manejo de errores

| Caso | Mensaje que ve el usuario |
|---|---|
| Sin conexión a internet | Sin conexión a internet. |
| El servidor no responde | No se pudo conectar con el servidor. |
| Falta la API key | Falta la API key en el servidor. |
| API key inválida | La API key no es válida. |
| Límite de peticiones (429) | Demasiadas peticiones, espera un momento. |
| Respuesta vacía | No se encontraron gatos. |
| La imagen no carga | No se pudo cargar la imagen del gato. |

## Estructura del proyecto

```
Tarea2/
├── public/
│   ├── index.html       ← estructura de la página
│   ├── css/styles.css   ← estilos pixel retro y patrón de gatos
│   ├── js/app.js        ← lógica del botón y mensajes
│   └── img/
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
- Fuente pixel [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) de Google Fonts

## Declaración de uso de IA

### Herramientas utilizadas

| Herramienta | Para qué la usé |
|---|---|
| Claude (Claude Code) | Entender los requisitos de la tarea y planear las partes del proyecto. |
| Claude (Claude Code) | Crear la estructura de carpetas y los archivos base. |
| Claude (Claude Code) | Generar el código del servidor proxy (`server.js`) y del manejo de errores. |
| Claude (Claude Code) | Generar el HTML y CSS a partir del diseño que le describí. |
| Claude (Claude Code) | Conectar el botón con la API (`app.js`) y probar la app en el navegador. |
| Claude (Claude Code) | Inicializar Git, resolver el error de "dubious ownership" y redactar este README. |

### Lo que hice yo sin ayuda de IA

<!-- COMPLETAR: escribe aquí con tus palabras lo que hiciste tú. Ideas: -->
- Elegí la API (TheCatAPI) y el tema de la app.
- Diseñé la página: colores (#170E2C y #5B1F61), el título "Simplemente Gato", la estética pixel retro y la distribución del recuadro y el botón.
- Obtuve mi API key y configuré el archivo `.env`.
- Decidí que la clave no debía ser visible al subir el proyecto a GitHub.
- Revisé y probé la app, y decidí cuándo hacer cada commit.
