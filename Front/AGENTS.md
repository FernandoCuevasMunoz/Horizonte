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
├── .env                    # Credenciales Cloudinary (gitignored)
├── index.html              # SEO: lang=es-CL, Inter font, meta tags
├── tailwind.config.js      # Sistema de diseño (colores, fonts)
├── vite.config.js
├── scripts/
│   ├── .env                # Credenciales Cloudinary (gitignored)
│   ├── cloud-upload.sh     # Wrapper bash que carga .env y llama upload-cloudinary.js
│   ├── upload-cloudinary.js# Sube imágenes a Cloudinary con watermark baked in
│   └── clean-cloudinary.js # Elimina todas las imágenes de una carpeta en Cloudinary
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

## Cloudinary

- Cuenta con cloud name `k1liapob`.
- Imágenes se suben a la carpeta `horizonte-inmobiliario` en Cloudinary.
- Logo de watermark subido como `wm-logo` (en la raíz, sin carpeta — overlay con carpeta daba 400).
- **Todas las imágenes se redimensionan a 2000px de ancho** con `sharp` antes de subir a Cloudinary (sin `withoutEnlargement`, para que todas tengan el mismo ancho y el watermark de 300px fijos se vea consistente).
- **Todas las imágenes subidas incluyen watermark del logo** (esquina inferior derecha, 90% opacidad, 300px).
- Scripts en `scripts/`:
  - `upload-cloudinary.js` — Sube imágenes desde una carpeta y genera URLs con watermark baked in (usa `cloudinary.url()` con la transformación). No necesita transformación runtime.
  - `clean-cloudinary.js` — Elimina todas las imágenes de una carpeta en Cloudinary.
  - `cloud-upload.sh` — Wrapper bash que carga `scripts/.env` y ejecuta `upload-cloudinary.js`.
- Credenciales en `scripts/.env` (gitignored via `.gitignore`).

### Procedimiento estandarizado para nueva propiedad

```bash
# 1. Subir imágenes (genera URLs con watermark)
set -a && source scripts/.env && set +a && node scripts/upload-cloudinary.js "/ruta/a/imagenes"

# 2. Reemplazar URLs en src/data/properties.js y hacer build
npm run build
```

### Para re-subir desde cero (limpiar + subir)

