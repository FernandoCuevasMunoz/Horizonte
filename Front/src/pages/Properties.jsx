import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import { properties } from '../data/properties';

export default function Properties({ mode = 'all' }) {
  const pageTitle = mode === 'rent' ? 'Arriendos' : 'Propiedades';
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('tipo') || 'Todos';
  const commune = searchParams.get('comuna') || 'Todas';
  const operation = searchParams.get('operacion') || '';

  const basePool = useMemo(() => {
    return mode === 'rent'
      ? properties.filter((p) => p.operation === 'Arriendo')
      : operation
        ? properties.filter((p) => p.operation === operation)
        : properties;
  }, [mode, operation]);

  const availableTypes = useMemo(() => {
    return [...new Set(basePool.map((p) => p.type))].sort();
  }, [basePool]);

  const availableCommunes = useMemo(() => {
    const sub = type === 'Todos' ? basePool : basePool.filter((p) => p.type === type);
    return [...new Set(sub.map((p) => p.location))].sort();
  }, [basePool, type]);

  const visibleProperties = useMemo(() => {
    const typeMatch = type === 'Todos' ? (c) => true : (p) => p.type === type;
    const communeMatch = commune === 'Todas' ? (c) => true : (p) => p.location === commune;
    return basePool.filter((p) => typeMatch(p) && communeMatch(p));
  }, [basePool, type, commune]);

  function setFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'Todos' && value !== 'Todas') {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    if (name === 'tipo') {
      next.delete('comuna');
    }
    setSearchParams(next, { replace: true });
  }

  const title = mode === 'rent' ? 'Arriendos disponibles' : 'Propiedades disponibles';
  const intro = mode === 'rent'
    ? 'Encuentra espacios listos para habitar o trabajar con contratos claros y acompañamiento completo.'
    : 'Explora casas, departamentos, oficinas, locales comerciales y parcelas verificadas por Horizonte Inmobiliario.';

  return (
    <div className="min-h-screen bg-cream">
      <Helmet>
        <title>{pageTitle} — Horizonte Inmobiliario</title>
        <meta name="description" content={intro} />
        <meta property="og:title" content={`${pageTitle} — Horizonte Inmobiliario`} />
        <meta property="og:description" content={intro} />
      </Helmet>
      <Navbar />
      <main className="w-[min(1120px,calc(100%-36px))] mx-auto">
        <section className="pt-[52px] pb-8">
          <h1 className="mb-[14px] text-forest-dark text-[clamp(2.45rem,5vw,4.6rem)] font-[950]">{title}</h1>
          <p className="max-w-[690px] text-moss text-[1.15rem] leading-relaxed">{intro}</p>
        </section>

        <section className="flex flex-wrap items-end gap-[18px] mb-7 p-[18px] border border-border rounded-lg bg-white max-sm:grid" aria-label="Filtros">
          <label className="grid gap-[7px] text-[#68736f] text-[0.86rem] font-[850]">
            Tipo
            <select className="min-w-[220px] min-h-[46px] border border-border-input rounded-[7px] bg-white text-[#273c37] px-3 font-inherit max-sm:w-full max-sm:min-w-0" value={type} onChange={(e) => setFilter('tipo', e.target.value)}>
              <option value="Todos">Todos</option>
              {availableTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="grid gap-[7px] text-[#68736f] text-[0.86rem] font-[850]">
            Comuna
            <select className="min-w-[220px] min-h-[46px] border border-border-input rounded-[7px] bg-white text-[#273c37] px-3 font-inherit max-sm:w-full max-sm:min-w-0" value={commune} onChange={(e) => setFilter('comuna', e.target.value)}>
              <option value="Todas">Todas</option>
              {availableCommunes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <strong className="ml-auto text-[#0f4a3d] max-sm:ml-0">{visibleProperties.length} resultado{visibleProperties.length !== 1 ? 's' : ''}</strong>
        </section>

        {visibleProperties.length === 0 ? (
          <section className="flex flex-col items-center justify-center py-24 text-center">
            <SearchX size={64} className="text-moss mb-6" strokeWidth={1.5} />
            <h2 className="text-forest-dark text-2xl font-black mb-2">Sin resultados</h2>
            <p className="text-moss text-lg max-w-md leading-relaxed">
              No hay propiedades que coincidan con los filtros seleccionados. Intenta con otra combinación.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 max-sm:grid-cols-1 max-[920px]:grid-cols-2 grid-cols-3 gap-6 pb-[78px]" aria-label={title}>
            {visibleProperties.map((property) => (
              <PropertyCard property={property} key={property.id} />
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
