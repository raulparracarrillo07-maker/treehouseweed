export function categorias(catalogo) {
  return catalogo.categorias;
}

export function productosDe(catalogo, categoria) {
  return catalogo.productos.filter((p) => p.categoria === categoria && p.disponible);
}

export function destacados(catalogo) {
  return catalogo.productos.filter((p) => p.destacado && p.disponible);
}
