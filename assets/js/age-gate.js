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
