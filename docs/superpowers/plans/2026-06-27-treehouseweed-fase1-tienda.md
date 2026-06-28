# TreeHouseWeed — Fase 1: Tienda funcional — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la tienda funcional de TreeHouseWeed (puerta de edad, catálogo, cuartos por categoría, carrito y pedido por WhatsApp) sin la capa visual inmersiva, que se construye en la Fase 2.

**Architecture:** HTML + CSS + JavaScript puro con módulos ES. La lógica pura (catálogo, carrito, mensaje de WhatsApp, puerta de edad) vive en módulos sin dependencias del DOM, para poder probarla con el runner nativo de Node (`node --test`). El navegador carga esos mismos módulos con `<script type="module">`. La UI (cuartos, tarjetas, carrito flotante) se verifica abriendo el sitio en el navegador.

**Tech Stack:** HTML5, CSS3, JavaScript (módulos ES), Node `node:test` + `node:assert` para pruebas. Sin frameworks.

## Global Constraints

- Sin pagos en línea, sin login, sin panel de administración. El pedido se cierra por WhatsApp (`https://wa.me/<numero>?text=<mensaje>`).
- Estilo de marca: fondo oscuro, dorado tipo Jungle Boys para títulos/acentos, colores vibrantes. Sin emojis en la interfaz del sitio.
- Idioma de toda la interfaz: español.
- Edad mínima configurable (default 18); la decisión se recuerda en `localStorage`.
- Los módulos de lógica (`catalog.js`, `cart.js`, `whatsapp.js`, `age-gate.js`) NO deben importar nada del DOM ni hacer `fetch`; reciben sus datos por parámetro. Esto los mantiene probables en Node.
- Datos de negocio (número de WhatsApp, zona y horario de entrega) viven en `data/config.json`, nunca hardcodeados en el código.

---

### Task 1: Esqueleto base y configuración de marca

**Files:**
- Modify: `index.html`
- Create: `assets/css/styles.css` (reemplaza el placeholder si existe)
- Create: `data/config.json`

**Interfaces:**
- Consumes: nada.
- Produces: `data/config.json` con la forma `{ "marca": string, "whatsapp": string, "edadMinima": number, "entrega": { "zona": string, "horario": string } }`. Las variables CSS `--oro`, `--fondo`, `--texto` definidas en `:root`.

- [ ] **Step 1: Crear `data/config.json`**

```json
{
  "marca": "TreeHouseWeed",
  "whatsapp": "5216141234567",
  "edadMinima": 18,
  "entrega": {
    "zona": "Chihuahua capital",
    "horario": "Lunes a domingo, 12:00 a 22:00"
  }
}
```

Nota para Raúl: cambia `whatsapp` por tu número real en formato internacional sin `+` ni espacios (México móvil = `52` + `1` + tus 10 dígitos). Ajusta zona y horario.

- [ ] **Step 2: Escribir `assets/css/styles.css` base**

```css
:root {
  --fondo: #0e1410;
  --fondo-2: #16201a;
  --texto: #f3f1e9;
  --texto-tenue: #b9c2b6;
  --oro: #d9a441;
  --oro-claro: #f0c46b;
  --verde: #4caf50;
  --radio: 14px;
  --sombra: 0 10px 30px rgba(0,0,0,.45);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--fondo);
  color: var(--texto);
  line-height: 1.5;
}
h1, h2, h3 { font-weight: 800; letter-spacing: -.01em; }
.oro { color: var(--oro); }
.contenedor { width: min(1100px, 92vw); margin-inline: auto; }
.oculto { display: none !important; }
button { font: inherit; cursor: pointer; border: none; }
```

- [ ] **Step 3: Reemplazar `index.html` con el shell base**

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TreeHouseWeed</title>
  <link rel="stylesheet" href="assets/css/styles.css" />
</head>
<body>
  <main id="app" class="contenedor">
    <h1>Tree<span class="oro">House</span>Weed</h1>
    <p id="estado">Cargando...</p>
  </main>
  <script type="module" src="assets/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Crear `assets/js/main.js` mínimo que cargue la config**

