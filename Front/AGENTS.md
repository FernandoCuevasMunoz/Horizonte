# Horizonte Inmobiliario — Frontend

## Proyecto

Sitio web de corredora de propiedades (compra, venta, arriendo).
Generado originalmente por Codex, refactorizado por opencode.

## Stack

- React 19 + Vite 7
- Tailwind CSS 3.4
- react-router-dom 7
- lucide-react (iconos)
- Google Fonts: Inter (400–950)

## Arbol

```
Front/
├── index.html              # SEO: lang=es-CL, Inter font, meta tags
├── tailwind.config.js      # Sistema de diseño (colores, fonts)
├── vite.config.js
├── src/
│   ├── main.jsx            # Entry: BrowserRouter + App
│   ├── index.css           # Solo Tailwind directives + reset base
│   ├── App.jsx             # Rutas
│   ├── components/
│   │   ├── Navbar.jsx      # Menú responsive con toggle mobile
│   │   ├── Hero.jsx        # Hero principal con buscador
│   │   ├── Featured.jsx    # Propiedades destacadas
│   │   ├── PropertyCard.jsx# Card de propiedad reutilizable
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx        # / — Navbar + Hero + Featured + Footer
│   │   ├── Properties.jsx  # /propiedades — grid con filtros
│   │   ├── PropertyDetail.jsx# /propiedades/:id — detalle completo
│   │   ├── Sell.jsx        # /vender — formulario tasación
│   │   ├── About.jsx       # /nosotros — stats + valores
│   │   ├── Contact.jsx     # /contacto — formulario + datos
│   │   └── Publish.jsx     # /publicar — formulario publicación
│   └── data/
│       └── properties.js   # 7 propiedades hardcodeadas
```

## Sistema de diseño (tailwind.config.js)

```js
colors: {
  root:        '#1E4D40',  // color original (se mantiene)
  cream:       '#fbfbf8',  // fondo páginas
  forest:      '#0f4a3d',  // primary (botones, acentos)
  forest-dark: '#123f35',  // headings
  mint:        '#79a77d',  // acento verde claro (labels, spans)
  mint-light:  '#87bd88',  // hero heading highlight
  moss:        '#5e6a66',  // texto secundario
  moss-light:  '#4d5a58',  // hero párrafo
  border:      '#e2e8e4',  // bordes generales
  border-input:'#dfe5e2',  // bordes inputs
}
fontFamily: { sans: ['Inter', ...] }
```

## Convenciones

- **Sin CSS files separados** — todo con Tailwind utilities inline.
- **Sin comentarios en JSX** — el código se explica solo.
- **Forms** tienen `name` en inputs y `onSubmit` con `preventDefault`.
- **Navbar** detecta ruta: absolute solo en Home, relative en el resto.
  - En detail page (`/propiedades/:id`) usa texto `#111` en vez de `forest-dark`.
- **Mobile first** — clases responsive con Tailwind (sm:, md:, lg:).
  - Breakpoints nativos: 640/768/1024/1280.
  - Excepciones con max-[npx] donde el diseño original lo requiere.

## Sesiones

### Sesión 1 (24 Jun 2026) — Migración CSS → Tailwind

**Qué se hizo:**
- Migrados todos los componentes y páginas de CSS plano a Tailwind utilities.
- Eliminados 12 archivos `.css`.
- `index.html` corregido: falta `head`, charset, viewport, title, Inter font.
- `vite.config.js`, `main.jsx`, `tailwind.config.js` formateados (estaban en 1 línea).
- Diseño de colores unificado en `tailwind.config.js`.
- Navbar mejorado: menú mobile funcional (toggle state).
- Forms: agregados `name` a inputs y `onSubmit`.
- Navbar adaptativo según ruta (absolute en home, relative en otras).
- Archivo `AGENTS.md` creado.

### Sesión 2 (24 Jun 2026) — Forms con estado y validación

**Qué se hizo:**
- Creado `src/utils/validation.js` con helpers: `required`, `email`, `phone`, `minLength`.
- Sell (`/vender`): estado con `useState`, validación en submit, loading spinner, pantalla de éxito.
- Contact (`/contacto`): igual + validación de email y largo mínimo de mensaje.
- Publish (`/publicar`): igual + select de operación/tipo con validación.
- Cada form limpia errores al tipear, muestra errores inline en rojo, y simula envío con `setTimeout`.

### Sesión 3 (24 Jun 2026) — Buscador del Hero conectado a filtros

