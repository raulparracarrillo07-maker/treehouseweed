import { montarPuertaEdad } from "./age-gate.js";
import { renderCasa, renderCuarto } from "./ui-store.js";
import { carritoVacio, agregar } from "./cart.js";

let catalogo, config, carrito = carritoVacio();

async function init() {
  config = await fetch("data/config.json").then((r) => r.json());
  catalogo = await fetch("data/productos.json").then((r) => r.json());
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
    if (cuarto.tipo === "categoria") abrirCuarto(cuarto.id);
  });
}

function abrirCuarto(categoria) {
  const app = document.getElementById("app");
  renderCuarto(app, catalogo, categoria, (p) => { carrito = agregar(carrito, p); });
  const volver = document.createElement("button");
  volver.className = "volver";
  volver.textContent = "← Volver a la casa";
  volver.addEventListener("click", irACasa);
  app.appendChild(volver);
}

init();
