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
│   ├── App.jsx             # Rutas + ScrollToTop
│   ├── components/
│   │   ├── ErrorBoundary.jsx # Captura errores de render (clase)
│   │   ├── Navbar.jsx      # Menú responsive con toggle mobile
│   │   ├── Hero.jsx        # Hero principal con buscador
│   │   ├── Featured.jsx    # Propiedades destacadas
│   │   ├── PropertyCard.jsx# Card de propiedad reutilizable
│   │   ├── Footer.jsx
│   │   └── AdminLayout.jsx # Sidebar + verificación token
│   ├── pages/
│   │   ├── Home.jsx        # / — Navbar + Hero + Featured + Footer
│   │   ├── Properties.jsx  # /propiedades — grid con filtros
│   │   ├── PropertyDetail.jsx# /propiedades/:id — detalle completo + mapa
│   │   ├── Sell.jsx        # /vender — formulario tasación
│   │   ├── About.jsx       # /nosotros — stats + valores
│   │   ├── Contact.jsx     # /contacto — formulario + datos
│   │   ├── Publish.jsx     # /publicar — formulario publicación
│   │   ├── AdminLogin.jsx  # Login admin con rate limiting display
│   │   ├── AdminForgotPassword.jsx # Solicitar código
│   │   ├── AdminResetPassword.jsx  # Reset con código
│   │   ├── AdminDashboard.jsx# Dashboard con stats
│   │   ├── AdminProperties.jsx# CRUD propiedades
│   │   ├── AdminPropertyForm.jsx# Form crear/editar propiedad
│   │   └── AdminMessages.jsx# Bandeja de mensajes
│   └── utils/
│       ├── api.js          # Fetch wrapper + endpoints
│       ├── validation.js   # required, email, phone, minLength
│       ├── format.js       # formatCLP, formatUFEstimate
│       └── ufRate.js       # Fetch y caché de UF
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

### Sesión 21 (25 Jun 2026) — Botón Admin en Footer

**Qué se hizo:**
- Footer.jsx: agregado enlace "Admin" al lado del copyright que apunta a `/admin/login`.
- Estilo discreto: texto blanco con 30% opacidad, hover a 60%.

### Sesión 22 (25 Jun 2026) — Código correlativo de propiedad

**Qué se hizo:**
- Agregado campo `code` a todas las propiedades en `properties.js` y `seed.mjs`.
- Nomenclatura: **PRV-XXX** (Propiedad en Venta) y **PRA-XXX** (Propiedad en Arriendo), con correlativo por tipo.
- `PropertyCard.jsx`: muestra el código junto al badge de operación.
- `PropertyDetail.jsx`: reemplazada referencia genérica "PR-{id}00{area}" por `property.code` en las tarjetas de precio (mobile y desktop). También actualizado el código en características.
- `Property.java` (backend): agregado campo `code` con getter/setter.
- `AdminPropertyForm.jsx`: agregado campo "Código" en el formulario de creación/edición.
- `AdminProperties.jsx`: muestra el código en la lista de propiedades.

### Sesión 20b (25 Jun 2026) — Fix overlay: logo sin carpeta

**Qué se hizo:**
- Detectado que el overlay con logo en subcarpeta (`l_horizonte-inmobiliario:branding:logo-horizonte`) retorna 400.
- Solución: subir logo a la raíz con public_id `wm-logo` (sin folder).
- URL de overlay corregida: `g_south_east,l_wm-logo,o_90,w_350`.
- Eliminado logo viejo de `horizonte-inmobiliario/branding/logo-horizonte`.
- Re-subidas las 13 imágenes de San Isidro 151 con el overlay corregido.
- Actualizadas URLs en `properties.js` id 1.

### Sesión 20c (28 Jun 2026) — Watermark relativo + estandarización a 2000px

