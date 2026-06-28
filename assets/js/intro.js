// Intro como PRIMERA sección de un scroll continuo: el video del recorrido avanza
// con el scroll mientras estás en su tramo; al seguir bajando, sin corte, emerges
// del negro de la puerta hacia el interior de la tienda (que vive debajo en el flujo).

export function montarIntro() {
  const intro = document.getElementById("intro");
  const video = document.getElementById("intro-video");
  const saltar = document.getElementById("saltar-intro");
  const marca = intro.querySelector(".intro-marca");

  intro.classList.remove("oculto");

  let duracion = 0;
  let objetivo = 0;
  let raf;

  function fijarDuracion() {
    duracion = video.duration && isFinite(video.duration) ? video.duration : 5;
  }
  if (video.readyState >= 1) fijarDuracion();
  video.addEventListener("loadedmetadata", fijarDuracion);

  // "Prime" invisible: habilita el seek por cuadro sin que se vea reproducir.
  video.muted = true;
  video.style.opacity = "0";
  const mostrar = () => { video.style.opacity = "1"; };
  const intento = video.play();
  if (intento && intento.then) {
    intento.then(() => { video.pause(); video.currentTime = 0; mostrar(); }).catch(mostrar);
  } else { mostrar(); }

  // Progreso DENTRO del tramo de la intro (no de toda la página).
  function progreso() {
    const scrollable = intro.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(Math.max((window.scrollY - intro.offsetTop) / scrollable, 0), 1);
  }

  function alScrollear() {
    const p = progreso();
    objetivo = p * (duracion || 5);
    if (marca) marca.style.opacity = String(Math.max(0, 1 - p * 5));
    // Al pasar el recorrido, ya estamos en la tienda: mostrar carrito/whatsapp.
    document.body.classList.toggle("en-tienda", p >= 0.985);
  }

  function loop() {
    if (duracion) {
      const actual = video.currentTime;
      const diff = objetivo - actual;
      if (Math.abs(diff) > 0.008) {
        try { video.currentTime = actual + diff * 0.6; } catch (e) {}
      }
    }
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener("scroll", alScrollear, { passive: true });
  // "Entrar a la tienda" = bajar de golpe hasta el final del recorrido (sin cortar).
  saltar.addEventListener("click", () => {
    const destino = intro.offsetTop + intro.offsetHeight - window.innerHeight + 4;
    window.scrollTo({ top: destino, behavior: "smooth" });
  });

  raf = requestAnimationFrame(loop);
  alScrollear();
}
