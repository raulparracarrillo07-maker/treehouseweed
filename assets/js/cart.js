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
