import { total, contarItems } from "./cart.js?v=6";

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

    const spanNombre = document.createElement("span");
    spanNombre.textContent = i.nombre;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = String(i.cantidad);
    input.addEventListener("change", () => handlers.onCambiar(i.id, Number(input.value)));

    const spanPrecio = document.createElement("span");
    spanPrecio.textContent = `$${i.precio * i.cantidad}`;

    fila.appendChild(spanNombre);
    fila.appendChild(input);
    fila.appendChild(spanPrecio);
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
