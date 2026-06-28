async function init() {
  const config = await fetch("data/config.json").then((r) => r.json());
  document.getElementById("estado").textContent = `Tienda de ${config.marca} — entrega: ${config.entrega.zona}`;
}
init();
