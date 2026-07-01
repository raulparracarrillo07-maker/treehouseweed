import { montarPuertaEdad } from "./age-gate.js?v=9";
import { montarIntro } from "./intro.js?v=9";
import { montarHumo } from "./humo.js?v=9";
import { iniciarSmooth, revelar } from "./anim.js?v=9";
import { renderCasa, renderCuarto, renderDestacados, renderInfo } from "./ui-store.js?v=9";
import { carritoVacio, agregar, cambiarCantidad } from "./cart.js?v=9";
import { renderCarrito } from "./ui-cart.js?v=9";
import { construirMensaje, construirURL } from "./whatsapp.js?v=9";

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
  document.getElementById("fab-whatsapp").href = construirURL(config.whatsapp, `Hola ${config.marca}, tengo una duda.`);
}

async function init() {
  config = await fetch("data/config.json").then((r) => r.json());
  catalogo = await fetch("data/productos.json").then((r) => r.json());
  cablearFabs();
  refrescarCarrito();
  montarPuertaEdad({
    storage: localStorage,
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

// Vuelve a los cartelones sobre la última toma (final del recorrido).
function volverACartelones() {
  document.getElementById("app").innerHTML = "";
  const intro = document.getElementById("intro");
  intro.classList.remove("oculto");
  document.body.classList.add("interior-visible", "en-tienda");
  const destino = intro.offsetTop + intro.offsetHeight - window.innerHeight;
  window.scrollTo(0, destino);
}

// Al elegir una sección se cierra el recorrido y se ve esa sección arriba.
function salirDelRecorrido() {
  document.getElementById("intro").classList.add("oculto");
  document.body.classList.add("en-tienda");
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
