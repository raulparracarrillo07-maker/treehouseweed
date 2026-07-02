import { montarPuertaEdad } from "./age-gate.js?v=10";
import { montarIntro } from "./intro.js?v=10";
import { montarHumo } from "./humo.js?v=10";
import { iniciarSmooth, revelar } from "./anim.js?v=10";
import { renderCasa, renderCuarto, renderDestacados, renderInfo } from "./ui-store.js?v=10";
import { carritoVacio, agregar, cambiarCantidad } from "./cart.js?v=10";
import { renderCarrito } from "./ui-cart.js?v=10";
import { construirMensaje, construirURL } from "./whatsapp.js?v=10";

let catalogo, config, carrito = carritoVacio();

function refrescarCarrito() {
  renderCarrito(
    document.getElementById("panel-carrito"),
    document.getElementById("badge-carrito"),
    carrito,
    {
      entrega: config.entrega,
      onCambiar: (id, cant) => { carrito = cambiarCantidad(carrito, id, cant); refrescarCarrito(); },
      onPedir: () => {
        const url = construirURL(config.whatsapp, construirMensaje(carrito, config));
        window.open(url, "_blank");
      },
    }
  );
}

let toastTimer;
function mostrarToast(texto) {
  const el = document.getElementById("toast");
  el.innerHTML = texto;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 1600);
}

// Agrega al carrito con feedback: toast + rebote del badge.
function agregarConFeedback(p) {
  carrito = agregar(carrito, p);
  refrescarCarrito();
  mostrarToast(`Agregado <span class="oro">${p.nombre}</span>`);
  const fab = document.getElementById("fab-carrito");
  fab.classList.remove("rebote");
  void fab.offsetWidth;   // reinicia la animación
  fab.classList.add("rebote");
}

function cablearFabs() {
  document.getElementById("fab-carrito").addEventListener("click", () => {
    document.getElementById("panel-carrito").classList.toggle("oculto");
  });
  document.getElementById("fab-nosotros").addEventListener("click", () => abrirInfo("nosotros"));
  document.getElementById("fab-whatsapp").href = construirURL(config.whatsapp, `Hola ${config.marca}, tengo una duda.`);
}

// Polvo dorado flotando en la puerta de edad (detalle premium del inicio).
function sembrarMotas() {
  const cont = document.querySelector(".puerta-motas");
  if (!cont) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 16; i++) {
    const m = document.createElement("span");
    m.className = "mota";
    const s = 3 + Math.random() * 5;
    m.style.setProperty("--s", s.toFixed(1) + "px");
    m.style.left = (Math.random() * 100).toFixed(1) + "%";
    m.style.setProperty("--dur", (9 + Math.random() * 10).toFixed(1) + "s");
    m.style.setProperty("--delay", (-Math.random() * 12).toFixed(1) + "s");
    m.style.setProperty("--dx", ((Math.random() - 0.5) * 80).toFixed(0) + "px");
    cont.appendChild(m);
  }
}

async function init() {
  config = await fetch("data/config.json").then((r) => r.json());
  catalogo = await fetch("data/productos.json").then((r) => r.json());
  cablearFabs();
  sembrarMotas();
  refrescarCarrito();
  // sessionStorage: la verificación de edad se pide una vez por sesión de
  // navegador (al volver a abrirlo, vuelve a preguntar). Más correcto para
  // un producto solo para adultos que recordarlo para siempre.
  montarPuertaEdad({
    storage: sessionStorage,
    overlay: document.getElementById("puerta-edad"),
    edadMinima: config.edadMinima,
    onEntrar: entrarSitio,
  });
}

function entrarSitio() {
  const capa = document.getElementById("marcos-capa");
  renderCasa(capa, catalogo, (cuarto) => {
    if (cuarto.tipo === "categoria") return abrirCuarto(cuarto.id);
    abrirInfo(cuarto.id);
  });
  montarIntro();    // el video avanza con el scroll; al final aparecen los cartelones
  montarHumo(document.getElementById("humo-canvas"));
}

function cerrarCarrito() {
  document.getElementById("panel-carrito").classList.add("oculto");
}

// Vuelve a la tienda final (imagen con los paneles). Se ve la imagen fija,
// sin carrito ni juego de scroll.
function volverACartelones() {
  document.getElementById("app").innerHTML = "";
  cerrarCarrito();
  document.getElementById("intro").classList.remove("oculto");
  document.body.classList.remove("en-seccion");
  document.body.classList.add("interior-visible");
  window.scrollTo(0, 0);
}

// Al elegir una sección se oculta la tienda final y se ve esa sección arriba,
// con scroll normal y el carrito disponible.
function salirDelRecorrido() {
  cerrarCarrito();
  document.getElementById("intro").classList.add("oculto");
  document.body.classList.remove("interior-visible");
  document.body.classList.add("en-seccion");
  window.scrollTo(0, 0);
}

function abrirCuarto(categoria) {
  salirDelRecorrido();
  const app = document.getElementById("app");
  renderCuarto(app, catalogo, categoria, agregarConFeedback);
  const volver = document.createElement("button");
  volver.className = "volver";
  volver.textContent = "← Volver a la tienda";
  volver.addEventListener("click", volverACartelones);
  app.appendChild(volver);
}

function abrirInfo(cuartoId) {
  salirDelRecorrido();
  const app = document.getElementById("app");
  renderInfo(app, cuartoId, config);
  const volver = document.createElement("button");
  volver.className = "volver";
  volver.textContent = "← Volver a la tienda";
  volver.addEventListener("click", volverACartelones);
  app.appendChild(volver);
}

init();
