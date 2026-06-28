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
  document.getElementById("estado").textContent = `Tienda de ${config.marca} — entrega: ${config.entrega.zona}`;
}

init();
