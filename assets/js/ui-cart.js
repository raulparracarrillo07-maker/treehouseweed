import { total, contarItems } from "./cart.js?v=25";

const money = (n) => `$${n.toLocaleString("es-MX")}`;

export function renderCarrito(panel, badge, carrito, handlers) {
  badge.textContent = String(contarItems(carrito));

  if (carrito.items.length === 0) {
    panel.innerHTML = `
      <div class="panel-vacio">
        <img class="emoji-hoja" src="assets/img/logo/treehouseweed-logo-transparente.png" alt="" />
        <h3>Tu carrito está vacío</h3>
        <p class="tenue">Elige tus productos y arma tu pedido.</p>
      </div>`;
    return;
  }

  panel.innerHTML = "<h3>Tu pedido</h3>";

  for (const i of carrito.items) {
    const fila = document.createElement("div");
    fila.className = "fila";

    const nombre = document.createElement("div");
    nombre.className = "f-nombre";
    const n = document.createElement("span");
    n.textContent = i.nombre;
    const p = document.createElement("small");
    p.textContent = `${i.presentacion || ""} · ${money(i.precio)} c/u`;
    nombre.appendChild(n);
    nombre.appendChild(p);

    const stepper = document.createElement("div");
    stepper.className = "stepper";
    const menos = document.createElement("button");
    menos.type = "button"; menos.setAttribute("aria-label", "Quitar uno");
    menos.textContent = "−";
    menos.addEventListener("click", () => handlers.onCambiar(i.id, i.cantidad - 1));
    const cant = document.createElement("span");
    cant.textContent = String(i.cantidad);
    const mas = document.createElement("button");
    mas.type = "button"; mas.setAttribute("aria-label", "Agregar uno");
    mas.textContent = "+";
    mas.addEventListener("click", () => handlers.onCambiar(i.id, i.cantidad + 1));
    stepper.appendChild(menos);
    stepper.appendChild(cant);
    stepper.appendChild(mas);

    const precio = document.createElement("span");
    precio.className = "f-precio";
    precio.textContent = money(i.precio * i.cantidad);

    fila.appendChild(nombre);
    fila.appendChild(stepper);
    fila.appendChild(precio);
    panel.appendChild(fila);
  }

  const tot = document.createElement("div");
  tot.className = "panel-total";
  tot.innerHTML = `<span>Total</span><strong>${money(total(carrito))}</strong>`;
  panel.appendChild(tot);

  const btn = document.createElement("button");
  btn.className = "btn-pedir";
  btn.textContent = "Pedir por Instagram";
  btn.addEventListener("click", handlers.onPedir);
  panel.appendChild(btn);

  const nota = document.createElement("p");
  nota.className = "panel-confianza";
  nota.textContent = "Copiamos tu pedido y abrimos tu chat: solo pégalo y envíalo.";
  panel.appendChild(nota);

  if (handlers.entrega) {
    const conf = document.createElement("p");
    conf.className = "panel-confianza";
    conf.textContent = `${handlers.entrega.zona} · ${handlers.entrega.horario}`;
    panel.appendChild(conf);
  }
}
