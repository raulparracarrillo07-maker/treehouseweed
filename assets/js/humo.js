// Humo del porro: bocanadas difusas sin forma definida que suben desde la
// brasa, se expanden y se disipan. Dibujadas en un canvas chico (.humo-capa)
// sobre la imagen final. Nada de líneas ni hebras: solo manchas suaves con
// blur para que nunca se vea "raro". Todo en fracciones del canvas para que
// escale con la imagen.
const EMISOR = { x: 0.5, y: 0.95 }; // brasa del porro dentro del canvas
const MAX = 10;                     // bocanadas vivas a la vez
const CADA_MS = 320;                // ritmo de emisión

export function montarHumo(canvas) {
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const nubes = [];
  let ultima = 0;

  function ajustar() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width));
    canvas.height = Math.max(1, Math.round(r.height));
  }
  ajustar();
  window.addEventListener("resize", ajustar);

  function emitir() {
    if (nubes.length >= MAX) return;
    nubes.push({
      x: EMISOR.x + (Math.random() - 0.5) * 0.05,
      y: EMISOR.y,
      r: 0.05 + Math.random() * 0.04,     // radio inicial (fracción del alto)
      sube: 0.0016 + Math.random() * 0.001,
      deriva: (Math.random() - 0.5) * 0.0006,
      giro: Math.random() * 0.5 + 0.2,
      fase: Math.random() * Math.PI * 2,
      vida: 0,
      dur: 150 + Math.random() * 60,
    });
  }

  function paso(ahora) {
    requestAnimationFrame(paso);
    if (!document.body.classList.contains("interior-visible")) return;
    if (document.getElementById("intro").classList.contains("oculto")) return;

    if (ahora - ultima > CADA_MS) { emitir(); ultima = ahora; }

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    for (let i = nubes.length - 1; i >= 0; i--) {
      const n = nubes[i];
      n.vida++;
      if (n.vida > n.dur) { nubes.splice(i, 1); continue; }

      const t = n.vida / n.dur;                       // 0 → 1
      const y = n.y - n.sube * n.vida;                // sube constante
      const x = n.x + n.deriva * n.vida
        + Math.sin(n.fase + n.vida * 0.05) * 0.02 * n.giro * t; // vaivén leve
      const r = n.r * (1 + t * 2.6);                  // se expande al subir
      const alfa = Math.sin(Math.PI * t) * 0.20;      // aparece y se disuelve

      const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * h);
      g.addColorStop(0, `rgba(214, 218, 224, ${alfa})`);
      g.addColorStop(0.6, `rgba(214, 218, 224, ${alfa * 0.4})`);
      g.addColorStop(1, "rgba(214, 218, 224, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x * w, y * h, r * h, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  requestAnimationFrame(paso);
}