**Qué se hizo:**
- Watermark cambiado de `w_350` (absoluto) a `w_0.4` (40% del ancho) para que escale, pero en fotos chicas seguía siendo grande y en gigantes pequeño.
- Probado `w_1.0` (100%) → demasiado grande en fotos chicas.
- Probado `c_limit,w_3000` + `w_300` → mejora pero no soluciona la raíz.
- **Solución final:** redimensionar todas las imágenes localmente con `sharp` a 2000px de ancho (`fit: 'inside'`, sin `withoutEnlargement`) antes de subir.
- Instalado `sharp` via npm.
- Modificado `upload-cloudinary.js` para leer cada imagen, redimensionarla con `sharp`, y subir el buffer via `upload_stream`.
- Eliminada constante `WATERMARK` no usada del script.
- El watermark queda en `g_south_east,l_wm-logo,o_90,w_300` fijo — al estar todas las imágenes estandarizadas a 2000px, el logo se ve idéntico en proporción.
- Re-subidas las 13 imágenes.

### Sesión 21 (28 Jun 2026) — Rate limiting + recuperación de contraseña

**Qué se hizo:**
- **Rate limiting en login:** máximo 5 intentos fallidos por IP en ventana de 15 minutos. Bloqueo de 15 minutos. Implementado en `AdminAuthService` con `ConcurrentHashMap`.
- **Recuperación de contraseña por email:**
  - `POST /api/admin/forgot-password` — genera código de 8 caracteres (válido 15 min), lo envía por email si SMTP está configurado o lo logea en consola.
  - `POST /api/admin/reset-password` — recibe `code` + `newPassword`, valida y actualiza.
  - La nueva contraseña se persiste en la tabla `admin_settings` de H2 (columna `setting_key`/`setting_value` para evitar palabra reservada `key`/`value`).
  - Al resetear se invalidan todos los tokens activos.
- **Backend:**
  - Creado `AdminSetting.java` (entity), `AdminSettingRepository.java`.
  - Agregado `spring-boot-starter-mail` al `pom.xml`.
  - Configurado SMTP en `application.properties` (todo por env vars: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `ADMIN_EMAIL`).
  - `run.sh` actualizado con las nuevas env vars.
- **Frontend:**
  - Creadas páginas `AdminForgotPassword.jsx` y `AdminResetPassword.jsx`.
  - `AdminLogin.jsx`: agregado "¿Olvidaste tu contraseña?" + contador de intentos restantes.
  - `api.js`: agregados métodos `forgotPassword()` y `resetPassword()`.
  - `App.jsx`: agregadas rutas `/admin/forgot-password` y `/admin/reset-password`.
  - `api.js`: manejador `request()` mejorado para parsear JSON incluso en errores.
- Compilado y probado: login correcto, login incorrecto con `remainingAttempts`, forgot-password con código en consola.

### Sesión 22 (28 Jun 2026) — Logo en sidebar del admin

**Qué se hizo:**
- `AdminLayout.jsx`: reemplazado el header del sidebar (`p-4 border-b`) para que muestre el logo `/logo.png` con fondo blanco (en vez de `brightness-0 invert` sobre `bg-forest-dark` que lo volvía invisible).
- El logo se ve en su color original (verde) sobre fondo blanco, centrado con `h-10`.
- Mobile header también actualizado con el logo `/logo.png` junto al botón hamburguesa.

### Sesión 23 (28 Jun 2026) — Full audit + ~30 bugs corregidos (Front + Back)

**Qué se hizo — Frontend:**

- **Layout & Responsive:**
  - `Featured.jsx`: corregido grid responsivo — clase base `grid-cols-4` movida primero para que breakpoints `lg:grid-cols-3` etc. no se sobreescriban.
  - `Properties.jsx`: mismo fix para `grid-cols-3`.

- **Formularios (Sell, Contact, Publish):**
  - **Cursor jumping:** Movidos `Input`, `Select`, `SectionHeader` fuera del componente `Sell` para que React no los remonte en cada keystroke.
  - **Formato precio:** `valorVenta` en `Sell.jsx` cambiado a `type="text"` con formato de separadores de miles (puntos) en vivo; almacena el número limpio sin puntos.
  - **Label:** Agregados elementos `<label>` en `Contact.jsx` y `Publish.jsx` para accesibilidad.
  - **API real:** Los 3 formularios (`Sell`, `Contact`, `Publish`) reemplazaron `setTimeout` de simulación por llamadas reales a `api.contact()` con distintos `type` (`venta`, `contacto`, `publicacion`).
  - **apiError:** Agregado estado `apiError` en los 3 formularios para mostrar errores de red/API.

