// El anfitrión (la mascota) "habla" y cuenta sobre la marca por secciones.
// Al abrir o cambiar de sección hace la animación de hablar y muestra el
// texto en un bocadillo. El contenido sale de config para no repetir datos.

function seccionNosotros() {
  return `
    <p>¡Qué onda! Soy el anfitrión de <b>TreeHouseWeed</b>. Bienvenido a la casa del árbol.</p>
    <p>Aquí encuentras producto <b>100% de dispensario</b>, solo marcas reconocidas y calidad premium. Ponte cómodo y date una vuelta por las secciones.</p>`;
}

function seccionTrabajo(config) {
  const zona = config?.entrega?.zona || "tu zona";
  return `
    <p>Es bien fácil pedir:</p>
    <p><b>1.</b> Elige tus productos y arma tu carrito.<br>
       <b>2.</b> Mándanos el pedido por Instagram (se copia solo, tú lo pegas).<br>
       <b>3.</b> Dinos si es a domicilio, punto medio o pasas por él.</p>
    <p>Entregamos en <b>${zona}</b>. Compras mayores a $500 llevan envío gratis según la zona. Pagas en efectivo, transferencia o terminal.</p>`;
}

function seccionCalidad() {
  return `
    <p>Cada flor, extracto y comestible lo elegimos por <b>sabor, potencia y frescura</b>.</p>
    <p>Solo trabajamos <b>marcas reconocidas</b>. Si no lo probaríamos nosotros, no entra al menú. Eso es lo que hace premium a TreeHouseWeed.</p>`;
}

function seccionContacto(config) {
  const c = config?.contacto || {};
  const horario = config?.entrega?.horario || "todos los días";
  const filas = [];
  if (c.instagram) filas.push(`<a href="https://ig.me/m/${c.instagram}" target="_blank" rel="noopener">Instagram @${c.instagram} — pedidos y dudas</a>`);
  if (c.tiktok) filas.push(`<a href="https://tiktok.com/@${c.tiktok}" target="_blank" rel="noopener">TikTok @${c.tiktok}</a>`);
  if (c.correo) filas.push(`<a href="mailto:${c.correo}">${c.correo}</a>`);
  return `
    <p>Escríbenos cuando quieras, estamos <b>${horario}</b>:</p>
    <div class="monito-contacto">${filas.map((f) => `<span>${f}</span>`).join("")}</div>`;
}

const SECCIONES = {
  nosotros: seccionNosotros,
  trabajo: seccionTrabajo,
  calidad: seccionCalidad,
  contacto: seccionContacto,
};

export function montarMonito(config) {
  const modal = document.getElementById("monito-modal");
  if (!modal) return { abrir() {}, cerrar() {} };
  const globo = modal.querySelector(".monito-globo");
  const fig = modal.querySelector(".monito-fig");
  const tabs = [...modal.querySelectorAll(".mt")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hablar() {
    if (reduce) return;
    fig.classList.remove("hablando");
    void fig.offsetWidth;
    fig.classList.add("hablando");
  }

  function mostrar(sec) {
    const fn = SECCIONES[sec] || SECCIONES.nosotros;
    globo.innerHTML = fn(config);
    tabs.forEach((t) => t.classList.toggle("activo", t.dataset.sec === sec));
    hablar();
  }

  function abrir(sec = "nosotros") {
    modal.classList.remove("oculto");
    document.body.classList.add("modal-abierto");
    mostrar(sec);
  }
  function cerrar() {
    modal.classList.add("oculto");
    document.body.classList.remove("modal-abierto");
  }

  tabs.forEach((t) => t.addEventListener("click", () => mostrar(t.dataset.sec)));
  modal.querySelector(".monito-cerrar").addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.classList.contains("oculto")) cerrar(); });

  return { abrir, cerrar };
}
