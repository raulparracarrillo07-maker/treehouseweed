import { montarPuertaEdad } from "./age-gate.js";
import { montarIntro } from "./intro.js";
import { iniciarSmooth, revelar } from "./anim.js";
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
    onEntrar: entrarSitio,
  });
}

function entrarSitio() {
  irACasa();        // la tienda se renderiza DEBAJO del recorrido, en el mismo scroll
  iniciarSmooth();  // scroll suave (Lenis)
  montarIntro();    // el video avanza con el scroll; al pasarlo, ya estás en la tienda
}

function irACasa() {
  const app = document.getElementById("app");
  renderCasa(app, catalogo, (cuarto) => {
    if (cuarto.tipo === "categoria") return abrirCuarto(cuarto.id);
    abrirInfo(cuarto.id);
  });
}

// Al elegir una sección, ya entraste: se cierra el recorrido y se navega arriba.
function salirDelRecorrido() {
  document.getElementById("intro").classList.add("oculto");
  document.body.classList.add("en-tienda");
  window.scrollTo(0, 0);
}

function abrirCuarto(categoria) {
  salirDelRecorrido();
  const app = document.getElementById("app");
  renderCuarto(app, catalogo, categoria, (p) => { carrito = agregar(carrito, p); refrescarCarrito(); });
  const volver = document.createElement("button");
  volver.className = "volver";
  volver.textContent = "← Volver a la casa";
  volver.addEventListener("click", irACasa);
  app.appendChild(volver);
}

function abrirInfo(cuartoId) {
  salirDelRecorrido();
  const app = document.getElementById("app");
  renderInfo(app, cuartoId, config);
  const volver = document.createElement("button");
  volver.className = "volver";
  volver.textContent = "← Volver a la casa";
  volver.addEventListener("click", irACasa);
  app.appendChild(volver);
}

init();
