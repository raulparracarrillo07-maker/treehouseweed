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