- **UI components:**
  - `PropertyDetail.jsx`: imports de `lucide-react` movidos arriba (antes bloqueaban tree-shaking). Extraído componente `<PriceCard>` para eliminar duplicación de código de tarjeta de precio mobile + desktop.
  - `Navbar.jsx`: `aria-label` dinámico (`"Abrir menú"` / `"Cerrar menú"`) según estado del toggle.
  - `Footer.jsx`: enlace "Admin" cambiado de `<a href>` a `<Link to>` (evita recarga completa).
  - `PropertyCard.jsx`: muestra precio en UF como primario cuando `property.price` empieza con "UF".
  - `AdminLayout.jsx`: agregada bandera `mounted` en efecto de `api.verify()` para prevenir setState después de desmontar.

- **Cleanup:**
  - `Sell.jsx`: eliminado `fechaVenta` no usado del estado inicial.
  - `AdminMessages.jsx`: eliminada línea `const types` no usada.
  - `index.html`: corregido teléfono en JSON-LD de `+56912345678` a `+56993001522`.

- **Configuración:**
  - `api.js`: `BASE` url ahora usa `import.meta.env.VITE_API_URL` con fallback a `http://localhost:8080/api`.

- **Motion effects:** Los botones `whileHover`/`whileTap` en `Sell.jsx`, `Contact.jsx` y `Publish.jsx` ahora son condicionales — no se aplican cuando el botón está disabled.

**Qué se hizo — Backend (todos corregidos):**

- **Seguridad (crítico):**
  - `PropertyController.java`: eliminados `@PostMapping` y `@DeleteMapping` públicos (sin autenticación). Movidos a `AdminController`.
  - `AdminController.java`: agregado `@PostMapping("/properties")` para crear propiedades con autenticación.
  - `AdminController.java`: agregado `X-Forwarded-For` support — método `getClientIp()` que primero revisa header.

- **Race conditions (crítico):**
  - `AdminAuthService.java`: `recordFailure()` ahora usa `ConcurrentHashMap.compute()` atómico en vez de get+put.
  - `AdminAuthService.java`: `login()` inlinea el chequeo de bloqueo antes de comparar password (elimina TOCTOU entre `isBlocked()` y `recordFailure()`).
  - `AdminAuthService.java`: `resetPassword()` usa `resetCodes.remove()` en vez de get+remove (atómico).

- **Partial update bug (crítico):**
  - `AdminController.java`: `updateProperty()` ya no hace `propertyRepo.save(property)` con el body parcial (nullificaba campos no enviados). Ahora solo sobreescribe campos no-nulos en la entidad existente.

- **Telegram (configuración):**
  - `TelegramService.java`: `chatId` ahora se inyecta via `@Value("${telegram.bot.chat-id}")` (antes leía `System.getenv("TELEGRAM_CHAT_ID")`). Usa logger en vez de `System.err`.
  - `application.properties`: agregado `telegram.bot.chat-id`.
  - `run.sh`: agregado `TELEGRAM_CHAT_ID`.

- **HorizonteBot (overflow):**
  - `HorizonteBot.java`: `lastUpdateId` cambiado de `int` a `long`. El cast del `update_id` ahora usa `((Number) rawId).longValue()`. Catch vacío ahora logea warning.

- **Seed:**
  - `seed.mjs`: ahora se autentica via `POST /api/admin/login` y crea propiedades via `POST /api/admin/properties` (con Bearer token).

- **Repo duplicado:**
  - `PropertyRepository.java`: eliminado `findByTypeAndOperation` (duplicado de `findByOperationAndType`).

