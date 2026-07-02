import { montarPuertaEdad } from "./age-gate.js?v=32";
import { montarIntro } from "./intro.js?v=32";
import { montarHumo } from "./humo.js?v=32";
import { montarMonito } from "./monito.js?v=32";
import { iniciarSmooth, revelar } from "./anim.js?v=32";
import { renderCasa, renderCuarto, renderDestacados, renderInfo } from "./ui-store.js?v=32";
import { carritoVacio, agregar, cambiarCantidad } from "./cart.js?v=32";
import { renderCarrito } from "./ui-cart.js?v=32";
import { construirMensaje } from "./whatsapp.js?v=32";

let catalogo, config, carrito = carritoVacio();
let monito;

function refrescarCarrito() {
  renderCarrito(
    document.getElementById("panel-carrito"),
    document.getElementById("badge-carrito"),
    carrito,
    {
      entrega: config.entrega,
      onCambiar: (id, cant) => { carrito = cambiarCantidad(carrito, id, cant); refrescarCarrito(); },
      onPedir: hacerPedido,
    }
  );
}

// El pedido se cierra por Instagram: como IG no deja pre-cargar el mensaje,
// se copia el pedido al portapapeles y se abre el chat para pegarlo.
async function hacerPedido() {
  if (carrito.items.length === 0) return;
  const msg = construirMensaje(carrito, config);
  try { await navigator.clipboard.writeText(msg); } catch (e) { /* sin permiso: igual abrimos el chat */ }
  const ig = config.contacto && config.contacto.instagram;
  const url = ig ? `https://ig.me/m/${ig}` : "https://instagram.com/";
  window.open(url, "_blank");
  mostrarToast("Pedido copiado. Pégalo en el chat de Instagram y envíalo");
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
  document.getElementById("fab-nosotros").addEventListener("click", () => monito.abrir("nosotros"));
  const c = config.contacto || {};
  if (c.instagram) document.getElementById("soc-ig").href = `https://instagram.com/${c.instagram}`;
  if (c.tiktok) document.getElementById("soc-tt").href = `https://tiktok.com/@${c.tiktok}`;
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
  monito = montarMonito(config);
  montarTutorial();
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

  // Tocar al monito abre la charla con el anfitrión.
  const mascota = document.querySelector(".mascota-viva");
  if (mascota) {
    mascota.style.pointerEvents = "auto";
    mascota.style.cursor = "pointer";
    mascota.setAttribute("role", "button");
    mascota.setAttribute("tabindex", "0");
    mascota.setAttribute("aria-label", "Habla con el anfitrión de TreeHouseWeed");
    mascota.addEventListener("click", () => monito.abrir("nosotros"));
    mascota.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); monito.abrir("nosotros"); } });
  }
}

// Mini tutorial: se muestra la primera vez que se llega a la tienda (por sesión).
function montarTutorial() {
  const tuto = document.getElementById("tutorial");
  if (!tuto) return;
  const cerrar = () => { tuto.classList.add("oculto"); document.body.classList.remove("modal-abierto"); };
  tuto.querySelector(".tuto-ok").addEventListener("click", cerrar);
  tuto.addEventListener("click", (e) => { if (e.target === tuto) cerrar(); });
  window.addEventListener("thw:tienda", () => {
    if (sessionStorage.getItem("thw_tuto") === "visto") return;
    sessionStorage.setItem("thw_tuto", "visto");
    tuto.classList.remove("oculto");
    document.body.classList.add("modal-abierto");
  });
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

// Bloqueo del scroll táctil en la tienda final (iOS ignora overflow:hidden).
document.addEventListener("touchmove", (e) => {
  const b = document.body.classList;
  if (b.contains("interior-visible") && !b.contains("en-seccion") && !b.contains("modal-abierto")) {
    e.preventDefault();
  }
}, { passive: false });

init();
