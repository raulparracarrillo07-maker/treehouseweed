# TreeHouseWeed — Diseño de la experiencia "Casa del Árbol"

Fecha: 2026-06-27
Estado: Aprobado por Raúl, listo para plan de implementación

## Resumen

Tienda en línea de cannabis (rolados, prerrolados, extractos) construida como una
**experiencia inmersiva de scroll** ("scrollytelling"): el visitante hace un viaje
animado por un bosque y un árbol gigante hasta llegar a una casa del árbol que ES la
tienda. El cobro NO se hace en línea; el carrito arma un pedido por WhatsApp.

Estilo visual: **cartoon 2D estilo Rick & Morty**, amarrado a la identidad del logo
(dorado graffiti tipo Jungle Boys). Las hojas de todos los árboles son **hojas de
marihuana**.

## Objetivos

1. Que la marca se sienta premium, divertida y memorable (experiencia de viaje).
2. Que el cliente recurrente pueda comprar rápido (botón directo a la tienda).
3. Que funcione bien en celular (la mayoría de los clientes).
4. Cero fricción legal: puerta de edad y aviso de consumo responsable.

## La experiencia (3 actos)

**Acto 0 — Puerta de edad.** Antes de todo: "¿Eres mayor de edad?" Sí/No. Se recuerda
en el navegador (localStorage) para no repetirla. "No" → pantalla de salida amable.

**Acto 1 — El viaje (caminas de lado).** En computadora, el scroll mueve la cámara
lateralmente por el bosque (scroll horizontal con sección "pegada"/pin). En el camino
pasa por estaciones que cuentan la propuesta:
- Bienvenida (logo TreeHouseWeed)
- Calidad / cultivo
- Variedad (rolados, prerrolados, extractos)
Termina al pie de un árbol gigante.

**Acto 2 — Subes.** Aparecen las escaleras del árbol; el scroll ahora sube por el
tronco hasta la casa.

**Acto 3 — La casa del árbol (la tienda).** Entra a la casa colorida con cuartos.
Cada cuarto es una sección:
- Rolados
- Prerrolados
- Extractos
- Nosotros
- Pedido / Contacto

Le picas a un cuarto → ves esos productos → agregas al carrito → el carrito arma el
mensaje de WhatsApp.

**Acceso rápido:** un botón **"Entrar a la tienda"** siempre visible salta directo a
la casa (Acto 3), para el cliente que ya conoce y solo quiere comprar.

**Mascota guía:** un personaje cartoon (estilo Rick & Morty, acorde al logo) acompaña
al visitante en el recorrido y va presentando cada estación. Le da alma a la marca.

## Comportamiento en celular

El recorrido NO es lateral en celular. Todo el viaje se convierte en **vertical**: el
visitante sube por el bosque y el árbol simplemente deslizando hacia abajo. Misma
historia (3 actos), adaptada a pantalla angosta para que sea confiable y fluida.

## La tienda y el flujo de compra

- Catálogo en `data/productos.json` (categorías: rolados, prerrolados, extractos).
- Cada cuarto muestra los productos de su categoría (tarjeta con imagen, nombre,
  presentación, precio, botón "agregar").
- **Destacados / más vendidos:** un espacio en la casa que resalta productos estrella
  o promos, para guiar al cliente indeciso.
- **Carrito** flotante siempre visible con contador. Al confirmar, arma un mensaje de
  WhatsApp con los productos y cantidades, y abre WhatsApp con ese texto listo.
- **Botón de WhatsApp** flotante siempre visible.
- **Sin** pagos en línea, sin login, sin panel de administración.

## Elementos de confianza y legales

- Puerta de edad (Acto 0).
- Aviso "consume responsable" visible (pie de página / dentro de la casa).
- **Zona de entrega + horarios** claros, para que el cliente sepa si le llega y cuándo.

## Arquitectura técnica

- **Stack:** HTML / CSS / JavaScript (sin frameworks pesados), hosteable en
  Hostinger o GitHub Pages.
- **Animación de scroll:** GSAP + ScrollTrigger (gratis, estándar de la industria)
  para el viaje cinematográfico (pin, scroll horizontal, parallax por capas).
- **Scroll suave:** Lenis (ya usado en Noel Studio).
- **Assets:** ilustraciones cartoon 2D generadas con IA en estilo consistente
  (escenas del bosque/árbol/casa por capas para el parallax; mascota como personaje
  recurrente). Herramienta de pago recomendada para consistencia y exportación en
  capas: Recraft (opcional, solo en la fase de producción de dibujos).
- **Catálogo:** `data/productos.json`. Si más adelante Raúl quiere editarlo seguido
  él mismo, se migra a Google Sheets.
- **Construcción por estaciones:** Puerta de edad + Acto 1 → Acto 2 → la casa (Acto 3)
  → cada cuarto/catálogo → carrito/WhatsApp. Cada estación entrega algo visible.

## Estructura de carpetas (ya existe la base)

```
index.html
data/productos.json
assets/css/styles.css
assets/js/{products,cart,main}.js
assets/img/{escenas, logo, mascota, productos, ui}/
pages/{tienda, producto, carrito, nosotros, contacto}.html
```

## Fuera de alcance (para no perder foco)

- Pagos en línea (las pasarelas prohíben THC; se cierra por WhatsApp).
- Login de usuarios / cuentas.
- Panel de administración.
- Reseñas de clientes y sonido ambiente (descartados por ahora; se pueden agregar
  después si el sitio lo pide).

## Identidad visual

- **Estilo de ilustración:** cartoon 2D tipo Rick & Morty (líneas marcadas, colores
  vibrantes, personajes con personalidad).
- **Marca:** dorado graffiti tipo Jungle Boys del logo presente en títulos y detalles.
- **Follaje:** hojas de marihuana en la copa, cayendo en el parallax y como detalle
  en los cuartos.
- **Tipografía / paleta:** a definir en el plan de implementación, partiendo del logo.
