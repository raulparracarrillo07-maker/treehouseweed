import { productosDe, destacados } from "./catalog.js";

const CUARTOS = [
  { id: "rolados", nombre: "Rolados", tipo: "categoria" },
  { id: "prerrolados", nombre: "Prerrolados", tipo: "categoria" },
  { id: "extractos", nombre: "Extractos", tipo: "categoria" },
  { id: "nosotros", nombre: "Nosotros", tipo: "info" },
  { id: "pedido", nombre: "Pedido", tipo: "info" },
];

export function renderCasa(contenedor, catalogo, alElegirCuarto) {
  contenedor.innerHTML = `<h2>La casa del árbol</h2><div class="cuartos"></div>`;
  const grid = contenedor.querySelector(".cuartos");
  for (const cuarto of CUARTOS) {
    const card = document.createElement("button");
    card.className = "cuarto";
    card.textContent = cuarto.nombre;
    card.addEventListener("click", () => alElegirCuarto(cuarto));
    grid.appendChild(card);
  }
}

export function renderCuarto(contenedor, catalogo, categoria, alAgregar) {
  const productos = productosDe(catalogo, categoria);
  contenedor.innerHTML = `<h2>${categoria}</h2><div class="productos"></div>`;
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
