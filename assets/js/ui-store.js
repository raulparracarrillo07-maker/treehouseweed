import { productosDe, destacados } from "./catalog.js?v=11";

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
  { x: 14.0, y: 29.5, w: 23.0, h: 20.0 }, // flores (sup-izq)
  { x: 14.25, y: 51.0, w: 23.5, h: 20.5 }, // pre-rolls (med-izq)
  { x: 85.75, y: 29.5, w: 23.5, h: 19.5 }, // vapes (sup-der)
  { x: 86.0, y: 51.5, w: 24.0, h: 19.0 }, // extractos (med-der)
  { x: 11.5, y: 71.5, w: 21.0, h: 20.5 }, // edibles (inf-izq)
  { x: 87.5, y: 72.5, w: 23.0, h: 19.5 }, // smoke shop (inf-der)
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

const money = (n) => `$${Number(n).toLocaleString("es-MX")}`;

// Extrae el tipo (Indica/Sativa/Híbrida) del inicio de la descripción y
// devuelve { tipo, resto } para pintar el badge y limpiar el texto.
function partirTipo(desc = "") {
  const m = desc.match(/^(Indica|Sativa|Híbrida)\s*·?\s*(.*)$/i);
  if (!m) return { tipo: null, resto: desc };
  return { tipo: m[1], resto: m[2] };
}

// Agrupa las presentaciones del mismo producto (mismo nombre) en un solo
// grupo para mostrarlas como una tarjeta con chips de tamaño.
function agrupar(productos) {
  const grupos = [];
  const idx = new Map();
  for (const p of productos) {
    if (!idx.has(p.nombre)) { idx.set(p.nombre, grupos.length); grupos.push({ nombre: p.nombre, desc: p.descripcion, items: [] }); }
    grupos[idx.get(p.nombre)].items.push(p);
  }
  return grupos;
}

export function renderCuarto(contenedor, catalogo, categoria, alAgregar) {
  const productos = productosDe(catalogo, categoria);
  const grupos = agrupar(productos);
  const titulo = NOMBRE_CAT[categoria] || categoria;
  const seccion = document.createElement("section");
  seccion.className = "seccion-cat";
  seccion.innerHTML = `
    <div class="cat-header">
      <span class="cat-eyebrow">TreeHouseWeed</span>
      <h2>${titulo}<span class="cat-conteo">${grupos.length} ${grupos.length === 1 ? "producto" : "productos"}</span></h2>
    </div>
    <img class="cat-marca" src="assets/img/logo/treehouseweed-logo-transparente.png" alt="" aria-hidden="true" />
    <div class="productos"></div>`;
  contenedor.appendChild(seccion);
  const grid = seccion.querySelector(".productos");

  for (const g of grupos) {
    const { tipo, resto } = partirTipo(g.desc);
    const card = document.createElement("article");
    card.className = "producto";

    if (tipo) {
      const b = document.createElement("span");
      b.className = "tipo tipo-" + tipo.toLowerCase().replace("í", "i");
      b.textContent = tipo;
      card.appendChild(b);
    }

    const nombre = document.createElement("h3");
    nombre.textContent = g.nombre;
    card.appendChild(nombre);

    if (resto) {
      const detalle = document.createElement("p");
      detalle.className = "tenue";
      detalle.textContent = resto;
      card.appendChild(detalle);
    }

    // Chips de presentación (uno por variante). Al elegir cambia el precio.
    let elegido = g.items[0];
    const precio = document.createElement("span");
    precio.className = "precio";

    if (g.items.length > 1) {
      const chips = document.createElement("div");
      chips.className = "chips";
      g.items.forEach((it, i) => {
        const chip = document.createElement("button");
        chip.className = "chip" + (i === 0 ? " activo" : "");
        chip.textContent = it.presentacion;
        chip.addEventListener("click", () => {
          elegido = it;
          chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("activo"));
          chip.classList.add("activo");
          precio.textContent = money(it.precio);
        });
        chips.appendChild(chip);
      });
      card.appendChild(chips);
    } else {
      const pres = document.createElement("span");
      pres.className = "pres";
      pres.textContent = g.items[0].presentacion;
      card.insertBefore(pres, nombre);
    }

    const fila = document.createElement("div");
    fila.className = "precio-fila";
    precio.textContent = money(elegido.precio);
    const btn = document.createElement("button");
    btn.className = "btn-add";
    btn.dataset.agregar = "";
    btn.textContent = "Agregar";
    btn.addEventListener("click", () => alAgregar(elegido));
    fila.appendChild(precio);
    fila.appendChild(btn);
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

export function renderNosotros(contenedor, config) {
  const zona = config?.entrega?.zona || "tu ciudad";
  const horario = config?.entrega?.horario || "todos los días";
  const seccion = document.createElement("section");
  seccion.className = "seccion-cat nosotros";
  seccion.innerHTML = `
    <div class="cat-header">
      <span class="cat-eyebrow">TreeHouseWeed</span>
      <h2>Sobre nosotros</h2>
    </div>
    <p class="nosotros-lema">Relaxation has never been this simple.</p>
    <p class="nosotros-intro">
      Somos una casa que selecciona a mano cada flor, extracto y comestible.
      Nuestro compromiso es simple: producto de la más alta calidad, entrega
      rápida y discreta, y un trato honesto en cada pedido. Tu tranquilidad
      es nuestra prioridad.
    </p>
    <div class="valores">
      <article class="valor">
        <h3>Calidad seleccionada</h3>
        <p class="tenue">Flores, extractos y comestibles elegidos por sabor, potencia y frescura. Nada entra al menú si no lo probaríamos nosotros.</p>
      </article>
      <article class="valor">
        <h3>Entrega segura y discreta</h3>
        <p class="tenue">Protocolos claros en cada envío para que tu compra llegue tranquila. Cuidamos tu privacidad de principio a fin.</p>
      </article>
      <article class="valor">
        <h3>Siempre disponibles</h3>
        <p class="tenue">${horario}. Haz tu pedido cuando lo necesites en ${zona} y te acompañamos en todo el proceso.</p>
      </article>
      <article class="valor">
        <h3>Pago sin complicaciones</h3>
        <p class="tenue">Efectivo, transferencia o terminal. Sin pagos en línea: cierras tu pedido por WhatsApp, fácil y directo.</p>
      </article>
    </div>`;
  contenedor.appendChild(seccion);
}

export function renderInfo(contenedor, cuartoId, config) {
  if (cuartoId === "nosotros") {
    renderNosotros(contenedor, config);
    return;
  }
  {
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
