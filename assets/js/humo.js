// Humo del porro: una estela continua que sube desde la brasa, serpentea de
// forma coherente (todas las volutas a la misma altura comparten la ondulación,
// que "fluye" hacia arriba) y se ensancha al disiparse. Dibujada en el canvas
// chico (.humo-capa) sobre la imagen. Todo en fracciones del canvas para escalar.
const EMISOR = { x: 0.5, y: 0.98 }; // brasa del porro dentro del canvas
const MAX = 20;                     // volutas vivas a la vez
const CADA_MS = 150;                // ritmo de emisión (columna continua)

export function montarHumo(canvas) {
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const volutas = [];
  let ultima = 0;

  function ajustar() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width));
    canvas.height = Math.max(1, Math.round(r.height));
  }
  ajustar();
  window.addEventListener("resize", ajustar);

  function emitir() {
    if (volutas.length >= MAX) return;
    volutas.push({
      x0: EMISOR.x + (Math.random() - 0.5) * 0.02,
      r: 0.016 + Math.random() * 0.014,   // delgado cerca de la brasa
      sube: 0.0015 + Math.random() * 0.0007,
      vida: 0,
      dur: 230 + Math.random() * 90,
    });
  }

  function paso(ahora) {
    requestAnimationFrame(paso);
    if (!document.body.classList.contains("interior-visible")) return;
    if (document.getElementById("intro").classList.contains("oculto")) return;

    if (ahora - ultima > CADA_MS) { emitir(); ultima = ahora; }

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    for (let i = volutas.length - 1; i >= 0; i--) {
      const v = volutas[i];
      v.vida++;
      if (v.vida > v.dur) { volutas.splice(i, 1); continue; }

      const t = v.vida / v.dur;                 // 0 → 1
      const subido = v.sube * v.vida;           // cuánto ha subido
      const y = EMISOR.y - subido;
      // Serpenteo coherente: depende de la altura subida + el tiempo (fluye
      // hacia arriba). La amplitud crece con la altura (la estela se abre).
      const x = v.x0
        + Math.sin(subido * 42 + ahora * 0.0026) * (0.012 + subido * 0.55);
      const r = v.r * (1 + t * 3.2);            // se ensancha al subir
      // Más densa cerca de la brasa, se disuelve arriba.
      const alfa = Math.sin(Math.PI * t) * 0.22 * (1 - t * 0.35);

      const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * h);
      g.addColorStop(0, `rgba(220, 224, 230, ${alfa})`);
      g.addColorStop(0.55, `rgba(214, 218, 224, ${alfa * 0.45})`);
      g.addColorStop(1, "rgba(214, 218, 224, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x * w, y * h, r * h, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  requestAnimationFrame(paso);
}
