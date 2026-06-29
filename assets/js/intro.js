// Recorrido controlado por SCROLL usando una secuencia de imágenes en canvas
// (técnica tipo Apple). Funciona en iPhone, donde "rebobinar" un <video> no se puede.
// Al llegar al final (última toma = el interior) aparecen los cartelones.

export function montarIntro() {
  const intro = document.getElementById("intro");
  const canvas = document.getElementById("intro-canvas");
  const ctx = canvas.getContext("2d");
  const saltar = document.getElementById("saltar-intro");
  const marca = intro.querySelector(".intro-marca");

  intro.classList.remove("oculto");

  const TOTAL = 121;
  const imgs = [];
  for (let i = 1; i <= TOTAL; i++) {
    const img = new Image();
    img.src = "assets/img/frames/f" + String(i).padStart(3, "0") + ".jpg";
    imgs.push(img);
  }
  imgs[0].onload = () => { ajustar(); dibujar(0); };

  let w = 0, h = 0, indiceActual = 0;
  function ajustar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function dibujar(idx) {
    idx = Math.max(0, Math.min(TOTAL - 1, idx));
    const img = imgs[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    indiceActual = idx;
    const r = img.naturalWidth / img.naturalHeight;
    const cr = w / h;
    let dw, dh, dx, dy;
    if (cr > r) { dw = w; dh = w / r; dx = 0; dy = (h - dh) / 2; }
    else { dh = h; dw = h * r; dy = 0; dx = (w - dw) / 2; }
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function progreso() {
    const scrollable = intro.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(Math.max((window.scrollY - intro.offsetTop) / scrollable, 0), 1);
  }

  function alScrollear() {
    const p = progreso();
    dibujar(Math.round(p * (TOTAL - 1)));
    if (marca) marca.style.opacity = String(Math.max(0, 1 - p * 5));
    document.body.classList.toggle("interior-visible", p >= 0.97);
    document.body.classList.toggle("en-tienda", p >= 0.97);
  }

  window.addEventListener("scroll", alScrollear, { passive: true });
  window.addEventListener("resize", () => { ajustar(); dibujar(indiceActual); });
  saltar.addEventListener("click", () => {
    const destino = intro.offsetTop + intro.offsetHeight - window.innerHeight;
    window.scrollTo({ top: destino, behavior: "smooth" });
  });

  ajustar();
  alScrollear();
}
