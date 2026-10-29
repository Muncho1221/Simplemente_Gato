// Servidor Express que funciona como proxy:
// lee la API key desde .env y hace las peticiones a TheCatAPI,
// así la clave nunca llega al navegador ni al repositorio.

require("dotenv").config();
const express = require("express");

// Traducciones al español de cada raza, por su id (TheCatAPI solo da los textos en inglés)
const traducciones = require("./data/razas-es.json");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const URL_API = "https://api.thecatapi.com/v1";

// Sirve la página (HTML, CSS, JS) que está en /public
app.use(express.static("public"));

// Hace una petición a TheCatAPI con la clave y maneja los errores.
// Si algo falla responde al navegador con el error y devuelve null.
async function consultarCatApi(ruta, res) {
  if (!API_KEY) {
    res.status(500).json({ error: "Falta la API key en el servidor." });
    return null;
  }

  let respuesta;
  try {
    respuesta = await fetch(URL_API + ruta, {
      headers: { "x-api-key": API_KEY },
    });
  } catch {
    // fetch solo lanza error cuando no se pudo conectar (sin internet, DNS, etc.)
    res.status(503).json({ error: "No se pudo conectar con TheCatAPI." });
    return null;
  }

  if (respuesta.status === 429) {
    res.status(429).json({ error: "Demasiadas peticiones, espera un momento." });
    return null;
  }
  if (respuesta.status === 401 || respuesta.status === 403) {
    res.status(502).json({ error: "La API key no es válida." });
    return null;
  }
  if (!respuesta.ok) {
    res.status(502).json({ error: "TheCatAPI respondió con un error." });
    return null;
  }

  return respuesta.json();
}

// Lista de razas con su información
app.get("/api/razas", async (req, res) => {
  const datos = await consultarCatApi("/breeds", res);
  if (!datos) return;

  if (!Array.isArray(datos) || datos.length === 0) {
    return res.status(404).json({ error: "No se encontraron razas." });
  }

  // Solo mandamos al navegador los campos que usa la página, en español.
  // Si una raza nueva aún no tiene traducción, se queda el texto en inglés.
  const razas = datos.map((raza) => {
    const es = traducciones[raza.id] || {};
    return {
      id: raza.id,
      nombre: es.nombre || raza.name,
      origen: es.origen || raza.origin,
      temperamento: es.temperamento || raza.temperament,
      descripcion: es.descripcion || raza.description,
    };
  });

  // Ordenadas alfabéticamente por su nombre en español
  razas.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  res.json(razas);
});

// Un gato aleatorio; con ?raza=<id> solo de esa raza
app.get("/api/gato", async (req, res) => {
  const raza = req.query.raza;
  const parametros = new URLSearchParams();

  if (raza) {
    // Los id de raza son de 4 letras (ej. "beng"); rechazamos cualquier otra cosa
    if (!/^[a-z]{3,5}$/.test(raza)) {
      return res.status(400).json({ error: "Raza no válida." });
    }
    parametros.set("breed_ids", raza);
  }

  const datos = await consultarCatApi(`/images/search?${parametros}`, res);
  if (!datos) return;

  // La API devuelve una lista; si viene vacía no hay gato que mostrar
  if (!Array.isArray(datos) || datos.length === 0) {
    return res.status(404).json({ error: "No se encontraron gatos." });
  }

  res.json({ url: datos[0].url });
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
