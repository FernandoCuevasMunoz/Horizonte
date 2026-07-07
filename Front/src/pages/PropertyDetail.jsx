import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  Bath, BedDouble, Bell, Building2, CalendarDays, Car,
  ChevronLeft, ChevronRight, DollarSign, Heart, Home, Hash, Layers, MapPin, Phone, Receipt, Ruler, Share2, X,
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';
import { formatCLP, formatUFEstimate } from '../utils/format';
import { useUFRate } from '../utils/ufRate';

const markerSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="#1E4D40" d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="#FFF" cx="12.5" cy="12.5" r="4.5"/></svg>');
const defaultIcon = L.icon({ iconUrl: `data:image/svg+xml,${markerSvg}`, iconSize: [25, 41], iconAnchor: [12, 41], shadowUrl: iconShadow, shadowSize: [41, 41], shadowAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

function PriceCard({ property, ufRate }) {
  return (
    <>
      <div className="flex justify-end gap-[10px] mb-[22px] max-md:justify-start">
        <button className="inline-flex items-center justify-center w-[42px] h-[42px] border border-[#d9d9d9] rounded-full bg-white text-forest-dark" type="button" aria-label="Guardar propiedad">
          <Heart size={21} />
        </button>
        <button className="inline-flex items-center justify-center w-[42px] h-[42px] border border-[#d9d9d9] rounded-full bg-white text-forest-dark" type="button" aria-label="Crear alerta">
          <Bell size={21} />
        </button>
        <button className="inline-flex items-center justify-center w-[42px] h-[42px] border border-[#d9d9d9] rounded-full bg-white text-forest-dark" type="button" aria-label="Compartir propiedad">
          <Share2 size={21} />
        </button>
      </div>
      <span className="block text-[#777] text-[0.86rem] font-extrabold uppercase">{property.code}</span>
      <strong className="block mt-2 text-forest-dark text-[2.3rem] font-[950] leading-none">{formatCLP(property.numericPrice)}</strong>
      {formatUFEstimate(property.numericPrice, ufRate) && (
        <span className="block mt-1 text-[#777] text-[0.95rem] font-bold">{formatUFEstimate(property.numericPrice, ufRate)}</span>
      )}
      <p className="mt-[13px] mb-[22px] text-[#444] text-base font-[750]">{property.type} en {property.location}</p>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link className="flex items-center justify-center w-full min-h-[52px] font-[950] no-underline bg-forest text-white" to="/contacto">
          Contactar
        </Link>
      </motion.div>
      <motion.a className="flex items-center justify-center gap-[9px] w-full min-h-[52px] font-[950] no-underline border-2 border-forest text-forest-dark mt-3" href="tel:+56993001522" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Phone size={19} aria-hidden="true" />
        Llama al +56 9 9300 1522
      </motion.a>
    </>
  );
}
export default function PropertyDetail() {
  const ufRate = useUFRate();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState(-1);

  useEffect(() => {
    api.getProperty(id).then(p => {
      setProperty({ ...p, year: p.builtYear, coordinates: { lat: p.lat, lng: p.lng } });
    }).catch(() => setProperty(null)).finally(() => setLoading(false));
  }, [id]);

  const gallery = property?.gallery
    ? (Array.isArray(property.gallery) ? property.gallery : property.gallery.split('\n').filter(Boolean))
    : property?.image ? [property.image] : [];

  const close = useCallback(() => setModalIndex(-1), []);

  const prev = useCallback(() => {
    setModalIndex((i) => (i > 0 ? i - 1 : gallery.length - 1));
  }, [gallery.length]);

  const next = useCallback(() => {
    setModalIndex((i) => (i < gallery.length - 1 ? i + 1 : 0));
  }, [gallery.length]);

  useEffect(() => {
    function onKey(e) {
      if (modalIndex < 0) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalIndex, close, prev, next]);

  if (loading) return null;
  if (!property) return <Navigate to="/propiedades" replace />;

  const features = [
    [Layers, 'Total construido:', `${property.area} m2`],
    [Ruler, 'Total terreno:', `${property.area} m2`],
    [BedDouble, 'Dormitorios:', `${property.beds}`],
    [Bath, 'Baños:', `${property.baths}`],
    [Car, 'Estacionamientos:', property.parking ?? '2'],
    [CalendarDays, 'Año de construcción:', `${property.year}`],
    [DollarSign, 'Gastos comunes:', property.expenses],
    [Receipt, 'Contribuciones:', property.contributions],
  ];

  if (property.type === 'Departamento') {
    features.push(
      [Building2, 'Cantidad de pisos:', `${property.buildingFloors}`],
      [MapPin, 'Ubicación:', `${property.floor}`],
    );
  } else {
    features.push([Building2, 'Pisos:', `${property.buildingFloors}`]);
  }
  features.push([Hash, 'Código:', property.code || `GN${property.id}9436`]);

  return (
    <div className="min-h-screen bg-white text-forest-dark">
      <Helmet>
        <title>{property.title} — Horizonte Inmobiliario</title>
        <meta name="description" content={`${property.type} en ${property.location} — ${property.neighborhood}. ${property.beds} dormitorios, ${property.baths} baños, ${property.area} m2. ${property.price}.`} />
        <meta property="og:title" content={`${property.title} — Horizonte Inmobiliario`} />
        <meta property="og:description" content={`${property.type} en ${property.location}. ${property.beds} dormitorios, ${property.area} m2. ${property.price}.`} />
        <meta property="og:image" content={property.image} />
      </Helmet>
      <Navbar />
      <main className="w-[min(1240px,calc(100%-38px))] mx-auto py-6 pb-[82px]">
        <div className="mb-5">
          <Link className="inline-flex items-center gap-[7px] text-[#151515] text-[0.95rem] font-extrabold no-underline" to="/propiedades">
            <ChevronLeft size={18} aria-hidden="true" />
            Volver al listado
          </Link>
        </div>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-[34px] items-start">
          <div className="min-w-0">
            <section className="relative overflow-hidden bg-[#f2f2f2] rounded">
              <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
                {gallery.map((image) => (
                  <img className="block w-full flex-shrink-0 h-[475px] max-md:h-auto max-md:aspect-[1.35] object-cover" src={image} alt={`${property.title} galería`} key={image} />
                ))}
              </div>
              {gallery.length > 1 && (
                <>
                  <button className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border-0 rounded-full bg-white/80 text-forest-dark cursor-pointer hover:bg-white shadow-md" type="button" onClick={() => setCarouselIndex((i) => (i > 0 ? i - 1 : gallery.length - 1))} aria-label="Anterior">
                    <ChevronLeft size={22} />
                  </button>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border-0 rounded-full bg-white/80 text-forest-dark cursor-pointer hover:bg-white shadow-md" type="button" onClick={() => setCarouselIndex((i) => (i < gallery.length - 1 ? i + 1 : 0))} aria-label="Siguiente">
                    <ChevronRight size={22} />
                  </button>
                  <div className="absolute bottom-[18px] left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {gallery.map((_, i) => (
                      <button className={`w-[9px] h-[9px] rounded-full border-0 cursor-pointer ${i === carouselIndex ? 'bg-white' : 'bg-white/50'}`} type="button" onClick={() => setCarouselIndex(i)} key={i} aria-label={`Foto ${i + 1}`} />
                    ))}
                  </div>
                </>
              )}
                {gallery.length > 0 && (
                  <motion.button className="absolute right-[18px] bottom-[18px] min-h-[42px] border-0 rounded-sm bg-forest text-white px-5 font-black cursor-pointer z-10" type="button" onClick={() => setModalIndex(0)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    Ver fotos
                  </motion.button>
                )}
            </section>

            <section className="py-[34px] pb-6 border-b border-[#e8e8e8]">
              <p className="m-0 mb-[10px] text-[#606060] font-[850] uppercase">{property.operation} / {property.type}</p>
              <h1 className="m-0 text-forest-dark text-[clamp(2rem,4vw,3.15rem)] font-[950] leading-[1.08]">{property.title}</h1>
              <span className="flex items-center gap-2 mt-4 text-[#4d4d4d] text-[1.05rem] font-[750]">
                <MapPin size={19} aria-hidden="true" />
                {property.neighborhood}, {property.location}
              </span>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 border-b border-[#e8e8e8]" aria-label="Datos principales">
              <article className="grid gap-[7px] min-h-[128px] p-6 pr-[18px] border-r border-[#e8e8e8] last:border-r-0 max-md:border-r-0 max-md:border-b max-md:border-[#e8e8e8]">
                <Ruler size={22} className="text-forest-dark" aria-hidden="true" />
                <strong className="text-forest-dark text-[1.3rem] font-[950]">{property.area} m2</strong>
                <span className="text-[#666] font-[750]">Superficie</span>
              </article>
              <article className="grid gap-[7px] min-h-[128px] p-6 pr-[18px] border-r border-[#e8e8e8] last:border-r-0 max-md:border-r-0 max-md:border-b max-md:border-[#e8e8e8]">
                <BedDouble size={22} className="text-forest-dark" aria-hidden="true" />
                <strong className="text-forest-dark text-[1.3rem] font-[950]">{property.beds}</strong>
                <span className="text-[#666] font-[750]">Dormitorios</span>
              </article>
              <article className="grid gap-[7px] min-h-[128px] p-6 pr-[18px] border-r border-[#e8e8e8] last:border-r-0 max-md:border-r-0 max-md:border-b max-md:border-[#e8e8e8]">
                <Bath size={22} className="text-forest-dark" aria-hidden="true" />
                <strong className="text-forest-dark text-[1.3rem] font-[950]">{property.baths}</strong>
                <span className="text-[#666] font-[750]">Baños</span>
              </article>
              <article className="grid gap-[7px] min-h-[128px] p-6 pr-[18px] last:border-r-0">
                <Home size={22} className="text-forest-dark" aria-hidden="true" />
                <strong className="text-forest-dark text-[1.3rem] font-[950]">{property.year}</strong>
                <span className="text-[#666] font-[750]">Año</span>
              </article>
            </section>

            <section className="xl:hidden border border-[#e1e1e1] bg-white shadow-[0_12px_34px_rgba(0,0,0,0.08)] p-6 mb-6">
              <PriceCard property={property} ufRate={ufRate} />
            </section>

            <section className="py-[34px] border-b border-[#e8e8e8]">
              <h2 className="m-0 mb-[18px] text-forest-dark text-[1.45rem] font-[950]">Descripción</h2>
              <p className="max-w-[780px] m-0 mb-4 text-[#444] text-base leading-relaxed">
                Propiedad ubicada en {property.neighborhood}, con excelente conectividad y una distribución pensada para vivir cómodo. Horizonte Inmobiliario acompaña la visita, revisión documental y todo el proceso de cierre.
              </p>
              <p className="max-w-[780px] m-0 mb-4 text-[#444] text-base leading-relaxed">
                El inmueble cuenta con {property.beds} dormitorios, {property.baths} baños y {property.area} m2, en un sector cercano a {property.nearby}.
              </p>
            </section>

            <section className="py-[34px] border-b border-[#e8e8e8]">
              <h2 className="m-0 mb-[18px] text-forest-dark text-[1.45rem] font-[950]">Características</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] gap-x-[52px] max-w-[760px]" aria-label="Características principales">
                {features.map(([Icon, label, value]) => (
                  <div className="grid grid-cols-[24px_auto_1fr] items-center gap-[14px] min-h-[22px] text-[#1d2636] text-[1.02rem] leading-tight" key={label}>
                    <Icon size={22} className="text-forest-dark stroke-2" aria-hidden="true" />
                    <span className="text-[#293244] font-[450] whitespace-nowrap">{label}</span>
                    <strong className="text-forest-dark font-black">{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="py-[34px] border-b border-[#e8e8e8]" id="mapa">
              <h2 className="m-0 mb-[18px] text-forest-dark text-[1.45rem] font-[950]">Ubicación aproximada</h2>
              <div className="h-[300px] w-full rounded overflow-hidden border border-[#e8e8e8]">
                <MapContainer
                  center={[property.coordinates.lat, property.coordinates.lng]}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[property.coordinates.lat, property.coordinates.lng]}>
                    <Popup>
                      {property.title}<br />
                      {property.neighborhood}, {property.location}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </section>

          </div>

          <aside className="sticky top-6 grid gap-[18px] max-xl:static max-xl:mb-6">
            <div className="max-xl:hidden border border-[#e1e1e1] bg-white shadow-[0_12px_34px_rgba(0,0,0,0.08)] p-6">
              <PriceCard property={property} ufRate={ufRate} />
            </div>

            <div className="border border-[#e1e1e1] bg-white shadow-[0_12px_34px_rgba(0,0,0,0.08)] p-[22px]">
              <h2 className="m-0 mb-[10px] text-forest-dark text-[1.18rem] font-[950]">Te ayudamos</h2>
              <p className="m-0 text-[#555] leading-relaxed">
                Agenda una visita, solicita antecedentes o recibe asesoría para financiar esta propiedad.
              </p>
            </div>
          </aside>
        </section>
      </main>
      <Footer />

      {modalIndex >= 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={close} role="dialog" aria-label="Galería de imágenes">
          <motion.button className="absolute top-5 right-5 z-10 w-11 h-11 flex items-center justify-center border-0 rounded-full bg-white/20 text-white cursor-pointer hover:bg-white/30" type="button" onClick={close} aria-label="Cerrar galería" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <X size={24} />
          </motion.button>
            <>
              <button className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center border-0 rounded-full bg-white/20 text-white cursor-pointer hover:bg-white/30" type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Anterior">
                <ChevronLeft size={28} />
              </button>
              <button className="absolute right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center border-0 rounded-full bg-white/20 text-white cursor-pointer hover:bg-white/30" type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Siguiente">
                <ChevronRight size={28} />
              </button>
            </>
          <img className="max-w-[90vw] max-h-[85vh] object-contain rounded" src={gallery[modalIndex]} alt={`${property.title} — Foto ${modalIndex + 1}`} onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-6 text-white/80 text-sm font-bold">{modalIndex + 1} / {gallery.length}</p>
        </div>
      )}
    </div>
  );
}
