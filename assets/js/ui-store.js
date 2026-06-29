import { productosDe, destacados } from "./catalog.js?v=2";

const CUARTOS = [
  { id: "mas-vendidos", nombre: "Más vendidos", tipo: "categoria" },
  { id: "rolados", nombre: "Rolados", tipo: "categoria" },
  { id: "prerrolados", nombre: "Prerrolados", tipo: "categoria" },
  { id: "extractos", nombre: "Extractos", tipo: "categoria" },
  { id: "plumas", nombre: "Plumas", tipo: "categoria" },
  { id: "comestibles", nombre: "Comestibles", tipo: "categoria" },
];

// Centros de los 6 marcos de madera de la imagen (en % sobre el cuadro de la
// tienda). Rejilla 3 columnas x 2 filas, en orden de lectura.
const POS = [
  { x: 20.5, y: 36 }, { x: 50, y: 36 }, { x: 79, y: 36 },
  { x: 20.5, y: 67.3 }, { x: 50, y: 67.3 }, { x: 79, y: 67.3 },
];

// Escribe el nombre de cada sección sobre su marco de madera en la imagen.
export function renderCasa(contenedor, catalogo, alElegirCuarto) {
  contenedor.innerHTML = "";
  CUARTOS.forEach((cuarto, i) => {
    const pos = POS[i] || POS[POS.length - 1];
    const b = document.createElement("button");
    b.className = "marco";
    b.style.setProperty("--x", pos.x);
    b.style.setProperty("--y", pos.y);
    b.style.setProperty("--d", (i * 90) + "ms");
    b.textContent = cuarto.nombre;
    b.addEventListener("click", () => {
      if (b.classList.contains("empujado")) return;
      b.classList.add("empujado");
      setTimeout(() => alElegirCuarto(cuarto), 180);
    });
    contenedor.appendChild(b);
  });
}

export function renderCuarto(contenedor, catalogo, categoria, alAgregar) {
  const productos = productosDe(catalogo, categoria);
  const titulo = categoria.charAt(0).toUpperCase() + categoria.slice(1);
  contenedor.innerHTML = `<h2>${titulo}</h2><div class="productos"></div>`;
  const grid = contenedor.querySelector(".productos");
  for (const p of productos) {
    const card = document.createElement("article");
    card.className = "producto";

    const titulo = document.createElement("h3");
    titulo.textContent = p.nombre;

    const detalle = document.createElement("p");
    detalle.className = "tenue";
    detalle.textContent = `${p.presentacion} — ${p.descripcion}`;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `$${p.precio}`;

    const btn = document.createElement("button");
    btn.className = "btn-oro";
    btn.dataset.agregar = "";
    btn.textContent = "Agregar";
    btn.addEventListener("click", () => alAgregar(p));

    card.appendChild(titulo);
    card.appendChild(detalle);
    card.appendChild(precio);
    card.appendChild(btn);
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
