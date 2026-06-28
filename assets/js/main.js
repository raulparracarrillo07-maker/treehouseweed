import { montarPuertaEdad } from "./age-gate.js";
import { renderCasa, renderCuarto, renderDestacados, renderInfo } from "./ui-store.js";
import { carritoVacio, agregar, cambiarCantidad } from "./cart.js";
import { renderCarrito } from "./ui-cart.js";
import { construirMensaje, construirURL } from "./whatsapp.js";

let catalogo, config, carrito = carritoVacio();

function refrescarCarrito() {
  renderCarrito(
    document.getElementById("panel-carrito"),
    document.getElementById("badge-carrito"),
    carrito,
    {
      onCambiar: (id, cant) => { carrito = cambiarCantidad(carrito, id, cant); refrescarCarrito(); },
      onPedir: () => {
        const url = construirURL(config.whatsapp, construirMensaje(carrito, config));
        window.open(url, "_blank");
      },
    }
  );
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
    onEntrar: irACasa,
  });
}

function irACasa() {
  const app = document.getElementById("app");
  renderCasa(app, catalogo, (cuarto) => {
    if (cuarto.tipo === "categoria") return abrirCuarto(cuarto.id);
    abrirInfo(cuarto.id);
  });
  renderDestacados(app, catalogo, (p) => { carrito = agregar(carrito, p); refrescarCarrito(); });
}

function abrirCuarto(categoria) {
  const app = document.getElementById("app");
  renderCuarto(app, catalogo, categoria, (p) => { carrito = agregar(carrito, p); refrescarCarrito(); });
  const volver = document.createElement("button");
  volver.className = "volver";
  volver.textContent = "← Volver a la casa";
  volver.addEventListener("click", irACasa);
  app.appendChild(volver);
}

function abrirInfo(cuartoId) {
  const app = document.getElementById("app");
  renderInfo(app, cuartoId, config);
  const volver = document.createElement("button");
  volver.className = "volver";
  volver.textContent = "← Volver a la casa";
  volver.addEventListener("click", irACasa);
  app.appendChild(volver);
}

init();