**Qué se hizo:**
- Hero: botones estáticos reemplazados por `<select>` reales con estado (`useState`).
- Hero: onSubmit navega a `/propiedades?tipo=X&comuna=Y&operacion=Z` con `useNavigate`.
- Properties: filtros ahora usan `useSearchParams` — se sincronizan con la URL.
- Properties: `setFilter` actualiza los query params sin recargar la página.
- Properties: el filtro de operación ahora funciona desde la URL (lo maneja el buscador del Hero).
- Properties: se eliminó el `useState` local, ahora lee todo desde `searchParams`.

### Sesión 4 (24 Jun 2026) — Nuevo tipo: Local comercial

**Qué se hizo:**
- Agregada propiedad "Local comercial en Providencia" (id: 7) en `properties.js`.
- Agregado "Local comercial" a todos los `<select>` de tipo: Hero, Properties, Sell, Publish.

### Sesión 5 (24 Jun 2026) — SEO + Performance

**Qué se hizo:**
- Instalado `react-helmet-async` para meta tags por página.
- `main.jsx`: envuelto en `<HelmetProvider>`.
- `index.html`: agregado JSON-LD structured data (RealEstateAgent).
- `App.jsx`: routing con `React.lazy` + `Suspense` — code splitting por página.
- Cada página tiene su propio `<Helmet>` con title y meta description únicos:
  - `/` → "Punto Raíz — Corredora de Propiedades"
  - `/propiedades` → "Propiedades — Punto Raíz"
  - `/propiedades/:id` → "{titulo propiedad} — Punto Raíz" + OG image
  - `/vender` → "Vender — Punto Raíz"
  - `/nosotros` → "Nosotros — Punto Raíz"
  - `/contacto` → "Contacto — Punto Raíz"
  - `/publicar` → "Publicar Propiedad — Punto Raíz"
- OG tags (Open Graph) y Twitter Card en Home.
- Lazy loading: cada página se carga solo cuando se navega a ella.

### Sesión 6 (24 Jun 2026) — Mapa real en PropertyDetail

**Qué se hizo:**
- Instalado `leaflet` + `react-leaflet`.
- Agregadas coordenadas (`lat`, `lng`) aproximadas a cada propiedad en `properties.js`.
- Placeholder checkerboard reemplazado por `MapContainer` con OpenStreetMap tiles.
- Marcador con Popup mostrando título y ubicación de la propiedad.
- Fix al icono default de Leaflet para que funcione con Vite.
- Leaflet se carga solo en la ruta `/propiedades/:id` gracias al code splitting.

### Sesión 7 (24 Jun 2026) — Filtros en cascada + estado vacío

**Qué se hizo:**
- Properties.jsx: `availableTypes` y `availableCommunes` calculados con `useMemo` según combinación actual de filtros.
- Al cambiar un filtro, si el otro filtro queda sin propiedades válidas, se resetea automáticamente a "Todos"/"Todas".
- Cuando ningún resultado coincide, se muestra estado vacío con icono `SearchX` + "Sin resultados" + mensaje.
- Hero.jsx: `computeAvailable(pool, tipo, comuna)` reemplaza arrays estáticos `tipos`/`comunas`.
- Hero.jsx: al cambiar operación (Comprar ↔ Arriendo), los selects Tipo y Comuna se limitan a opciones disponibles.
- Hero.jsx: si el valor seleccionado queda inválido, se reasigna al primero disponible.

### Sesión 8 (24 Jun 2026) — Corrección cascada + responsividad Hero

**Qué se hizo:**
- Hero.jsx: revertida lógica de cascada. Ahora `tipos` muestra todos los disponibles para la operación (sin filtrar por comuna). `comunas` se filtra por operación + tipo.
- Hero.jsx: al cambiar operación se resetean tipo y comuna. Al cambiar tipo se resetea comuna.
- Properties.jsx: misma corrección — `availableTypes` depende solo de `basePool`, `availableCommunes` se filtra por tipo.
- Properties.jsx: al cambiar tipo se resetea comuna a "Todas".
- Hero.jsx: estructura responsiva corregida. Section usa `flex flex-col justify-end`, contenido en `flex-1`, form en flujo normal con `mb-[42px]` (ya no es `absolute`). Beneficios siempre quedan sobre el form sin importar el viewport.

### Sesión 9 (24 Jun 2026) — Rebranding: Horizonte Inmobiliario

