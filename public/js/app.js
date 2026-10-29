// Lógica del navegador: pide los datos a NUESTRO servidor (/api/...),
// nunca directamente a TheCatAPI, para que la API key no se vea aquí.

// Pantalla de razas
const pantallaRazas = document.getElementById("pantalla-razas");
const listaRazas = document.getElementById("lista-razas");
const mensajeRazas = document.getElementById("mensaje-razas");
const botonCualquiera = document.getElementById("boton-cualquiera");

// Pantalla de gatos
const pantallaGatos = document.getElementById("pantalla-gatos");
const tituloRaza = document.getElementById("raza-actual");
const botonVolver = document.getElementById("boton-volver");
const imagen = document.getElementById("imagen-gato");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("boton-gato");
const botonSonido = document.getElementById("boton-sonido");

// id de la raza elegida ("" = cualquier raza)
let razaElegida = "";

// Segundos que hay que esperar entre un gato y otro, para no pasar el límite de peticiones de la API
const ESPERA_SEGUNDOS = 8;
let cuentaRegresiva;

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

// Pide algo a nuestro servidor y devuelve el JSON.
// Si algo falla lanza un Error con el mensaje para el usuario.
async function pedirAlServidor(ruta) {
  if (!navigator.onLine) {
    throw new Error("Sin conexión a internet.");
  }

  let respuesta;
  try {
    respuesta = await fetch(ruta);
  } catch {
    // Solo pasa si el navegador no pudo hablar con nuestro servidor
    throw new Error("No se pudo conectar con el servidor.");
  }

  // El servidor siempre responde JSON; si no, usamos un objeto vacío
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.error || "Ocurrió un error inesperado.");
  }
  return datos;
}

// ===== Pantalla de razas =====

// Crea la tarjeta de una raza. Se usa textContent (no innerHTML)
// para que el texto que viene de la API nunca se interprete como HTML.
function crearTarjeta(raza) {
  const tarjeta = document.createElement("li");
  tarjeta.className = "raza";

  const nombre = document.createElement("h3");
  nombre.className = "raza__nombre";
  nombre.textContent = raza.nombre;

  const origen = document.createElement("p");
  origen.className = "raza__dato";
  origen.innerHTML = "<strong>Origen:</strong> ";
  origen.append(raza.origen || "Desconocido");

  const temperamento = document.createElement("p");
  temperamento.className = "raza__dato";
  temperamento.innerHTML = "<strong>Temperamento:</strong> ";
  temperamento.append(raza.temperamento || "Sin datos");

  const descripcion = document.createElement("p");
  descripcion.className = "raza__descripcion";
  descripcion.textContent = raza.descripcion || "";

  const botonVer = document.createElement("button");
  botonVer.className = "boton boton--chico";
  botonVer.type = "button";
  botonVer.textContent = "Ver gatos";
  botonVer.addEventListener("click", () => verGatos(raza.id, raza.nombre));

  tarjeta.append(nombre, origen, temperamento, descripcion, botonVer);
  return tarjeta;
}

async function cargarRazas() {
  let razas;
  try {
    razas = await pedirAlServidor("/api/razas");
  } catch (error) {
    mensajeRazas.textContent = `${error.message} Recarga la página para intentarlo de nuevo.`;
    return;
  }

  listaRazas.append(...razas.map(crearTarjeta));
  mensajeRazas.textContent = `${razas.length} razas disponibles`;
}

// ===== Cambio de pantallas =====

function verGatos(idRaza, nombreRaza) {
  razaElegida = idRaza;
  tituloRaza.textContent = nombreRaza;
  pantallaRazas.hidden = true;
  pantallaGatos.hidden = false;
  window.scrollTo(0, 0);
  maullar();
  pedirGato();
}

botonCualquiera.addEventListener("click", () => verGatos("", "Cualquier raza"));

botonVolver.addEventListener("click", () => {
  pantallaGatos.hidden = true;
  pantallaRazas.hidden = false;
  window.scrollTo(0, 0);
});

// ===== Pantalla de gatos =====

// Oculta la imagen y muestra un texto en el recuadro
function mostrarMensaje(texto) {
  imagen.hidden = true;
  mensaje.hidden = false;
  mensaje.textContent = texto;
}

// ===== Espera entre gatos =====

// Desactiva el botón y muestra "Espera 8", "Espera 7"... hasta llegar a 0
function iniciarEspera() {
  let restantes = ESPERA_SEGUNDOS;
  boton.disabled = true;
  boton.textContent = `Espera ${restantes}`;

  cuentaRegresiva = setInterval(() => {
    restantes--;
    if (restantes > 0) {
      boton.textContent = `Espera ${restantes}`;
    } else {
      terminarEspera();
    }
  }, 1000);
}

// Detiene la cuenta regresiva y deja el botón listo para pedir otro gato
function terminarEspera() {
  clearInterval(cuentaRegresiva);
  boton.textContent = "Otro gato";
  boton.disabled = false;
}

// Muestra un error y vuelve a habilitar el botón para reintentar
function mostrarError(texto) {
  mostrarMensaje(texto);
  terminarEspera();
}

// Muestra la imagen ya descargada y empieza la espera para el siguiente gato
function mostrarImagen() {
  mensaje.hidden = true;
  imagen.hidden = false;
  iniciarEspera();
}

async function pedirGato() {
  // Si veníamos de otra raza con una espera a medias, se cancela
  clearInterval(cuentaRegresiva);
  boton.textContent = "Otro gato";
  boton.disabled = true;
  mostrarMensaje("Cargando gato...");

  const ruta = razaElegida ? `/api/gato?raza=${encodeURIComponent(razaElegida)}` : "/api/gato";

  let datos;
  try {
    datos = await pedirAlServidor(ruta);
  } catch (error) {
    return mostrarError(error.message);
  }

  if (!datos.url) {
    return mostrarError("No se encontraron gatos.");
  }

  // Si la API repite la misma foto, el navegador no vuelve a lanzar "load"
  if (imagen.src === datos.url) {
    return mostrarImagen();
  }

  // La imagen se muestra cuando termina de descargarse (ver "load" abajo)
  imagen.src = datos.url;
}

imagen.addEventListener("load", mostrarImagen);

imagen.addEventListener("error", () => {
  mostrarError("No se pudo cargar la imagen del gato.");
});

boton.addEventListener("click", () => {
  maullar();
  pedirGato();
});

// Al abrir la página se muestran primero las razas
cargarRazas();
