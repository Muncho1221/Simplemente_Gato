// Servidor Express que funciona como proxy:
// lee la API key desde .env y hace las peticiones a TheCatAPI,
// así la clave nunca llega al navegador ni al repositorio.

require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const URL_GATOS = "https://api.thecatapi.com/v1/images/search";

// Sirve la página (HTML, CSS, JS) que está en /public
app.use(express.static("public"));

// Ruta que usa el navegador para pedir un gato aleatorio
app.get("/api/gato", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Falta la API key en el servidor." });
  }

  let respuesta;
  try {
    respuesta = await fetch(URL_GATOS, {
      headers: { "x-api-key": API_KEY },
    });
  } catch {
    // fetch solo lanza error cuando no se pudo conectar (sin internet, DNS, etc.)
    return res.status(503).json({ error: "No se pudo conectar con TheCatAPI." });
  }

  if (respuesta.status === 429) {
    return res.status(429).json({ error: "Demasiadas peticiones, espera un momento." });
  }
  if (respuesta.status === 401 || respuesta.status === 403) {
    return res.status(502).json({ error: "La API key no es válida." });
  }
  if (!respuesta.ok) {
    return res.status(502).json({ error: "TheCatAPI respondió con un error." });
  }

  const datos = await respuesta.json();

  // La API devuelve una lista; si viene vacía no hay gato que mostrar
  if (!Array.isArray(datos) || datos.length === 0) {
    return res.status(404).json({ error: "No se encontraron gatos." });
  }

  res.json({ url: datos[0].url });
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
