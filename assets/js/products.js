// TreeHouseWeed — carga y muestra del catálogo
// Lee data/productos.json y arma las tarjetas de producto.

async function cargarProductos() {
  const respuesta = await fetch("data/productos.json");
  const datos = await respuesta.json();
  return datos.productos;
}
