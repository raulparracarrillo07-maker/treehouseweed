// Humo animado del porro de la mascota: hebras finas y serpenteantes (como
// el hilo de humo pintado en la imagen) dibujadas en un canvas chico
// (.humo-capa) sobre la imagen final de la tienda. Todo se mide en
// fracciones del canvas para que escale con la imagen.
const EMISOR = { x: 0.494, y: 0.93 }; // punta del porro dentro del canvas
const ALTURA = 0.88;                  // cuánto sube el humo (fracción del canvas)
const PASOS = 60;                     // puntos por hebra

// Cada hebra ondula con dos senos encimados (uno cerrado y uno amplio) que
// viajan hacia arriba, igual que el hilo de humo real.
const HEBRAS = [
  { deriva: -0.05, amp: 0.09, k1: 22, v1: 1.1, k2: 8,  v2: 0.5, f1: 0.0, f2: 1.9, grosor: 1.0 },
  { deriva:  0.01, amp: 0.07, k1: 17, v1: 0.8, k2: 6,  v2: 0.7, f1: 2.1, f2: 4.2, grosor: 0.8 },
  { deriva: -0.02, amp: 0.11, k1: 26, v1: 1.4, k2: 10, v2: 0.4, f1: 4.4, f2: 0.8, grosor: 0.6 },
];

export function montarHumo(canvas) {
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");

  function ajustar() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width));
    canvas.height = Math.max(1, Math.round(r.height));
  }
  ajustar();
  window.addEventListener("resize", ajustar);

  function paso(ahora) {
    requestAnimationFrame(paso);
    // Solo trabaja cuando la imagen final de la tienda está a la vista.
    if (!document.body.classList.contains("interior-visible")) return;
    if (document.getElementById("intro").classList.contains("oculto")) return;

    const t = ahora / 1000;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Denso cerca de la brasa, se disipa al subir.
    const g = ctx.createLinearGradient(0, EMISOR.y * h, 0, (EMISOR.y - ALTURA) * h);
    g.addColorStop(0, "rgba(216, 220, 226, 0.40)");
    g.addColorStop(0.55, "rgba(216, 220, 226, 0.22)");
    g.addColorStop(1, "rgba(216, 220, 226, 0)");
    ctx.strokeStyle = g;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(216, 220, 226, 0.5)";
    ctx.shadowBlur = 4;

    for (const s of HEBRAS) {
      ctx.lineWidth = Math.max(1, w * 0.018) * s.grosor;
      ctx.beginPath();
      for (let i = 0; i <= PASOS; i++) {
        const u = i / PASOS;                       // 0 en la brasa → 1 arriba
        const abre = 0.15 + u * 1.15;              // el vaivén se abre al subir
        const x = (EMISOR.x + s.deriva * u
          + Math.sin(u * s.k1 - t * s.v1 + s.f1) * s.amp * abre
          + Math.sin(u * s.k2 - t * s.v2 + s.f2) * s.amp * 0.5 * abre) * w;
        const y = (EMISOR.y - u * ALTURA) * h;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  requestAnimationFrame(paso);
}
