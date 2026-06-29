// Recorrido como video que se REPRODUCE solo (robusto en iPhone/Safari, donde
// "rebobinar" con el scroll no funciona). Al terminar, aparecen los cartelones
// sobre el último cuadro (el interior). Botón para saltar directo a la tienda.

export function montarIntro() {
  const intro = document.getElementById("intro");
  const video = document.getElementById("intro-video");
  const saltar = document.getElementById("saltar-intro");
  const marca = intro.querySelector(".intro-marca");

  intro.classList.remove("oculto");

  function ocultarMarca() {
    if (marca) { marca.style.transition = "opacity .6s ease"; marca.style.opacity = "0"; }
  }
  function mostrarCartelones() {
    ocultarMarca();
    document.body.classList.add("interior-visible", "en-tienda");
  }

  video.muted = true;
  video.setAttribute("playsinline", "");
  video.style.opacity = "1";

  let arranco = false;
  video.addEventListener("timeupdate", () => {
    if (!arranco && video.currentTime > 0.2) { arranco = true; ocultarMarca(); }
  });
  video.addEventListener("ended", () => { video.pause(); mostrarCartelones(); });

  // Reproducir (autoplay muted permitido tras pasar la puerta de edad).
  const intento = video.play();
  if (intento && intento.catch) intento.catch(() => {});

  saltar.addEventListener("click", () => {
    video.pause();
    if (video.duration && isFinite(video.duration)) video.currentTime = video.duration;
    mostrarCartelones();
  });
}
