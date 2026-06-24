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
Front/
├── src/
│   ├── components/   # Navbar, Hero, Featured, PropertyCard, Footer
│   ├── pages/        # Home, Properties, PropertyDetail, Sell, About, Contact, Publish
│   ├── data/         # Propiedades hardcodeadas
│   └── utils/        # format.js, ufRate.js, validation.js
├── public/           # Assets estáticos
└── index.html
```
