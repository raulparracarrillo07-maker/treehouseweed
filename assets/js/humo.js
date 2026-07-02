// Humo del porro: muchas partículas pequeñas y tenues que suben serpenteando
// de forma coherente y se acumulan con mezcla aditiva ("lighter") + blur del
// canvas, dando la textura suave del humo real (denso en la brasa, difuso y
// abierto arriba). Todo en fracciones del canvas para que escale con la imagen.
const EMISOR = { x: 0.5, y: 0.98 }; // brasa del porro dentro del canvas
const MAX = 70;                     // partículas vivas
const CADA_MS = 34;                 // ritmo de emisión (columna densa)
const POR_EMISION = 2;

export function montarHumo(canvas) {
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const parts = [];
  let ultima = 0;

  function ajustar() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width));
    canvas.height = Math.max(1, Math.round(r.height));
  }
  ajustar();
  window.addEventListener("resize", ajustar);

  function emitir() {
    for (let k = 0; k < POR_EMISION && parts.length < MAX; k++) {
      parts.push({
        x0: EMISOR.x + (Math.random() - 0.5) * 0.02,
        r: 0.007 + Math.random() * 0.013,   // muy pequeñas cerca de la brasa
        sube: 0.0013 + Math.random() * 0.0009,
        amp: 0.008 + Math.random() * 0.01,
        fase: Math.random() * Math.PI * 2,
        vida: 0,
        dur: 210 + Math.random() * 120,
      });
    }
  }

  function paso(ahora) {
    requestAnimationFrame(paso);
    if (!document.body.classList.contains("interior-visible")) return;
    if (document.getElementById("intro").classList.contains("oculto")) return;

    if (ahora - ultima > CADA_MS) { emitir(); ultima = ahora; }

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter"; // las partículas se suman → humo suave

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vida++;
      if (p.vida > p.dur) { parts.splice(i, 1); continue; }

      const t = p.vida / p.dur;                 // 0 → 1
      const subido = p.sube * p.vida;
      const y = EMISOR.y - subido;
      // Serpenteo coherente (por altura + tiempo) que se abre al subir.
      const x = p.x0
        + Math.sin(subido * 40 + ahora * 0.0024) * (0.01 + subido * 0.5)
        + Math.sin(p.fase + p.vida * 0.05) * p.amp * t;
      const r = p.r * (1 + t * 3.4);            // se expande al subir
      const alfa = Math.sin(Math.PI * t) * 0.085 * (1 - t * 0.3);

      const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * h);
      g.addColorStop(0, `rgba(206, 210, 216, ${alfa})`);
      g.addColorStop(1, "rgba(206, 210, 216, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x * w, y * h, r * h, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  requestAnimationFrame(paso);
}
