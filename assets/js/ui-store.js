import { productosDe, destacados } from "./catalog.js?v=9";

// Cada sección va sobre el estante que le corresponde por producto:
// fila de arriba = flores / pre-rolls / vapes; fila de abajo = extractos /
// edibles / smoke shop.
const CUARTOS = [
  { id: "flores", nombre: "Flores", tipo: "categoria" },
  { id: "pre-rolls", nombre: "Pre-rolls", tipo: "categoria" },
  { id: "vapes", nombre: "Vapes", tipo: "categoria" },
  { id: "extractos", nombre: "Extractos", tipo: "categoria" },
  { id: "edibles", nombre: "Edibles", tipo: "categoria" },
  { id: "smoke-shop", nombre: "Smoke Shop", tipo: "categoria" },
];

// Rectángulo clickeable de cada panel (centro x/y + ancho/alto, en % sobre
// la imagen de la tienda), medido uno por uno sobre tienda-final.png.
const POS = [
  { x: 14.0, y: 30.0, w: 23.0, h: 19.0 }, // flores (sup-izq)
  { x: 14.25, y: 52.0, w: 23.5, h: 19.0 }, // pre-rolls (med-izq)
  { x: 85.75, y: 30.0, w: 23.5, h: 19.0 }, // vapes (sup-der)
  { x: 86.0, y: 51.5, w: 24.0, h: 19.0 }, // extractos (med-der)
  { x: 11.5, y: 71.75, w: 21.0, h: 20.5 }, // edibles (inf-izq)
  { x: 87.5, y: 72.75, w: 23.0, h: 19.5 }, // smoke shop (inf-der)
];

// Pone una zona invisible clickeable sobre cada panel de la imagen
// (los nombres ya vienen grabados en neón dentro de la propia imagen).
export function renderCasa(contenedor, catalogo, alElegirCuarto) {
  contenedor.innerHTML = "";
  CUARTOS.forEach((cuarto, i) => {
    const pos = POS[i] || POS[POS.length - 1];
    const b = document.createElement("button");
    b.className = "marco";
    b.style.setProperty("--x", pos.x);
    b.style.setProperty("--y", pos.y);
    b.style.setProperty("--w", pos.w);
    b.style.setProperty("--h", pos.h);
    b.setAttribute("aria-label", cuarto.nombre);
    b.addEventListener("click", () => {
      if (b.classList.contains("empujado")) return;
      b.classList.add("empujado");
      setTimeout(() => alElegirCuarto(cuarto), 180);
    });
    contenedor.appendChild(b);
  });
}

const NOMBRE_CAT = {
  "flores": "Flores", "pre-rolls": "Pre-rolls", "vapes": "Vapes",
  "extractos": "Extractos", "edibles": "Edibles", "smoke-shop": "Smoke Shop",
};

export function renderCuarto(contenedor, catalogo, categoria, alAgregar) {
  const productos = productosDe(catalogo, categoria);
  const titulo = NOMBRE_CAT[categoria] || categoria;
  const seccion = document.createElement("section");
  seccion.className = "seccion-cat";
  seccion.innerHTML = `
    <div class="cat-header">
      <span class="cat-eyebrow">TreeHouseWeed</span>
      <h2>${titulo}<span class="cat-conteo">${productos.length} ${productos.length === 1 ? "opción" : "opciones"}</span></h2>
    </div>
    <div class="productos"></div>`;
  contenedor.appendChild(seccion);
  const grid = seccion.querySelector(".productos");

  for (const p of productos) {
    const card = document.createElement("article");
    card.className = "producto";

    const pres = document.createElement("span");
    pres.className = "pres";
    pres.textContent = p.presentacion;

    const nombre = document.createElement("h3");
    nombre.textContent = p.nombre;

    const detalle = document.createElement("p");
    detalle.className = "tenue";
    detalle.textContent = p.descripcion;

    const fila = document.createElement("div");
    fila.className = "precio-fila";
    const precio = document.createElement("span");
    precio.className = "precio";
    precio.textContent = `$${p.precio.toLocaleString("es-MX")}`;
    const btn = document.createElement("button");
    btn.className = "btn-add";
    btn.dataset.agregar = "";
    btn.textContent = "Agregar";
    btn.addEventListener("click", () => alAgregar(p));
    fila.appendChild(precio);
    fila.appendChild(btn);

    card.appendChild(pres);
    card.appendChild(nombre);
    card.appendChild(detalle);
    card.appendChild(fila);
    grid.appendChild(card);
  }
}

export function renderDestacados(contenedor, catalogo, alAgregar) {
  const items = destacados(catalogo);
  if (items.length === 0) return;

  const seccion = document.createElement("section");
  seccion.innerHTML = `<h3 class="oro">Más vendidos</h3><div class="productos"></div>`;
  const grid = seccion.querySelector(".productos");

  for (const p of items) {
    const card = document.createElement("article");
    card.className = "producto";

    const titulo = document.createElement("h3");
    titulo.textContent = p.nombre;

    const presentacion = document.createElement("p");
    presentacion.className = "tenue";
    presentacion.textContent = p.presentacion;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `$${p.precio}`;

    const btn = document.createElement("button");
    btn.className = "btn-oro";
    btn.dataset.agregar = "";
    btn.textContent = "Agregar";
    btn.addEventListener("click", () => alAgregar(p));

    card.appendChild(titulo);
    card.appendChild(presentacion);
    card.appendChild(precio);
    card.appendChild(btn);
    grid.appendChild(card);
  }

  contenedor.prepend(seccion);
}

export function renderInfo(contenedor, cuartoId, config) {
  if (cuartoId === "nosotros") {
    contenedor.innerHTML = `<h2>Nosotros</h2>
      <p class="tenue">En TreeHouseWeed cuidamos cada producto. Calidad, sabor y confianza, directo a tu puerta.</p>`;
  } else {
    contenedor.innerHTML = `<h2>Cómo pedir</h2>
      <p>Arma tu carrito y confirma por WhatsApp. Sin pagos en línea.</p>`;

    const zonaP = document.createElement("p");
    const zonaStrong = document.createElement("strong");
    zonaStrong.textContent = "Zona de entrega: ";
    zonaP.appendChild(zonaStrong);
    zonaP.appendChild(document.createTextNode(config.entrega.zona));
    contenedor.appendChild(zonaP);

    const horarioP = document.createElement("p");
    const horarioStrong = document.createElement("strong");
    horarioStrong.textContent = "Horario: ";
    horarioP.appendChild(horarioStrong);
    horarioP.appendChild(document.createTextNode(config.entrega.horario));
    contenedor.appendChild(horarioP);
  }
}
