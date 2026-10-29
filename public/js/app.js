// Lógica del navegador: pide los datos a NUESTRO servidor (/api/...),
// nunca directamente a TheCatAPI, para que la API key no se vea aquí.

const imagen = document.getElementById("imagen-gato");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("boton-gato");
const botonSonido = document.getElementById("boton-sonido");

// ===== Maullido retro con la Web Audio API (sin archivos de audio) =====
let audio;
let silenciado = false;

function maullar() {
  if (silenciado) return;

  // Se crea en el primer clic: el navegador no deja reproducir audio antes
  audio = audio || new AudioContext();
  const ahora = audio.currentTime;

  const oscilador = audio.createOscillator(); // genera el tono
  const volumen = audio.createGain();         // controla qué tan fuerte suena

  oscilador.type = "square"; // onda cuadrada = sonido de videojuego retro

  // "mi" sube de 500 a 900 Hz, "au" baja a 400 Hz
  oscilador.frequency.setValueAtTime(500, ahora);
  oscilador.frequency.linearRampToValueAtTime(900, ahora + 0.15);
  oscilador.frequency.linearRampToValueAtTime(400, ahora + 0.5);

  // Empieza bajito (la onda cuadrada suena fuerte) y se apaga poco a poco
  volumen.gain.setValueAtTime(0.1, ahora);
  volumen.gain.linearRampToValueAtTime(0, ahora + 0.5);

  // Oscilador → volumen → bocinas
  oscilador.connect(volumen);
  volumen.connect(audio.destination);

  oscilador.start(ahora);
  oscilador.stop(ahora + 0.5);
}

// Activa o desactiva el maullido y actualiza el botón
botonSonido.addEventListener("click", () => {
  silenciado = !silenciado;
  botonSonido.textContent = silenciado ? "🔇" : "🔊";
  botonSonido.setAttribute("aria-pressed", silenciado);
  botonSonido.setAttribute("aria-label", silenciado ? "Activar maullido" : "Silenciar maullido");
});

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

boton.addEventListener("click", () => {
  maullar();
  pedirGato();
});

// Mostrar un gato en cuanto abre la página
pedirGato();
