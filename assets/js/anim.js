// Animaciones premium: smooth scroll (Lenis) + reveals al entrar al viewport.
// Respeta prefers-reduced-motion. El contenido es visible por defecto; solo cuando
// se activa (body.anim) se prepara para el reveal, así nunca queda en blanco si falla.

const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let smoothIniciado = false;

export function iniciarSmooth() {
  if (smoothIniciado) return;
  smoothIniciado = true;
  document.body.classList.add("anim");

  if (!reduce() && window.Lenis) {
    const lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
}

// Revela los elementos .reveal aún no visibles. Llamar después de cada render.
export function revelar() {
  const items = document.querySelectorAll(".reveal:not(.visible)");
  if (reduce()) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => io.observe(el));
}
