import { productosDe } from "./catalog.js";

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
    card.innerHTML = `
      <h3>${p.nombre}</h3>
      <p class="tenue">${p.presentacion} — ${p.descripcion}</p>
      <p class="precio">$${p.precio}</p>
      <button class="btn-oro" data-agregar>Agregar</button>`;
    card.querySelector("[data-agregar]").addEventListener("click", () => alAgregar(p));
    grid.appendChild(card);
  }
}
