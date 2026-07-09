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
- Marcado de propiedades como Vendidas/Arrendadas con overlay visual (escala de grises + badge) en cards públicas
- Recuperación de contraseña por email
- Notificaciones por email de formularios de contacto a ambos socios
- Publicación de propiedades en MercadoLibre y Portal Inmobiliario con conexión OAuth2

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
│   ├── vercel.json            # SPA rewrites para todas las rutas
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
│           ├── controller/    # PropertyController, AdminController, ContactController, MercadoLibreController
│           ├── model/         # Property, ContactMessage, AdminSetting, MercadoLibreToken, MercadoLibrePublication
│           ├── repository/    # MercadoLibreTokenRepository, MercadoLibrePublicationRepository
│           ├── service/       # PropertyService, AdminAuthService, TelegramService, ContactEmailService, ResendEmailClient, MercadoLibreService
│           └── telegram/      # HorizonteBot (bot polling, opcional)
├── Logo/                      # Assets del logo
├── Prototipe/                 # Prototipos de diseño
├── Repository/                # Fotos originales (gitignored)
└── docs/                      # Documentación (MERCADOLIBRE-INTEGRACION.md)
```

## Cloudinary

- **Cuenta:** cloud name `k1liapob`
- **Carpeta:** `horizonte-inmobiliario`
- **Watermark:** logo `wm-logo` baked in con transformación `g_south_east,l_wm-logo,o_90,w_300`
- **Upload CLI:** `node scripts/upload-cloudinary.js /ruta/a/imagenes`
- **Upload admin:** directo desde el panel vía unsigned preset `horizonte_unsigned`

## MercadoLibre

- **Integración con API MercadoLibre** para publicar en mercadolibre.cl + portalimobiliario.cl
- **OAuth2** con refresh automático (access_token: 3h, refresh_token: 6 meses)
- **Publicar/despublicar** desde el panel admin con un clic
- **Categorías Chile:** MLC1459 (Inmuebles) → subtipos por operación
- **Portal Inmobiliario:** se activa con atributo `CMG_SITE: "POI"`
- **Documentación completa:** `docs/MERCADOLIBRE-INTEGRACION.md`

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
| `RESEND_API_KEY` | API Key de Resend (reemplaza SMTP) |
| `ADMIN_EMAIL` | `fcuevas@horizonteinmobiliario.cl` |
| `EMAIL_FROM` | `fcuevas@horizonteinmobiliario.cl` |
| `CONTACT_EMAILS` | `fcuevas@horizonteinmobiliario.cl,ffigueroa@horizonteinmobiliario.cl` |
| `ML_APP_ID` | `5279813714536977` |
| `ML_SECRET_KEY` | configurada en dashboard |
| `ML_REDIRECT_URI` | `https://horizonte-6xew.onrender.com/api/ml/callback` |
| `ML_SITE_ID` | `MLC` |
| `ML_CONTACT_NAME` | `Horizonte Inmobiliario` |
| `ML_CONTACT_PHONE` | `944938291` |
| `ML_CONTACT_EMAIL` | `horizonteinmobiliariocl@gmail.com` |

## Licencia

Todos los derechos reservados. Este es un proyecto privado y su código no puede ser copiado, distribuido ni modificado sin autorización explícita.