**Qué se hizo:**
- Logo reemplazado en Navbar: icono (Home+Sprout) + texto "Punto Raiz" → imagen `/logo.png`
- Navbar import `lucide-react` simplificado (solo `Menu`, `Phone`)
- Todos los `<title>` y `<meta>` tags actualizados de "Punto Raíz" a "Horizonte Inmobiliario"
- JSON-LD structured data actualizado con nuevo nombre y dominio
- Correos `contacto@puntoraiz.cl` → `contacto@horizonteinmobiliario.cl`
- URLs `https://puntoraiz.cl` → `https://horizonteinmobiliario.cl`
- Texto "con Punto Raiz" en Hero → "con Horizonte Inmobiliario"
- Descripciones en About, Properties, PropertyDetail actualizadas
- `public/logo.png` creado con el nuevo isotipo
- Logo escalado de 52px → 80px (aprox +50%)
- Navbar: quitado `min-w-[250px]` del NavLink del logo para que el layout quede balanceado; logo ahora ocupa su ancho natural
- Hero: separación de 60px entre beneficios y formulario de búsqueda
- Nombre corregido de "Horizonte Inmobiliaria" → "Horizonte Inmobiliario" en todos los archivos (incluyendo dominios)
- Eliminados spans redundantes (`text-mint font-black uppercase`) en Featured ("Seleccionadas"), Sell ("Vende con respaldo"), Publish ("Publica tu propiedad"), About ("Nosotros") y Contact ("Contacto") — los headings ya comunicaban lo mismo
- Eliminados `mt-[10px]`/`mt-2` de headings que quedaban con espacio extra al haber perdido el span superior
- Reducido padding superior de secciones principales de 76px → 52px en Properties, Sell, About, Contact y Publish para acercar H1 al navbar

### Sesión 10 (24 Jun 2026) — Carrusel + modal de galería en PropertyDetail

**Qué se hizo:**
- Grilla de imágenes reemplazada por carrusel con slide horizontal (CSS transition)
- Flechas de navegación izquierda/derecha con ciclo infinito
- Indicadores (dots) clicables abajo del carrusel
- Botón "Ver fotos" abre modal/lightbox a pantalla completa con overlay negro
- Navegación del modal por flechas + teclado (Escape/ArrowLeft/ArrowRight)
- Contador de fotos (ej. "3 / 7") y body scroll bloqueado mientras el modal está abierto

### Sesión 11 (24 Jun 2026) — Ajustes de layout, scroll al navegar, ortografía

**Qué se hizo:**
- Featured: separación Hero-Props destacadas con `pt-[60px]`.
- PropertyCard: card más grande (aspect, padding, fuentes), precio con `whitespace-nowrap`, "Ver detalle" centrado abajo del precio.
- App.jsx: `ScrollToTop` en cada cambio de ruta.
- PropertyDetail: en mobile, precio con contactar/llamar se inserta entre specs y descripción (bloque `xl:hidden`), aside oculto en mobile.
- Corregida ortografía española en todos los archivos del frontend.

### Sesión 12 (24 Jun 2026) — Grid responsivo de datos principales en PropertyDetail

**Qué se hizo:**
- PropertyDetail: grilla "Datos principales" cambiada de `grid-cols-1` a `grid-cols-2` en mobile, manteniendo `md:grid-cols-4` en desktop. Así en celular se ven 2 datos por fila (Superficie | Dormitorios / Baños | Año).

### Sesión 13 (24 Jun 2026) — Rediseño del Footer

**Qué se hizo:**
- Footer rediseñado: eliminados enlaces de navegación (Propiedades, Vender, Arriendos, Contacto).
- Agregado logo `LogoHorizonteInmobiliarioVerde.png` copiado a `public/logo-verde.png`.
- Agregados botones de redes sociales: Instagram, YouTube, TikTok con iconos SVG inline.
- Contacto (email y teléfono) en línea horizontal en desktop, vertical en mobile.
- Estilo centrado, minimalista, con opacidades y hover suaves.

### Sesión 14 (24 Jun 2026) — Navbar: logo fijo + fuentes más grandes

**Qué se hizo:**
- Navbar: logo con `flex-shrink-0` para que no se comprima al angostar la ventana.
- Navbar: links de navegación aumentados de `text-[0.95rem]` a `text-[1.1rem]`.
- Navbar: teléfono y botón "Publica tu propiedad" ajustados a `text-[1.1rem]` para mantener proporción.
- Menú mobile: links, teléfono y botón también actualizados a `text-[1.1rem]`.

### Sesión 15 (24 Jun 2026) — Reorden de links en Navbar

**Qué se hizo:**
- Navbar: orden cambiado a Inicio → Propiedades → Arriendos → Vender → Nosotros → Contacto.