```js
async function init() {
  const config = await fetch("data/config.json").then((r) => r.json());
  document.getElementById("estado").textContent = `Tienda de ${config.marca} — entrega: ${config.entrega.zona}`;
}
init();
```

- [ ] **Step 5: Verificar en el navegador**

Abrir `index.html` con un servidor local (el `fetch` no funciona con `file://`):
Run: `cd ~/Desktop/TreeHouseWeed && python3 -m http.server 5500`
Abrir `http://localhost:5500` y confirmar que se ve el título dorado "TreeHouseWeed" y el texto "Tienda de TreeHouseWeed — entrega: Chihuahua capital".

- [ ] **Step 6: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: shell base, estilos de marca y config"
```
(Si aún no hay repo: `git init` antes del commit.)

---

### Task 2: Puerta de edad (Acto 0)

**Files:**
- Create: `assets/js/age-gate.js`
- Create: `tests/age-gate.test.mjs`
- Modify: `index.html` (overlay), `assets/js/main.js`, `assets/css/styles.css`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `esMayorDeEdad(storage) -> boolean` — lee la clave `"thw_mayor_edad"` del storage dado.
  - `guardarMayoria(storage) -> void` — escribe `"si"` en esa clave.
  - `montarPuertaEdad(opciones) -> void` donde `opciones = { storage, overlay, onEntrar, edadMinima }`; si ya es mayor oculta el overlay, si no, cablea los botones.

- [ ] **Step 1: Escribir el test que falla**

`tests/age-gate.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { esMayorDeEdad, guardarMayoria } from "../assets/js/age-gate.js";

function storageFalso() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
}

test("por defecto no es mayor", () => {
  assert.equal(esMayorDeEdad(storageFalso()), false);
});

