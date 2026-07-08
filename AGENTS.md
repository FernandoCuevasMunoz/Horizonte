# Horizonte Inmobiliario

Sitio web de corredora de propiedades (compra, venta, arriendo) con panel admin. Frontend React + Vercel, backend Spring Boot + Render (Docker), base de datos PostgreSQL + Neon.

## Stack

### Frontend
- **Lenguaje:** JavaScript (sin TypeScript)
- **Framework:** React 19 + Vite 7
- **Estilos:** Tailwind CSS 3.4 (sin archivos CSS, solo utilities inline)
- **Ruteo:** react-router-dom 7
- **Mapas:** Leaflet + react-leaflet
- **Animaciones:** motion (framer-motion v11+)
- **Iconos:** lucide-react
- **SEO:** react-helmet-async
- **Imágenes:** Cloudinary (cuenta `k1liapob`, watermark baked in)

### Backend
- **Lenguaje:** Java 21
- **Framework:** Spring Boot 3.4.4 (Maven)
- **ORM:** Spring Data JPA + Hibernate
- **Base de datos:** PostgreSQL (producción: Neon), H2 (desarrollo)
- **Deploy:** Docker (multi-stage: maven build + eclipse-temurin JRE)

### Tests
No configurados.

### Linting
No configurado (sin ESLint, sin Checkstyle).

## Comandos

