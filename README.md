# Horizonte Inmobiliario

Portal web de corredora de propiedades especializado en compra, venta y arriendo de inmuebles en la Región Metropolitana. Desarrollado como SPA (Single Page Application) con React 19 y Vite 7.

## Stack técnico

- **React 19** con lazy loading y code splitting por ruta
- **Vite 7** como bundler y dev server
- **Tailwind CSS 3.4** para estilos utilitarios inline
- **react-router-dom 7** para enrutamiento SPA
- **react-helmet-async** para meta tags y SEO por página
- **Leaflet + react-leaflet** para mapas interactivos con OpenStreetMap
- **lucide-react** para iconografía

## Funcionalidades

- Búsqueda de propiedades con filtros en cascada (operación → tipo → comuna)
- Vista de detalle con carrusel de imágenes, galería modal y mapa interactivo
- Formularios con validación en cliente (tasación, contacto, publicación)
- UF actualizada vía API (mindicador.cl) con caché local
- Diseño responsive mobile-first

## Instalación

```bash
npm install
npm run dev
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
│           ├── controller/    # PropertyController, AdminController, ContactController
│           ├── model/         # Property, ContactMessage, AdminSetting
│           ├── repository/
│           ├── service/       # PropertyService, AdminAuthService, TelegramService
│           └── telegram/      # HorizonteBot (bot polling, opcional)
├── Logo/                      # Assets del logo
├── Prototipe/                 # Prototipos de diseño
└── Repository/                # Fotos originales (gitignored)
```
