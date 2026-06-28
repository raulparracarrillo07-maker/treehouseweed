import { productosDe, destacados } from "./catalog.js";

const CUARTOS = [
  { id: "mas-vendidos", nombre: "Más vendidos", tipo: "categoria" },
  { id: "rolados", nombre: "Rolados", tipo: "categoria" },
  { id: "prerrolados", nombre: "Prerrolados", tipo: "categoria" },
  { id: "extractos", nombre: "Extractos", tipo: "categoria" },
  { id: "plumas", nombre: "Plumas", tipo: "categoria" },
  { id: "comestibles", nombre: "Comestibles", tipo: "categoria" },
];

// Posiciones (centro %, sobre la imagen del interior): 3 hileras de 2, colgando
// frente a la ventana, dejando ver la galaxia arriba y el atardecer abajo.
const POS = [
  { x: 33, y: 31 }, { x: 67, y: 31 },
  { x: 33, y: 47 }, { x: 67, y: 47 },
  { x: 33, y: 63 }, { x: 67, y: 63 },
];

export function renderCasa(contenedor, catalogo, alElegirCuarto) {
  contenedor.innerHTML = `
    <section class="escenario">
      <div class="escena-header">
        <p class="casa-bienvenida">Casa del árbol</p>
        <h2 class="casa-titulo">La tienda</h2>
      </div>
    </section>`;
  const esc = contenedor.querySelector(".escenario");
  CUARTOS.forEach((cuarto, i) => {
    const pos = POS[i % POS.length];
    const c = document.createElement("button");
    c.className = "cartelon";
    c.style.left = pos.x + "%";
    c.style.top = pos.y + "%";
    c.style.setProperty("--n", String(i % 6));
    c.style.setProperty("--d", (550 + i * 130) + "ms");

    const cuerdas = document.createElement("span");
    cuerdas.className = "cartelon-cuerdas";

    const cuerpo = document.createElement("span");
    cuerpo.className = "cartelon-cuerpo";

    const arte = document.createElement("span");
    arte.className = "cartelon-arte";

    const nombre = document.createElement("span");
    nombre.className = "cartelon-nombre";
    nombre.textContent = cuarto.nombre;

    cuerpo.appendChild(arte);
    cuerpo.appendChild(nombre);
    c.appendChild(cuerdas);
    c.appendChild(cuerpo);
    c.addEventListener("click", () => {
      if (c.classList.contains("empujado")) return;
      c.classList.add("empujado");
      setTimeout(() => alElegirCuarto(cuarto), 430);
    });
    esc.appendChild(c);
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
