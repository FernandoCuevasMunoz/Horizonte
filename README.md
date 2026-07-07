# Horizonte Inmobiliario

Portal web de corredora de propiedades especializado en compra, venta y arriendo de inmuebles en la Región Metropolitana.

## Stack

### Frontend
- **React 19** con lazy loading y code splitting por ruta
- **Vite 7** como bundler y dev server
- **Tailwind CSS 3.4** — sin archivos CSS, solo utilities inline
- **react-router-dom 7** para enrutamiento SPA
- **react-helmet-async** para SEO por página con JSON-LD
- **Leaflet + react-leaflet** para mapas interactivos con OpenStreetMap
- **motion** (framer-motion v11+) para animaciones
- **lucide-react** para iconografía
- **Cloudinary** para imágenes con watermark baked in

### Backend
- **Java 21** + **Spring Boot 3.4.4** (Maven)
- **Spring Data JPA** + **Hibernate** para persistencia
- **PostgreSQL** en producción (Neon), **H2** en desarrollo
- **Docker** multi-stage para deploy

## Funcionalidades

### Sitio público
- Búsqueda de propiedades con filtros en cascada (operación → tipo → comuna)
- Vista de detalle con carrusel, galería modal, mapa interactivo y datos clave
- Formulario Vender/Arrendar con toggle de operación y validación en cliente
- UF actualizada vía API (mindicador.cl) con caché local
- Diseño responsive mobile-first

### Panel admin
- Login con rate limiting (5 intentos/IP/15min)
- CRUD completo de propiedades con formulario
- Subida de imágenes a Cloudinary con watermark automático
- Gestión visual de galería: selección de imagen principal, reorden por drag & drop, eliminación
- Recuperación de contraseña por email

## Instalación

### Frontend
```bash
cd Front
npm install
npm run dev
```

### Backend (desarrollo con H2)
```bash
cd Back
mvn spring-boot:run
```

### Backend (producción local con PostgreSQL)
```bash
cd Back
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### Docker
```bash
docker build -t horizonte-backend Back/
docker run -p 8080:8080 horizonte-backend
```

## Estructura

```
.
├── Front/                     # SPA React
│   ├── index.html             # SEO: lang=es-CL, Inter font, meta tags, JSON-LD
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── public/                # logo, favicon, iconos redes sociales
│   ├── scripts/               # Subida/limpieza Cloudinary (CLI)
│   └── src/
│       ├── main.jsx           # Entry: BrowserRouter + MotionConfig + HelmetProvider
│       ├── App.jsx            # Rutas con lazy loading + ErrorBoundary + ScrollToTop
│       ├── components/        # Navbar, Hero, Featured, PropertyCard, Footer, AdminLayout
│       ├── pages/             # Home, Properties, PropertyDetail, Sell, About, Contact,
│       │                      # Publish, AdminLogin, AdminDashboard, AdminProperties,
│       │                      # AdminPropertyForm, AdminMessages
│       └── utils/             # api.js, format.js, ufRate.js, validation.js
├── Back/                      # API Spring Boot
│   ├── Dockerfile             # Multi-stage build
│   ├── pom.xml
│   ├── seed.mjs               # Seed de propiedades en DB
│   └── src/main/
│       ├── resources/
│       │   ├── application.properties       # Default (H2, fallbacks)
│       │   └── application-prod.properties  # Producción (PostgreSQL/Neon)
│       └── java/com/horizonteinmobiliario/
│           ├── config/        # CorsConfig
│           ├── controller/    # PropertyController, AdminController, ContactController
│           ├── model/         # Property, ContactMessage, AdminSetting
│           ├── repository/
│           ├── service/       # PropertyService, AdminAuthService, TelegramService
│           └── telegram/      # HorizonteBot (bot polling, opcional)
├── Logo/                      # Assets del logo
├── Prototipe/                 # Prototipos de diseño
└── Repository/                # Fotos originales (gitignored)
```

## Cloudinary

- **Cuenta:** cloud name `k1liapob`
- **Carpeta:** `horizonte-inmobiliario`
- **Watermark:** logo `wm-logo` baked in con transformación `g_south_east,l_wm-logo,o_90,w_300`
- **Upload CLI:** `node scripts/upload-cloudinary.js /ruta/a/imagenes`
- **Upload admin:** directo desde el panel vía unsigned preset `horizonte_unsigned`

## Deploy

| Servicio | Plataforma | URL |
|----------|------------|-----|
| Frontend | Vercel | https://www.horizonteinmobiliario.cl |
| Backend | Render (Docker) | https://horizonte-6xew.onrender.com |
| BD | Neon PostgreSQL | `ep-delicate-glitter-atdg4sw9-pooler.c-9.us-east-1.aws.neon.tech` |

### Env vars en Vercel
| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://horizonte-6xew.onrender.com/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `k1liapob` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `horizonte_unsigned` |

### Env vars en Render
| Variable | Valor |
|----------|-------|
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Conexión Neon |
| `ADMIN_PASSWORD` | Contraseña admin |
| `CORS_ALLOWED_ORIGINS` | `https://www.horizonteinmobiliario.cl,https://horizonteinmobiliario.cl` |
| `TELEGRAM_BOT_TOKEN` | (opcional) Token bot Telegram |
| `TELEGRAM_CHAT_ID` | (opcional) Chat ID para notificaciones |
