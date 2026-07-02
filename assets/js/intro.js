// Recorrido controlado por SCROLL usando una secuencia de imágenes en canvas
// (técnica tipo Apple). Funciona en iPhone, donde "rebobinar" un <video> no se puede.
// Al llegar al final (última toma = el interior) aparecen los cartelones.

export function montarIntro() {
  const intro = document.getElementById("intro");
  const canvas = document.getElementById("intro-canvas");
  const ctx = canvas.getContext("2d");
  const marca = intro.querySelector(".intro-marca");

  intro.classList.remove("oculto");

  // El recorrido SIEMPRE debe empezar desde el frame 0. Si el navegador
  // restaura una posición de scroll anterior, el recorrido "arrancaría en
  // otra parte" y se vería trabado; por eso lo forzamos a cero.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

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

  let terminado = false;

  // Cierra el recorrido: deja la tienda fija arriba y colapsa la sección de la
  // animación para que YA NO se pueda volver a ella con scroll (solo con refresh).
  function finalizar() {
    if (terminado) return;
    terminado = true;
    if (marca) marca.style.opacity = "0";
    // Muestra la tienda final. NO ponemos "en-tienda" aquí: el carrito y el
    // WhatsApp solo aparecen dentro de una sección, no sobre esta pantalla.
    document.body.classList.add("interior-visible");
    intro.style.height = "100svh";     // ya no queda recorrido por encima
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("thw:tienda"));  // avisa que ya se ve la tienda
  }

  // Scroll fluido: el scroll marca un frame OBJETIVO; un loop acerca el frame
  // ACTUAL a ese objetivo suavemente (lerp), dibujando los intermedios. Así el
  // recorrido fluye aunque el scroll salte.
  let objetivo = 0, actual = 0, corriendo = false;
  function alScrollear() {
    if (terminado) return;
    const p = progreso();
    objetivo = p * (TOTAL - 1);
    if (marca) marca.style.opacity = String(Math.max(0, 1 - p * 5));
    if (p >= 0.97) finalizar();
    if (!corriendo) { corriendo = true; requestAnimationFrame(animarFrames); }
  }
  function animarFrames() {
    actual += (objetivo - actual) * 0.16;
    if (Math.abs(objetivo - actual) < 0.35) { actual = objetivo; corriendo = false; }
    dibujar(Math.round(actual));
    if (corriendo) requestAnimationFrame(animarFrames);
  }

  window.addEventListener("scroll", alScrollear, { passive: true });
  window.addEventListener("resize", () => { ajustar(); dibujar(indiceActual); });

  // Doble tap (o doble clic) = entrar directo a la tienda y cerrar el recorrido.
  intro.addEventListener("dblclick", finalizar);
  let ultimoTap = 0;
  intro.addEventListener("touchend", (e) => {
    if (terminado) return;
    const ahora = Date.now();
    if (ahora - ultimoTap < 300) {
      e.preventDefault();        // evita el zoom por doble tap del navegador
      finalizar();
      ultimoTap = 0;
    } else {
      ultimoTap = ahora;
    }
  }, { passive: false });

  ajustar();
  alScrollear();
}