```bash
# 1. Eliminar todas las imágenes de la carpeta
set -a && source scripts/.env && set +a && node scripts/clean-cloudinary.js

# 2. Subir de nuevo (el script regenera con watermark)
set -a && source scripts/.env && set +a && node scripts/upload-cloudinary.js "/ruta/a/imagenes"
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

### Sesión 16 (24 Jun 2026) — Footer: LinkedIn, Facebook y corrección TikTok

**Qué se hizo:**
- Footer: agregado icono de LinkedIn con SVG inline.
- Footer: agregado icono de Facebook con SVG inline.
- Footer: reemplazado SVG de TikTok por uno más limpio y reconocible.

### Sesión 17 (24 Jun 2026) — Formulario Vender completo + ortografía

**Qué se hizo:**
- Sell.jsx: formulario de tasación reemplazado por formulario completo con 7 secciones.
- Secciones: Datos Personales (nombres, apellidos, teléfono, email), Ubicación (dirección, nro complementario), Comuna (select con todas las comunas RM ordenadas alfabéticamente), Propiedad (tipo, valor venta), Descripción (textarea), Preferencias de Contacto (checkboxes horario 8–21), Información Adicional (cómo llegaste, publicada por terceros).
- Sección Comuna y Propiedad en la misma fila en desktop (grid-cols-2).
- Tarjetas de servicios movidas antes del formulario, en grid de 3 columnas.
- Layout desktop: tarjetas a la izquierda (2 por fila) y formulario a la derecha (luego revertido).
- Layout final: hero → tarjetas (3 por fila) → formulario centrado (max-w-[800px]).
- Título del formulario: "Vende con nosotros".
- Botón: "Enviar Solicitud".
- Eliminado campo "Fecha esperada de venta".
- Placeholder teléfono actualizado a +56 9 9300 1522.
- Texto tarjeta "Gestión documental" actualizado.
- Texto "¿A qué hora te acomoda que te llamemos?" → "¿A qué hora te acomoda que te contactemos?".
- Ancho máximo del main incrementado de 1120px a 1280px.
- **Revisión ortográfica completa del proyecto:** corregidos 38 errores de tildes y ñ en Navbar, Hero, Featured, About, Contact, Publish y properties.js.
- Número de teléfono cambiado de +56 9 1234 5678 a +56 9 9300 1522 en todos los archivos.

### Sesión 18 (24 Jun 2026) — Efectos motion en botones

**Qué se hizo:**
- Instalada librería `motion` (framer-motion v11+) para animaciones.
- `main.jsx`: envuelto en `<MotionConfig>` con transición global (duration 0.3, ease easeInOut).
- Agregados efectos de escala (whileHover: 1.03–1.12, whileTap: 0.9–0.97) en todos los botones principales del proyecto:
  - Navbar: teléfono, menú hamburguesa mobile.
  - Hero: botones "Ver propiedades", "Vende tu propiedad", "Buscar".
  - PropertyDetail: "Ver fotos", "Llama al" (x2), cerrar galería modal.
  - Footer: iconos de redes sociales.
  - Formularios: botones submit y "Enviar otra solicitud"/"Publicar otra propiedad"/"Enviar otro mensaje" en Sell, Contact, Publish.
  - Sell: botones de selección de horario.
- Botones con `disabled` no aplican efectos (respetan `disabled:opacity-60`).

### Sesión 19 (25 Jun 2026) — Cloudinary + Watermark

**Qué se hizo:**
- Creada cuenta Cloudinary (`k1liapob`) y configuradas credenciales en `.env` y `scripts/.env`.
- Creados scripts de upload por lote en `scripts/`:
  - `upload-cloudinary.js` — Node.js que sube todas las imágenes de una carpeta a la carpeta `horizonte-inmobiliario` en Cloudinary.
  - `cloud-upload.sh` — wrapper bash que carga `.env` y ejecuta el script.
- Subidas 13 imágenes reales de **San Isidro 151** (id: 1) a Cloudinary.
- Reemplazadas las URLs de Unsplash en `properties.js` para el id 1 con las URLs de Cloudinary.
- Creado `src/utils/cloudinary.js` con helper `withWatermark(url)` que aplica overlay del logo (`logo-horizonte.png`) en esquina inferior derecha con 50% opacidad.
- Aplicado `withWatermark` en `PropertyCard.jsx` (imagen de card) y `PropertyDetail.jsx` (galería completa).
- `.gitignore` actualizado para ignorar `.env`.
- Logo subido a Cloudinary como `horizonte-inmobiliario/branding/logo-horizonte`.
- Documentado flujo de Cloudinary en sección dedicada de AGENTS.md.

### Sesión 20 (25 Jun 2026) — Watermark baked in + procedimiento estandarizado

**Qué se hizo:**
- Eliminadas todas las imágenes de Cloudinary y re-subidas con watermark baked in.
- Watermark del logo en esquina inferior derecha, 90% opacidad, 350px ancho, con sombra (`e_shadow:30`).
- Eliminado `src/utils/cloudinary.js` (ya no se necesita transformación en runtime).
- Eliminadas referencias a `withWatermark` en `PropertyCard.jsx` y `PropertyDetail.jsx`.
- Creado `scripts/clean-cloudinary.js` para eliminar imágenes por carpeta.
- Modificado `scripts/upload-cloudinary.js` para que genere URLs con watermark directamente.
- Documentado procedimiento estandarizado en la sección Cloudinary de este archivo.

### Sesión 20b (25 Jun 2026) — Fix overlay: logo sin carpeta

**Qué se hizo:**
- Detectado que el overlay con logo en subcarpeta (`l_horizonte-inmobiliario:branding:logo-horizonte`) retorna 400.
- Solución: subir logo a la raíz con public_id `wm-logo` (sin folder).
- URL de overlay corregida: `g_south_east,l_wm-logo,o_90,w_350`.
- Eliminado logo viejo de `horizonte-inmobiliario/branding/logo-horizonte`.
- Re-subidas las 13 imágenes de San Isidro 151 con el overlay corregido.
- Actualizadas URLs en `properties.js` id 1.
