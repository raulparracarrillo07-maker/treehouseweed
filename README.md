# TreeHouseWeed

Tienda en línea (e-commerce) de TreeHouseWeed: rolados, prerrolados y extractos.

Sitio hecho a mano en **HTML / CSS / JavaScript**. El catálogo se muestra en el
sitio y el pedido se cierra por **WhatsApp** (los pagos con tarjeta en línea no
están permitidos para este giro).

## Estructura de carpetas

```
TreeHouseWeed/
├── index.html              # Página principal (inicio)
├── assets/                 # Todo lo "estático" del sitio
│   ├── css/                #   Estilos (styles.css)
│   ├── js/                 #   Lógica: catálogo, carrito, general
│   ├── img/                #   Imágenes
│   │   ├── productos/      #     Fotos de cada producto
│   │   ├── logo/           #     Logo de la marca
│   │   └── ui/             #     Íconos y elementos de interfaz
│   └── fonts/              #   Tipografías propias
├── data/
│   └── productos.json      # El catálogo (aquí va toda tu lista de productos)
├── pages/                  # Páginas internas
│   ├── tienda.html         #   Catálogo completo con filtros
│   ├── producto.html       #   Ficha de un producto
│   ├── carrito.html        #   Resumen del pedido (cierra por WhatsApp)
│   ├── nosotros.html       #   Sobre la marca
│   └── contacto.html       #   Contacto
└── docs/
    └── superpowers/specs/  # Documento de diseño del proyecto
```

## Pendiente

- [ ] Cargar el catálogo real en `data/productos.json`
- [ ] Definir identidad visual (logo, colores, tipografía)
- [ ] Construir las páginas
