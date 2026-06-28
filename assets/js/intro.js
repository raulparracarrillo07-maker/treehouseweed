// Intro del sitio: el video del recorrido se controla 1:1 con el scroll.
// La posición del scroll mapea directo al cuadro del video, así se SIENTE
// que estás scrolleando (no que se reproduce un video).

export function montarIntro({ onTerminar }) {
  const intro = document.getElementById("intro");
  const video = document.getElementById("intro-video");
  const saltar = document.getElementById("saltar-intro");
  const marca = intro.querySelector(".intro-marca");

  intro.classList.remove("oculto");

  let duracion = 0;
  let objetivo = 0;
  let terminado = false;
  let raf;

  function fijarDuracion() {
    duracion = video.duration && isFinite(video.duration) ? video.duration : 0;
  }
  if (video.readyState >= 1) fijarDuracion();
  video.addEventListener("loadedmetadata", fijarDuracion);

  // "Prime" INVISIBLE: activa el seek por cuadro sin que se vea reproducir.
  // El video arranca oculto; tras el play+pause queda en el primer cuadro y se muestra.
  video.muted = true;
  video.style.opacity = "0";
  function mostrar() { video.style.opacity = "1"; }
  const intento = video.play();
  if (intento && intento.then) {
    intento.then(() => { video.pause(); video.currentTime = 0; mostrar(); }).catch(mostrar);
  } else {
    mostrar();
  }

  function progreso() {
    const scrollable = intro.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(Math.max(window.scrollY / scrollable, 0), 1);
  }

  function alScrollear() {
    if (terminado) return;
    const p = progreso();
    objetivo = p * (duracion || 5);
    if (marca) marca.style.opacity = String(Math.max(0, 1 - p * 5));
    if (p >= 0.992) terminar();
  }

  // Sigue el scroll 1:1: leve acercamiento para no saturar de seeks,
  // pero responde de inmediato (se siente scroll, no reproducción).
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

  function terminar() {
    if (terminado) return;
    terminado = true;
    window.removeEventListener("scroll", alScrollear);
    cancelAnimationFrame(raf);
    intro.classList.add("oculto");
    window.scrollTo(0, 0);
    onTerminar();
  }

  window.addEventListener("scroll", alScrollear, { passive: true });
  saltar.addEventListener("click", terminar);
  raf = requestAnimationFrame(loop);
}