test("tras guardar la mayoría, es mayor", () => {
  const s = storageFalso();
  guardarMayoria(s);
  assert.equal(esMayorDeEdad(s), true);
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `cd ~/Desktop/TreeHouseWeed && node --test tests/age-gate.test.mjs`
Expected: FAIL — no existe el módulo `age-gate.js`.

- [ ] **Step 3: Escribir `assets/js/age-gate.js`**

```js
const CLAVE = "thw_mayor_edad";

export function esMayorDeEdad(storage) {
  return storage.getItem(CLAVE) === "si";
}

export function guardarMayoria(storage) {
  storage.setItem(CLAVE, "si");
}

export function montarPuertaEdad({ storage, overlay, onEntrar, edadMinima }) {
  if (esMayorDeEdad(storage)) {
    overlay.classList.add("oculto");
    onEntrar();
    return;
  }
  overlay.querySelector("[data-edad-min]").textContent = String(edadMinima);
  overlay.querySelector("[data-si]").addEventListener("click", () => {
    guardarMayoria(storage);
    overlay.classList.add("oculto");
    onEntrar();
  });
  overlay.querySelector("[data-no]").addEventListener("click", () => {
    overlay.innerHTML = '<div class="puerta-caja"><p>Vuelve cuando seas mayor de edad. Cuídate.</p></div>';
  });
}
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `cd ~/Desktop/TreeHouseWeed && node --test tests/age-gate.test.mjs`
Expected: PASS — 2 tests.

- [ ] **Step 5: Agregar el overlay al `index.html`** (justo después de `<body>`)

```html
<div id="puerta-edad" class="puerta">
  <div class="puerta-caja">
    <h1>Tree<span class="oro">House</span>Weed</h1>
    <p>Para entrar necesitas ser mayor de <strong data-edad-min>18</strong> años.</p>
    <p>¿Eres mayor de edad?</p>
    <div class="puerta-botones">
      <button data-si class="btn-oro">Sí, entrar</button>
      <button data-no class="btn-tenue">No</button>
    </div>
  </div>
</div>
```

- [ ] **Step 6: Estilos del overlay en `styles.css`**

```css
.puerta {
  position: fixed; inset: 0; z-index: 100;
  background: radial-gradient(circle at 50% 30%, var(--fondo-2), var(--fondo));
  display: grid; place-items: center; text-align: center; padding: 1rem;
}
.puerta-caja { max-width: 420px; display: grid; gap: 1rem; }
.puerta-botones { display: flex; gap: .75rem; justify-content: center; }
.btn-oro { background: var(--oro); color: #1a1205; padding: .8rem 1.4rem; border-radius: var(--radio); font-weight: 700; }
.btn-tenue { background: transparent; color: var(--texto-tenue); padding: .8rem 1.4rem; border: 1px solid var(--texto-tenue); border-radius: var(--radio); }
```

- [ ] **Step 7: Cablear en `main.js`**

```js
import { montarPuertaEdad } from "./age-gate.js";

async function init() {
  const config = await fetch("data/config.json").then((r) => r.json());
  montarPuertaEdad({
    storage: localStorage,
    overlay: document.getElementById("puerta-edad"),
    edadMinima: config.edadMinima,
    onEntrar: () => arrancarTienda(config),
  });
}

function arrancarTienda(config) {
  document.getElementById("estado").textContent = `Tienda de ${config.marca}`;
}

init();
```

- [ ] **Step 8: Verificar en el navegador**

Con el servidor corriendo, recargar `http://localhost:5500`. Confirmar: aparece la puerta; "No" muestra el mensaje de salida; "Sí" la oculta y se ve la tienda; al recargar ya no vuelve a pedir edad (porque quedó guardada).
Para volver a probar desde cero: en la consola del navegador `localStorage.clear()` y recargar.

- [ ] **Step 9: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: puerta de edad con memoria en localStorage"
```

---

### Task 3: Catálogo (carga, filtro por categoría y destacados)

**Files:**
- Create: `assets/js/catalog.js`
- Create: `tests/catalog.test.mjs`
- Modify: `data/productos.json`

**Interfaces:**
- Consumes: nada.
- Produces (todas reciben el objeto catálogo ya parseado):
  - `productosDe(catalogo, categoria) -> Producto[]` — productos `disponible:true` de esa categoría.
  - `destacados(catalogo) -> Producto[]` — productos `disponible:true` con `destacado:true`.
  - `categorias(catalogo) -> string[]` — `catalogo.categorias`.
  - Forma de `Producto`: `{ id, nombre, categoria, descripcion, presentacion, precio, imagen, disponible, destacado }`.

- [ ] **Step 1: Reescribir `data/productos.json` con ejemplos por categoría**

```json
{
  "marca": "TreeHouseWeed",
  "moneda": "MXN",
  "categorias": ["rolados", "prerrolados", "extractos"],
  "productos": [
    { "id": "rol-01", "nombre": "Rolado clásico", "categoria": "rolados", "descripcion": "Rolado artesanal de la casa.", "presentacion": "1 g", "precio": 150, "imagen": "assets/img/productos/rol-01.jpg", "disponible": true, "destacado": true },
    { "id": "rol-02", "nombre": "Rolado premium", "categoria": "rolados", "descripcion": "Selección de flor premium.", "presentacion": "1.5 g", "precio": 220, "imagen": "assets/img/productos/rol-02.jpg", "disponible": true, "destacado": false },
    { "id": "pre-01", "nombre": "Prerrolado mini", "categoria": "prerrolados", "descripcion": "Listo para prender.", "presentacion": "0.5 g", "precio": 90, "imagen": "assets/img/productos/pre-01.jpg", "disponible": true, "destacado": true },
    { "id": "ext-01", "nombre": "Extracto wax", "categoria": "extractos", "descripcion": "Concentrado de alta pureza.", "presentacion": "0.5 g", "precio": 350, "imagen": "assets/img/productos/ext-01.jpg", "disponible": true, "destacado": false }
  ]
}
```

Nota para Raúl: reemplaza estos por tus productos reales (nombre, presentación, precio). Marca `destacado: true` los que quieras resaltar.

- [ ] **Step 2: Escribir el test que falla**

`tests/catalog.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { productosDe, destacados, categorias } from "../assets/js/catalog.js";

const catalogo = JSON.parse(readFileSync(new URL("../data/productos.json", import.meta.url)));

test("categorias devuelve las tres categorias", () => {
  assert.deepEqual(categorias(catalogo), ["rolados", "prerrolados", "extractos"]);
});

test("productosDe filtra por categoria", () => {
  const rolados = productosDe(catalogo, "rolados");
  assert.ok(rolados.length >= 1);
  assert.ok(rolados.every((p) => p.categoria === "rolados"));
});

test("destacados solo devuelve los marcados", () => {
  const d = destacados(catalogo);
  assert.ok(d.every((p) => p.destacado === true));
});
```

- [ ] **Step 3: Correr y ver fallar**

Run: `cd ~/Desktop/TreeHouseWeed && node --test tests/catalog.test.mjs`
Expected: FAIL — no existe `catalog.js`.

- [ ] **Step 4: Escribir `assets/js/catalog.js`**

```js
export function categorias(catalogo) {
  return catalogo.categorias;
}

export function productosDe(catalogo, categoria) {
  return catalogo.productos.filter((p) => p.categoria === categoria && p.disponible);
}

export function destacados(catalogo) {
  return catalogo.productos.filter((p) => p.destacado && p.disponible);
}
```

- [ ] **Step 5: Correr y ver pasar**

Run: `cd ~/Desktop/TreeHouseWeed && node --test tests/catalog.test.mjs`
Expected: PASS — 3 tests.

- [ ] **Step 6: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: modulo de catalogo con filtros y destacados"
```

---

### Task 4: Lógica del carrito

**Files:**
- Create: `assets/js/cart.js`
- Create: `tests/cart.test.mjs`

**Interfaces:**
- Consumes: `Producto` de Task 3.
- Produces (estado inmutable; cada función devuelve un carrito nuevo):
  - `carritoVacio() -> Carrito` donde `Carrito = { items: ItemCarrito[] }` y `ItemCarrito = { id, nombre, precio, cantidad }`.
  - `agregar(carrito, producto) -> Carrito` — si el id ya está, suma 1 a la cantidad; si no, lo agrega con cantidad 1.
  - `cambiarCantidad(carrito, id, cantidad) -> Carrito` — fija la cantidad; si es <= 0 quita el item.
  - `quitar(carrito, id) -> Carrito`.
  - `total(carrito) -> number`.
  - `contarItems(carrito) -> number` — suma de cantidades.

- [ ] **Step 1: Escribir el test que falla**

`tests/cart.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { carritoVacio, agregar, cambiarCantidad, quitar, total, contarItems } from "../assets/js/cart.js";

const prod = { id: "rol-01", nombre: "Rolado clásico", precio: 150 };

test("agregar dos veces el mismo producto suma cantidad", () => {
  let c = carritoVacio();
  c = agregar(c, prod);
  c = agregar(c, prod);
  assert.equal(c.items.length, 1);
  assert.equal(c.items[0].cantidad, 2);
  assert.equal(contarItems(c), 2);
});

test("total multiplica precio por cantidad", () => {
  let c = agregar(carritoVacio(), prod);
  c = cambiarCantidad(c, "rol-01", 3);
  assert.equal(total(c), 450);
});

test("cambiar cantidad a 0 quita el item", () => {
  let c = agregar(carritoVacio(), prod);
  c = cambiarCantidad(c, "rol-01", 0);
  assert.equal(c.items.length, 0);
});

test("quitar elimina el item", () => {
  let c = agregar(carritoVacio(), prod);
  c = quitar(c, "rol-01");
  assert.equal(c.items.length, 0);
});
```

- [ ] **Step 2: Correr y ver fallar**

Run: `cd ~/Desktop/TreeHouseWeed && node --test tests/cart.test.mjs`
Expected: FAIL — no existe `cart.js`.

- [ ] **Step 3: Escribir `assets/js/cart.js`**

```js
export function carritoVacio() {
  return { items: [] };
}

export function agregar(carrito, producto) {
  const existe = carrito.items.find((i) => i.id === producto.id);
  if (existe) {
    return cambiarCantidad(carrito, producto.id, existe.cantidad + 1);
  }
  const item = { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 };
  return { items: [...carrito.items, item] };
}

export function cambiarCantidad(carrito, id, cantidad) {
  if (cantidad <= 0) return quitar(carrito, id);
  return { items: carrito.items.map((i) => (i.id === id ? { ...i, cantidad } : i)) };
}

export function quitar(carrito, id) {
  return { items: carrito.items.filter((i) => i.id !== id) };
}

export function total(carrito) {
  return carrito.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
}

export function contarItems(carrito) {
  return carrito.items.reduce((s, i) => s + i.cantidad, 0);
}
```

- [ ] **Step 4: Correr y ver pasar**

Run: `cd ~/Desktop/TreeHouseWeed && node --test tests/cart.test.mjs`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: logica del carrito (estado inmutable)"
```

---

### Task 5: Mensaje y enlace de WhatsApp

**Files:**
- Create: `assets/js/whatsapp.js`
- Create: `tests/whatsapp.test.mjs`

**Interfaces:**
- Consumes: `Carrito` de Task 4; `config` de Task 1.
- Produces:
  - `construirMensaje(carrito, config) -> string` — texto del pedido con productos, cantidades, subtotal por línea, total y zona de entrega.
  - `construirURL(numero, mensaje) -> string` — `https://wa.me/<numero>?text=<mensaje codificado>`.

- [ ] **Step 1: Escribir el test que falla**

`tests/whatsapp.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { construirMensaje, construirURL } from "../assets/js/whatsapp.js";

const carrito = { items: [{ id: "rol-01", nombre: "Rolado clásico", precio: 150, cantidad: 2 }] };
const config = { marca: "TreeHouseWeed", entrega: { zona: "Chihuahua capital" } };

test("el mensaje incluye marca, producto, cantidad y total", () => {
  const m = construirMensaje(carrito, config);
  assert.ok(m.includes("TreeHouseWeed"));
  assert.ok(m.includes("Rolado clásico"));
  assert.ok(m.includes("x2"));
  assert.ok(m.includes("300"));
  assert.ok(m.includes("Chihuahua capital"));
});

test("la URL usa wa.me y codifica el texto", () => {
  const url = construirURL("5216141234567", "hola mundo");
  assert.ok(url.startsWith("https://wa.me/5216141234567?text="));
  assert.ok(url.includes("hola%20mundo"));
});
```

- [ ] **Step 2: Correr y ver fallar**

Run: `cd ~/Desktop/TreeHouseWeed && node --test tests/whatsapp.test.mjs`
Expected: FAIL — no existe `whatsapp.js`.

- [ ] **Step 3: Escribir `assets/js/whatsapp.js`**

```js
export function construirMensaje(carrito, config) {
  const lineas = carrito.items.map(
    (i) => `- ${i.nombre} x${i.cantidad} = $${i.precio * i.cantidad}`
  );
  const total = carrito.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  return [
    `Hola ${config.marca}, quiero hacer un pedido:`,
    ...lineas,
    `Total: $${total}`,
    `Entrega en: ${config.entrega.zona}`,
  ].join("\n");
}

export function construirURL(numero, mensaje) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
```

- [ ] **Step 4: Correr y ver pasar**

Run: `cd ~/Desktop/TreeHouseWeed && node --test tests/whatsapp.test.mjs`
Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: armado de mensaje y enlace de WhatsApp"
```

---

### Task 6: La casa — cuartos y render de productos

**Files:**
- Create: `assets/js/ui-store.js`
- Modify: `assets/js/main.js`, `index.html`, `assets/css/styles.css`

**Interfaces:**
- Consumes: `productosDe`, `categorias` (Task 3); `agregar` (Task 4).
- Produces:
  - `renderCasa(contenedor, catalogo, alElegirCuarto) -> void` — pinta los 5 cuartos (3 categorías + "nosotros" + "pedido"); al hacer clic en una categoría llama `alElegirCuarto(categoria)`.
  - `renderCuarto(contenedor, catalogo, categoria, alAgregar) -> void` — pinta las tarjetas de producto de la categoría; cada botón "Agregar" llama `alAgregar(producto)`.

- [ ] **Step 1: Escribir `assets/js/ui-store.js`**

```js
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
```

- [ ] **Step 2: Estilos de cuartos y productos en `styles.css`**

```css
.cuartos { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem; }
.cuarto { background: var(--fondo-2); color: var(--texto); padding: 2rem 1rem; border-radius: var(--radio); font-size: 1.1rem; font-weight: 700; border: 1px solid rgba(217,164,65,.25); transition: transform .15s, border-color .15s; }
.cuarto:hover { transform: translateY(-4px); border-color: var(--oro); }
.productos { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
.producto { background: var(--fondo-2); padding: 1.2rem; border-radius: var(--radio); display: grid; gap: .5rem; }
.tenue { color: var(--texto-tenue); font-size: .9rem; }
.precio { color: var(--oro); font-weight: 800; font-size: 1.2rem; }
.volver { background: transparent; color: var(--texto-tenue); border: 1px solid var(--texto-tenue); padding: .5rem 1rem; border-radius: var(--radio); margin-top: 1rem; }
```

- [ ] **Step 3: Cablear en `main.js`** (reemplazar `arrancarTienda`)

```js
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
```

- [ ] **Step 4: Quitar del `index.html` el `<p id="estado">`** (ya no se usa); dejar solo el `<h1>` dentro de `#app` o vaciar `#app`. El `main.js` repinta `#app`.

- [ ] **Step 5: Verificar en el navegador**

Con el servidor corriendo y tras pasar la puerta: se ven los 5 cuartos. Clic en "Rolados" muestra las tarjetas con precio y botón Agregar. "Volver a la casa" regresa a los cuartos. (El carrito todavía no tiene UI; se valida en Task 7.)

- [ ] **Step 6: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: casa con cuartos y listado de productos por categoria"
```

---

### Task 7: Carrito flotante y checkout por WhatsApp

**Files:**
- Create: `assets/js/ui-cart.js`
- Modify: `assets/js/main.js`, `index.html`, `assets/css/styles.css`

**Interfaces:**
- Consumes: `total`, `contarItems`, `cambiarCantidad` (Task 4); `construirMensaje`, `construirURL` (Task 5).
- Produces:
  - `renderCarrito(panel, badge, carrito, handlers) -> void` donde `handlers = { onCambiar(id, cantidad), onPedir() }`; actualiza el panel con items y total y el badge con el conteo.

- [ ] **Step 1: Agregar al `index.html`** (antes de `</body>`)

```html
<button id="fab-carrito" class="fab">Carrito <span id="badge-carrito">0</span></button>
<a id="fab-whatsapp" class="fab fab-wa" target="_blank" rel="noopener">WhatsApp</a>
<aside id="panel-carrito" class="panel oculto"></aside>
```

- [ ] **Step 2: Estilos en `styles.css`**

```css
.fab { position: fixed; bottom: 1rem; z-index: 50; padding: .8rem 1.2rem; border-radius: 999px; font-weight: 700; box-shadow: var(--sombra); }
#fab-carrito { right: 1rem; background: var(--oro); color: #1a1205; }
.fab-wa { left: 1rem; background: var(--verde); color: #fff; text-decoration: none; }
.panel { position: fixed; right: 1rem; bottom: 4.5rem; z-index: 50; width: min(360px, 90vw); background: var(--fondo-2); border-radius: var(--radio); padding: 1rem; box-shadow: var(--sombra); display: grid; gap: .6rem; max-height: 70vh; overflow:auto; }
.panel .fila { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
.panel input { width: 3rem; text-align: center; }
```

- [ ] **Step 3: Escribir `assets/js/ui-cart.js`**

```js
import { total, contarItems } from "./cart.js";

export function renderCarrito(panel, badge, carrito, handlers) {
  badge.textContent = String(contarItems(carrito));
  if (carrito.items.length === 0) {
    panel.innerHTML = "<p class='tenue'>Tu carrito está vacío.</p>";
    return;
  }
  panel.innerHTML = "<h3>Tu pedido</h3>";
  for (const i of carrito.items) {
    const fila = document.createElement("div");
    fila.className = "fila";
    fila.innerHTML = `<span>${i.nombre}</span>
      <span>$${i.precio * i.cantidad}</span>`;
    const input = document.createElement("input");
    input.type = "number"; input.min = "0"; input.value = String(i.cantidad);
    input.addEventListener("change", () => handlers.onCambiar(i.id, Number(input.value)));
    fila.insertBefore(input, fila.lastChild);
    panel.appendChild(fila);
  }
  const tot = document.createElement("p");
  tot.className = "precio";
  tot.textContent = `Total: $${total(carrito)}`;
  panel.appendChild(tot);
  const btn = document.createElement("button");
  btn.className = "btn-oro";
  btn.textContent = "Pedir por WhatsApp";
  btn.addEventListener("click", handlers.onPedir);
  panel.appendChild(btn);
}
```

- [ ] **Step 4: Cablear en `main.js`** (agregar imports y lógica del carrito)

Agregar a los imports:
```js
import { carritoVacio, agregar, cambiarCantidad } from "./cart.js";
import { renderCarrito } from "./ui-cart.js";
import { construirMensaje, construirURL } from "./whatsapp.js";
```

Agregar funciones y refrescar el carrito cada vez que cambie:
```js
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
```

En `init()`, después de cargar config/catalogo y antes de la puerta, llamar `cablearFabs()`. Y en `abrirCuarto`, tras `carrito = agregar(...)`, llamar `refrescarCarrito()`:
```js
renderCuarto(app, catalogo, categoria, (p) => { carrito = agregar(carrito, p); refrescarCarrito(); });
```

- [ ] **Step 5: Verificar en el navegador**

Agregar productos: el badge sube. Abrir el carrito con el FAB: se ven items, cambiar cantidad actualiza total y badge; poner 0 quita el item. "Pedir por WhatsApp" abre una pestaña a `wa.me` con el mensaje del pedido. El FAB verde de WhatsApp abre un chat con mensaje de duda.

- [ ] **Step 6: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: carrito flotante y checkout por WhatsApp"
```

---

### Task 8: Destacados en la casa

**Files:**
- Modify: `assets/js/ui-store.js`, `assets/js/main.js`

**Interfaces:**
- Consumes: `destacados` (Task 3); `alAgregar` callback (igual firma que en `renderCuarto`).
- Produces: `renderDestacados(contenedor, catalogo, alAgregar) -> void` — agrega al inicio de la casa una franja con los productos destacados; si no hay, no pinta nada.

- [ ] **Step 1: Agregar `renderDestacados` a `ui-store.js`**

```js
import { productosDe, destacados } from "./catalog.js";

export function renderDestacados(contenedor, catalogo, alAgregar) {
  const items = destacados(catalogo);
  if (items.length === 0) return;
  const seccion = document.createElement("section");
  seccion.innerHTML = `<h3 class="oro">Más vendidos</h3><div class="productos"></div>`;
  const grid = seccion.querySelector(".productos");
  for (const p of items) {
    const card = document.createElement("article");
    card.className = "producto";
    card.innerHTML = `<h3>${p.nombre}</h3><p class="tenue">${p.presentacion}</p><p class="precio">$${p.precio}</p><button class="btn-oro" data-agregar>Agregar</button>`;
    card.querySelector("[data-agregar]").addEventListener("click", () => alAgregar(p));
    grid.appendChild(card);
  }
  contenedor.prepend(seccion);
}
```

(Cambiar la línea `import { productosDe } from "./catalog.js";` existente por la de arriba que también importa `destacados`.)

- [ ] **Step 2: Llamarlo en `main.js` dentro de `irACasa`** (después de `renderCasa`)

```js
import { renderCasa, renderCuarto, renderDestacados } from "./ui-store.js";
// ...
function irACasa() {
  const app = document.getElementById("app");
  renderCasa(app, catalogo, (cuarto) => {
    if (cuarto.tipo === "categoria") abrirCuarto(cuarto.id);
  });
  renderDestacados(app, catalogo, (p) => { carrito = agregar(carrito, p); refrescarCarrito(); });
}
```

- [ ] **Step 3: Verificar en el navegador**

En la casa aparece arriba la franja "Más vendidos" con los productos marcados `destacado:true`. Agregar desde ahí suma al carrito.

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: franja de destacados en la casa"
```

---

### Task 9: Cuartos de información (Nosotros, Pedido/Entrega) y legal

**Files:**
- Modify: `assets/js/ui-store.js`, `assets/js/main.js`, `index.html`, `assets/css/styles.css`

**Interfaces:**
- Consumes: `config.entrega` (Task 1); cuartos `tipo:"info"` (Task 6).
- Produces: `renderInfo(contenedor, cuartoId, config) -> void` — pinta el contenido de "nosotros" o "pedido" (zona y horario de entrega desde config).

- [ ] **Step 1: Agregar `renderInfo` a `ui-store.js`**

```js
export function renderInfo(contenedor, cuartoId, config) {
  if (cuartoId === "nosotros") {
    contenedor.innerHTML = `<h2>Nosotros</h2>
      <p class="tenue">En TreeHouseWeed cuidamos cada producto. Calidad, sabor y confianza, directo a tu puerta.</p>`;
  } else {
    contenedor.innerHTML = `<h2>Cómo pedir</h2>
      <p>Arma tu carrito y confirma por WhatsApp. Sin pagos en línea.</p>
      <p><strong>Zona de entrega:</strong> ${config.entrega.zona}</p>
      <p><strong>Horario:</strong> ${config.entrega.horario}</p>`;
  }
}
```

- [ ] **Step 2: Cablear en `main.js`** (en el callback de `renderCasa`)

```js
import { renderCasa, renderCuarto, renderDestacados, renderInfo } from "./ui-store.js";
// ...
renderCasa(app, catalogo, (cuarto) => {
  if (cuarto.tipo === "categoria") return abrirCuarto(cuarto.id);
  abrirInfo(cuarto.id);
});
// ...
function abrirInfo(cuartoId) {
  const app = document.getElementById("app");
  renderInfo(app, cuartoId, config);
  const volver = document.createElement("button");
  volver.className = "volver";
  volver.textContent = "← Volver a la casa";
  volver.addEventListener("click", irACasa);
  app.appendChild(volver);
}
```

- [ ] **Step 3: Agregar el aviso legal al `index.html`** (antes de los FABs)

```html
<footer class="aviso">Consume con responsabilidad. Producto solo para mayores de edad.</footer>
```

- [ ] **Step 4: Estilo del aviso en `styles.css`**

```css
.aviso { text-align: center; color: var(--texto-tenue); font-size: .8rem; padding: 2rem 1rem 5rem; }
```

- [ ] **Step 5: Verificar en el navegador**

Clic en "Nosotros" muestra el texto de marca. Clic en "Pedido" muestra zona y horario desde la config. El aviso "Consume con responsabilidad" se ve abajo. Ambos cuartos tienen "Volver a la casa".

- [ ] **Step 6: Commit**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "feat: cuartos de info (nosotros/pedido) y aviso legal"
```

---

### Task 10: Pasada final de la Fase 1

**Files:**
- Modify: cualquiera con ajustes menores.

- [ ] **Step 1: Correr toda la batería de tests**

Run: `cd ~/Desktop/TreeHouseWeed && node --test`
Expected: PASS — todos los tests de age-gate, catalog, cart y whatsapp.

- [ ] **Step 2: Recorrido manual completo en el navegador**

Con `localStorage.clear()` y recarga: puerta de edad → casa con destacados y 5 cuartos → entrar a una categoría → agregar productos → abrir carrito → ajustar cantidades → pedir por WhatsApp (verificar el texto del mensaje) → revisar Nosotros y Pedido → aviso legal visible. Probar también en ventana angosta (responsive del grid).

- [ ] **Step 3: Commit final**

```bash
cd ~/Desktop/TreeHouseWeed && git add -A && git commit -m "chore: cierre de la Fase 1 — tienda funcional"
```

---

## Notas de cierre

- **Fase 2 (siguiente plan, con assets listos):** GSAP + ScrollTrigger + Lenis, los 3 actos visuales (viaje horizontal en desktop / vertical en móvil), parallax por capas con hojas de marihuana, mascota guía, botón "Entrar a la tienda" que salta directo a la casa. La casa y la tienda de la Fase 1 se convierten en el destino del recorrido.
- **Antes de publicar:** reemplazar productos de ejemplo por los reales, poner el número de WhatsApp real en `config.json`, y agregar las imágenes de producto en `assets/img/productos/`.