### Frontend
- `npm run dev` — arranca el servidor de desarrollo (Vite, http://localhost:5173)
- `npm run build` — compila para producción (Vite build, output en `dist/`)

### Backend
- `mvn spring-boot:run -Dspring-boot.run.profiles=prod` — arranca con perfil producción (PostgreSQL)
- `mvn spring-boot:run` — arranca con perfil default (H2)
- `mvn package -DskipTests` — compila el JAR en `target/`
- `mvn clean` — limpia la carpeta `target/`

### Docker
```bash
# Construir imagen
docker build -t horizonte-backend Back/

# Correr local (mapea puerto 8080)
docker run -p 8080:8080 horizonte-backend
```

### Cloudinary
```bash
# Subir imágenes con watermark baked in
set -a && source scripts/.env && set +a && node scripts/upload-cloudinary.js "/ruta/a/imagenes"

# Limpiar carpeta completa en Cloudinary
set -a && source scripts/.env && set +a && node scripts/clean-cloudinary.js
```

## Estructura del proyecto

```
.
├── AGENTS.md               # Este archivo
├── .gitignore              # Reglas globales (DS_Store, logs, swp)
├── Front/                  # Aplicación React
│   ├── index.html          # SEO: lang=es-CL, Inter font, meta tags, JSON-LD
│   ├── vercel.json         # SPA rewrites para todas las rutas
│   ├── vite.config.js
│   ├── tailwind.config.js  # Sistema de diseño (colores, fonts)
│   ├── package.json
│   ├── public/             # logo.png, logo-verde.png, iconos redes sociales
│   ├── scripts/
│   │   ├── .env            # Credenciales Cloudinary (gitignored)
│   │   ├── upload-cloudinary.js  # Sube imágenes con sharp + watermark
│   │   ├── clean-cloudinary.js   # Elimina imágenes de una carpeta
│   │   └── cloud-upload.sh       # Wrapper bash del upload
│   └── src/
│       ├── main.jsx        # Entry: BrowserRouter + MotionConfig + HelmetProvider
│       ├── index.css       # Solo Tailwind directives + reset base
│       ├── App.jsx         # Rutas con lazy loading + ErrorBoundary + ScrollToTop
│       ├── data/
│       │   └── properties.js   # Catálogo de propiedades (datos curados manualmente)
│       ├── components/
│       │   ├── ErrorBoundary.jsx  # Captura errores de render (clase)
│       │   ├── Navbar.jsx         # Menú responsive, logo, teléfono
│       │   ├── Hero.jsx           # Hero con buscador y filtros en cascada
│       │   ├── Featured.jsx       # Propiedades destacadas
│       │   ├── PropertyCard.jsx   # Card reutilizable
│       │   ├── Footer.jsx         # Redes sociales + contacto + link admin
│       │   └── AdminLayout.jsx    # Sidebar + verificación token
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Properties.jsx      # Grid con filtros (searchParams)
│       │   ├── PropertyDetail.jsx  # Detalle + galería + mapa + PriceCard
│       │   ├── Sell.jsx            # Formulario de tasación completo
│       │   ├── About.jsx
│       │   ├── Contact.jsx
│       │   ├── Publish.jsx         # Formulario de publicación
│       │   ├── AdminLogin.jsx      # Login con rate limiting
│       │   ├── AdminForgotPassword.jsx
│       │   ├── AdminResetPassword.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminProperties.jsx # CRUD propiedades
│       │   ├── AdminPropertyForm.jsx # Form crear/editar propiedad
│       │   └── AdminMessages.jsx
│       └── utils/
│           ├── api.js          # Fetch wrapper + endpoints
│           ├── validation.js   # required, email, phone, minLength
│           ├── format.js       # formatCLP, formatUFEstimate
│           └── ufRate.js       # Fetch y caché de UF
├── Back/                   # API Spring Boot
│   ├── Dockerfile          # Multi-stage build
│   ├── .dockerignore
│   ├── pom.xml
│   ├── run.sh              # Script de inicio local
│   ├── seed.mjs            # Seed de propiedades en DB (Node.js)
│   └── src/main/
│       ├── resources/
│       │   ├── application.properties      # Config default (H2, fallbacks)
│       │   └── application-prod.properties # Config producción (PostgreSQL/Neon)
│       └── java/com/horizonteinmobiliario/
│           ├── HorizonteInmobiliarioApplication.java
│           ├── config/
│           │   └── CorsConfig.java
│           ├── controller/
│           │   ├── PropertyController.java   # GET públicos
│           │   ├── AdminController.java      # CRUD auth + rate limiting
│           │   └── ContactController.java    # Formularios públicos
│           ├── model/
│           │   ├── Property.java
│           │   ├── ContactMessage.java
│           │   └── AdminSetting.java
│           ├── repository/
│           ├── service/
│           │   ├── PropertyService.java
│           │   ├── AdminAuthService.java
│           │   └── TelegramService.java
│           └── telegram/
│               └── HorizonteBot.java         # Bot polling (opcional)
├── Logo/                   # Assets del logo
├── Prototipe/              # Prototipos de diseño
└── Repository/             # Fotos originales de propiedades
    └── Rent/
```

## Convenciones

### Frontend
- **Sin archivos CSS** — todo con Tailwind utilities inline.
- **Sin comentarios en JSX** — el código se explica solo.
- **Mobile first** — clases responsive con Tailwind (sm:, md:, lg:, xl:). Breakpoints nativos: 640/768/1024/1280.
- **Forms** tienen `name` en inputs y `onSubmit` con `preventDefault`.
- **Navbar** absolute solo en Home, relative en el resto. En detail page usa texto `#111`.
- **API calls** nunca con catch vacío — siempre mostrar error visible al usuario.
- **Browser compat** — no usar ES2023+ (ej. `toReversed()`) sin transpilación.

### Backend
- **`@Value` no resuelve env vars con relaxed binding** — siempre agregar la propiedad explícita en `application.properties` con `${ENV_VAR:default}`.
- **Operaciones concurrentes** usar `ConcurrentHashMap.compute()` atómico (no get+put).
- **Partial updates** — leer entidad existente y sobreescribir solo campos no-nulos (no `save()` con body parcial).
- **CORS** — los orígenes se trimean después de split por coma.

### Generales
- **Nomenclatura propiedades:** PRV-XXX (venta) / PRA-XXX (arriendo), correlativo por tipo.

## No hagas

- **No instalar dependencias sin avisar.**
- **No subir archivos `.env*` al repositorio** — están en `.gitignore`.
- **No modificar `src/data/properties.js` sin coordinación** — datos curados manualmente con imágenes reales de Cloudinary.
- **No silenciar excepciones** — `.catch(() => {})` está prohibido, siempre mostrar error al usuario.
- **No usar `@Value` para env vars sin poner la propiedad explícita en `application.properties`** — Spring Boot 3 no hace relaxed binding con `@Value`.
- **No tocar `Back/application-prod.properties` sin registrar las env vars correspondientes en Render.**
- **No editar `public/logo.png` o `public/logo-verde.png` sin reemplazar también el asset.**

## Flujo de trabajo

- Antes de una tarea no trivial, propón un plan y espera mi OK.
- Una tarea a la vez; al terminar, dime qué cambiaste para que lo revise.
- Si no estás seguro al 80%, pregunta. No inventes.

## Documentación

### Cloudinary

- **Cuenta:** cloud name `k1liapob`.
- **Carpeta:** `horizonte-inmobiliario`.
- **Watermark:** logo subido como `wm-logo` (en la raíz, sin carpeta). Se aplica baked in con transformación: `l_wm-logo,g_center,o_90,w_0.30,fl_relative` (centrado, 30% del ancho de la imagen).
- **Estandarización:** todas las imágenes se redimensionan a 2000px de ancho con `sharp` antes de subir.
- **Scripts:** `scripts/upload-cloudinary.js` (subir), `scripts/clean-cloudinary.js` (limpiar carpeta), `scripts/cloud-upload.sh` (wrapper).
- **Procedimiento para nueva propiedad (datos curados):**
  1. Subir imágenes con watermark: `set -a && source scripts/.env && set +a && node scripts/upload-cloudinary.js "/ruta/a/imagenes"`
  2. Reemplazar URLs en `src/data/properties.js` y hacer build: `npm run build`
- **Upload desde admin:** usa unsigned preset `horizonte_unsigned` con upload directo desde el browser. Watermark se aplica vía URL transformation: replace `/upload/` por `/upload/l_wm-logo,g_center,o_90,w_0.30,fl_relative/`. Imágenes quedan en carpeta `horizonte-inmobiliario`.

### Producción

| Servicio | Plataforma | URL |
|----------|------------|-----|
| Frontend | Vercel | `https://www.horizonteinmobiliario.cl` |
| Backend | Render (Docker) | `https://horizonte-6xew.onrender.com` |
| BD | Neon PostgreSQL | `ep-delicate-glitter-atdg4sw9-pooler.c-9.us-east-1.aws.neon.tech` |

**Env vars en Render:**

| Variable | Valor |
|----------|-------|
| `PGHOST` | `ep-delicate-glitter-atdg4sw9-pooler.c-9.us-east-1.aws.neon.tech` |
| `PGPORT` | `5432` |
| `PGDATABASE` | `neondb` |
| `PGUSER` | `neondb_owner` |
| `PGPASSWORD` | configurada en dashboard |
| `ADMIN_PASSWORD` | configurada en dashboard |
| `CORS_ALLOWED_ORIGINS` | `https://www.horizonteinmobiliario.cl,https://horizonteinmobiliario.cl` |
| `TELEGRAM_BOT_TOKEN` | (vacío) |
| `TELEGRAM_CHAT_ID` | (vacío) |
| `EMAIL_HOST` | `smtp.resend.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USERNAME` | `resend` |
| `EMAIL_PASSWORD` | configurada en dashboard |
| `ADMIN_EMAIL` | `fcuevas@horizonteinmobiliario.cl` |
| `EMAIL_FROM` | `fcuevas@horizonteinmobiliario.cl` |
| `CONTACT_EMAILS` | `fcuevas@horizonteinmobiliario.cl,ffigueroa@horizonteinmobiliario.cl` |

**Env vars en Vercel:**

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://horizonte-6xew.onrender.com/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `k1liapob` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `horizonte_unsigned` |

### Historial de sesiones

| # | Fecha | Título | Resumen |
|---|-------|--------|---------|
| 1 | 24 Jun | Migración CSS → Tailwind | Migrados todos los componentes a Tailwind utilities, eliminados 12 CSS, corregido index.html |
| 2 | 24 Jun | Forms con estado y validación | Creado validation.js, formularios Sell/Contact/Publish con useState + validación |
| 3 | 24 Jun | Buscador Hero conectado a filtros | Hero con selects reales, navegación a /propiedades?tipo=X&comuna=Y, filtros con useSearchParams |
| 4 | 24 Jun | Nuevo tipo Local comercial | Agregado tipo "Local comercial" a catálogo y todos los select del sitio |
| 5 | 24 Jun | SEO + Performance | react-helmet-async, JSON-LD, lazy loading con React.lazy + Suspense |
| 6 | 24 Jun | Mapa real en PropertyDetail | Leaflet + react-leaflet con OpenStreetMap, marcador con popup |
| 7 | 24 Jun | Filtros en cascada + estado vacío | Filtros que se actualizan según combinación actual, estado "Sin resultados" |
| 8 | 24 Jun | Corrección cascada + Hero responsivo | Lógica de cascada corregida (tipos por operación, comunas por tipo+operación), layout Hero reparado |
| 9 | 24 Jun | Rebranding: Horizonte Inmobiliario | Logo reemplazado, titles/metas actualizados, nombre corregido en todo el sitio |
| 10 | 24 Jun | Carrusel + modal de galería | Carrusel con slide, flechas, dots, modal lightbox con teclado |
| 11 | 24 Jun | Layout, scroll, ortografía | ScrollToTop, PriceCard mobile, corrección ortográfica general |
| 12 | 24 Jun | Grid responsivo datos principales | Datos principales en grid-cols-2 mobile, md:grid-cols-4 desktop |
| 13 | 24 Jun | Rediseño Footer | Footer minimalista con logo, redes sociales (IG, YT, TT, LI, FB), contacto |
| 14 | 24 Jun | Navbar: logo fijo + fuentes grandes | Logo con flex-shrink-0, links a 1.1rem |
| 15 | 24 Jun | Reorden links Navbar | Inicio → Propiedades → Arriendos → Vender → Nosotros → Contacto |
| 16 | 24 Jun | Footer: LinkedIn, Facebook | Agregados iconos de LinkedIn y Facebook, TikTok mejorado |
| 17 | 24 Jun | Formulario Vender completo | Formulario de 7 secciones, ortografía general, teléfono actualizado |
| 18 | 24 Jun | Efectos motion | Librería motion instalada, whileHover/whileTap en todos los botones principales |
| 19 | 25 Jun | Cloudinary + Watermark | Cuenta Cloudinary, scripts de upload, watermark en runtime, 13 imágenes reales |
| 20 | 25 Jun | Watermark baked in | Watermark horneado al subir, eliminado helper runtime, procedimiento documentado |
| 20b | 25 Jun | Fix overlay logo sin carpeta | Logo movido a raíz de Cloudinary (wm-logo), overlay corregido |
| 20c | 28 Jun | Watermark relativo + estandarización | sharp para redimensionar a 2000px, watermark fijo 300px, re-subida de imágenes |
| 21 | 28 Jun | Rate limiting + recuperación contraseña | 5 intentos/IP/15min, forgot/reset password con código, mailing |
| 22 | 28 Jun | Logo en sidebar admin | AdminLayout con logo en color original sobre fondo blanco |
| 23 | 28 Jun | Full audit + ~30 bugs | Front: grid responsivo, cursor jumping, labels, API real, motion, cleanup. Back: seguridad, race conditions, partial update, Telegram, overflow, seed |
| 24 | 28 Jun | Preparación deploy | .gitignore, PostgreSQL/Neon, PORT dinámico, CORS configurable |
| 25 | 29 Jun | Auditoría frontend + ~13 fixes | ErrorBoundary global, labels, motion faltantes, hardcoded values, gallery edge case, silent catches, browser compat, numericPrice bug |
| 26 | 29 Jun | Deploy: Docker, Render, Vercel, Neon | Dockerfile multi-stage, arquitectura: Vercel (front) + Render Docker (back) + Neon (BD) |
| 27 | 29 Jun | Deploy real: dominios, CORS, fixes | application-prod.properties con fallbacks Telegram, env vars finales, dominio www |
| 28 | 2 Jul | Fix CORS real | @Value no resuelve env vars directamente, property bridge en application.properties, trim de orígenes, Telegram fallbacks |
| 29 | 6 Jul | Favicon, medios baños, pisos departamento, edición admin | Favicon desde logo; eliminado "Medios baños" de PropertyDetail; Cantidad de pisos + Ubicación para deptos, Pisos genérico para otros; inputs floor/buildingFloors en formulario admin |
| 30 | 6 Jul | Contribuciones en características + parking editable | Gastos comunes y Contribuciones movidos a sección Características; campo `parking` agregado a modelo Java, controller, formulario admin y seed |
| 31 | 6 Jul | Precios: UF auto-calc, códigos auto-gen, varios | Precio UF se calcula automáticamente desde Precio CLP (readOnly); renombrados labels; eliminada sección Información adicional; precio CLP visible en lista admin; código PRV/PRA auto-generado y bloqueado |
| 32 | 6 Jul | Subida imágenes a Cloudinary desde admin | Upload directo a Cloudinary unsigned preset `horizonte_unsigned` con watermark baked in (URL transformation). Gestor visual de galería: drop zone con progreso, thumbnails, hover overlay para seleccionar imagen principal (star) o eliminar. Iconos: Star, Trash2, Upload. Env vars `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` registradas en Vercel. |
| 33 | 6 Jul | Gitignore + fix Telegram + README | `Repository/` y `.env*` agregados al `.gitignore` raíz; fotos eliminadas del tracking git; `HorizonteBot` y `TelegramService` deshabilitados si token vacío/placeholder para evitar 404 en producción; `README.md` reescrito con backend, admin, Cloudinary, deploy, Docker, estructura completa. |
| 34 | 6 Jul | Formulario Vender/Arrendar + favicon | Página `/vender` ahora permite cambiar entre Venta y Arriendo con toggle pastilla; título, hero, label valor, SEO y mensaje de éxito se adaptan dinámicamente. Favicon reemplazado por `IconoHI2.png`. |
| 35 | 6 Jul | Galería reordenable + reorganización form admin + sección Info. adicional | Drag & drop + ⬆/⬇ en galería admin; campos reordenados (Gastos comunes bajo Año const., Piso unidad + Total pisos después, Equipamiento/Cercanías bajo mapa); Contribuciones oculto en arriendo; Orientación en detalle público; sección "Información adicional" con Equipamiento/Cercanías en PropertyDetail; fix watermark en upload admin (URL desde `public_id`); detalle dpto. simplificado a "N° de piso". |
| 36 | 6 Jul | URLs con código PRV/PRA + Share + Vercel SPA | Rutas públicas `/propiedades/:code` en vez de `:id`; endpoint `GET /api/properties/by-code/{code}` con fallback a ID numérico; botón Compartir con tooltip "✓ Enlace copiado"; fix watermark 404 (admin upload usa `secure_url.replace`); `vercel.json` con rewrites SPA para fix 404 en recarga directa. |
| 37 | 7 Jul | SMTP Resend + email contacto a socios + HikariCP | Configurado Resend SMTP para envío de correos; creado `ContactEmailService` que notifica a ambos socios por cada formulario de contacto; separado `email.from` de `spring.mail.username` en `AdminAuthService`; HikariCP idle config para Neon; filtros de propiedades usan `neighborhood` en vez de `location`. Branch `fix/hikari-neighborhood`. Nuevas env vars: `EMAIL_FROM`, `CONTACT_EMAILS`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `ADMIN_EMAIL`. |
