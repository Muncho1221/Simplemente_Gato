// Lógica del navegador: pide los datos a NUESTRO servidor (/api/...),
// nunca directamente a TheCatAPI, para que la API key no se vea aquí.

const imagen = document.getElementById("imagen-gato");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("boton-gato");

// Oculta la imagen y muestra un texto en el recuadro
function mostrarMensaje(texto) {
  imagen.hidden = true;
  mensaje.hidden = false;
  mensaje.textContent = texto;
}

// Muestra un error y vuelve a habilitar el botón para reintentar
function mostrarError(texto) {
  mostrarMensaje(texto);
  boton.disabled = false;
}

async function pedirGato() {
  if (!navigator.onLine) {
    return mostrarError("Sin conexión a internet.");
  }

  boton.disabled = true;
  mostrarMensaje("Cargando gato...");

  let respuesta;
  try {
    respuesta = await fetch("/api/gato");
  } catch {
    // Solo pasa si el navegador no pudo hablar con nuestro servidor
    return mostrarError("No se pudo conectar con el servidor.");
  }

  // El servidor siempre responde JSON; si no, usamos un objeto vacío
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok || !datos.url) {
    return mostrarError(datos.error || "Ocurrió un error inesperado.");
  }

  // La imagen se muestra cuando termina de descargarse (ver "load" abajo)
  imagen.src = datos.url;
}

imagen.addEventListener("load", () => {
  mensaje.hidden = true;
  imagen.hidden = false;
  boton.disabled = false;
});

imagen.addEventListener("error", () => {
  mostrarError("No se pudo cargar la imagen del gato.");
});

boton.addEventListener("click", pedirGato);

// Mostrar un gato en cuanto abre la página
pedirGato();