- **Producción:**
  - Creado `application-prod.properties`: deshabilita H2 console, pone `ddl-auto=validate`, configura datasource via env vars.
  - `run.sh`: comentario con instrucciones para perfil prod.

### Sesión 24 (28 Jun 2026) — Preparación deploy: .gitignore, PostgreSQL, PORT, CORS

**Qué se hizo:**

- **Gitignore:**
  - Creado `Back/.gitignore` con `target/`, `data/`, `*.log`, `.env`.
  - Creado `.gitignore` raíz con `.DS_Store`, `*.log`, `*.swp`, `*.swo`.

- **Backend para Render:**
  - `server.port` cambiado de `8080` a `${PORT:8080}` para que Render asigne el puerto dinámico.
  - `CorsConfig.java`: `allowedOrigins` ahora configurable via env var `cors.allowed-origins` (default localhost:5173,4173).
  - `application-prod.properties`: activada configuración PostgreSQL (Neon) con env vars `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`. Incluye `?sslmode=require` en la URL (requerido por Neon). Agregadas `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`. `ddl-auto` puesto en `update` para que cree tablas automáticamente en el primer deploy.
  - `pom.xml`: agregada dependencia `org.postgresql:postgresql` (runtime scope).

### Sesión 25 (29 Jun 2026) — Auditoría frontend + ~13 correcciones

**Qué se hizo:**

- **Error Boundary global:**
  - Creado `src/components/ErrorBoundary.jsx` (class component con `getDerivedStateFromError`).
  - `App.jsx`: envuelto `<Suspense>` + `<Routes>` en `<ErrorBoundary>`. Cualquier error de render muestra pantalla con botón "Recargar".

- **Accesibilidad (inputs sin label):**
  - `AdminLogin.jsx`: agregado `<label htmlFor="admin-password" className="sr-only">` + `id` en input.
  - `AdminResetPassword.jsx`: agregados `<label>` para código y nueva contraseña.
  - Ambos formularios ahora tienen `noValidate` (consistencia con formularios públicos).

- **Motion effects faltantes:**
  - `AdminLogin.jsx`: botón "Ingresar" ahora es `<motion.button>` con `whileHover`/`whileTap`.
  - `AdminResetPassword.jsx`: botón "Guardar" ahora es `<motion.button>`.
  - `AdminForgotPassword.jsx`: botón "Enviar código" ahora es `<motion.button>`.
  - `AdminPropertyForm.jsx`: botón submit ahora es `<motion.button>`.
  - `PropertyDetail.jsx`: enlace "Contactar" envuelto en `<motion.div>` con hover/tap.
  - `Contact.jsx`: teléfono ahora es `<motion.a>` con hover/tap.

- **Hardcoded "Medios baños: 1" y "Estacionamientos: 2":**
  - `PropertyDetail.jsx`: ahora lee `property.halfBaths` y `property.parking` con fallback a los valores actuales. Cuando el backend tenga esos campos, se mostrarán automáticamente.

- **Gallery edge case (modal con src undefined):**
  - `PropertyDetail.jsx`: botón "Ver fotos" se oculta si `gallery` está vacío.

- **Silent catch en API calls:**
  - `Hero.jsx`, `Featured.jsx`, `Properties.jsx`, `AdminDashboard.jsx`, `AdminMessages.jsx`: todos los `.catch(() => {})` reemplazados por `setApiError()` que muestra mensaje en rojo visible para el usuario.

- **Browser compat:**
  - `AdminMessages.jsx`: `messages.toReversed()` → `[...messages].reverse()` (ES2023 → ES6).

- **AdminPropertyForm numericPrice bug (crítico):**
  - `numericPrice: Number(form.numericPrice) || 0` ahora solo envía `numericPrice` si tiene valor o si es creación. En edición, si está vacío no se incluye en el body, evitando sobreescribir el valor real en DB con `0`.

- **Backend:**
  - `Property.java`: removido `import java.util.List` no usado.

- **AGENTS.md:**
  - Actualizado árbol de archivos para incluir `utils/`, `AdminLayout.jsx`, páginas admin y `ErrorBoundary.jsx`.


