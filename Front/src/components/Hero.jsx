import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, ChevronDown, HeartHandshake, Search, ShieldCheck } from 'lucide-react';
import { properties } from '../data/properties';

const benefits = [
  { icon: HeartHandshake, title: 'Asesoria personalizada', text: 'Te guiamos en cada paso.' },
  { icon: ShieldCheck, title: 'Propiedades verificadas', text: 'Seguridad y confianza.' },
  { icon: BadgeCheck, title: 'Gestion integral', text: 'Nos encargamos de todo.' },
];

export default function Hero() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ operacion: 'Comprar', tipo: '', comuna: '' });

  const pool = useMemo(() => properties.filter((p) => p.operation === filters.operacion), [filters.operacion]);

  const tipos = useMemo(() => [...new Set(pool.map((p) => p.type))].sort(), [pool]);

  const comunas = useMemo(() => {
    const sub = filters.tipo ? pool.filter((p) => p.type === filters.tipo) : pool;
    return [...new Set(sub.map((p) => p.location))].sort();
  }, [pool, filters.tipo]);

  function set(name, value) {
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'operacion') {
        next.tipo = '';
        next.comuna = '';
      }
      if (name === 'tipo') {
        next.comuna = '';
      }
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.tipo) params.set('tipo', filters.tipo);
    if (filters.comuna) params.set('comuna', filters.comuna);
    if (filters.operacion) params.set('operacion', filters.operacion);
    navigate(`/propiedades?${params}`);
  }

  return (
    <section
      className="relative min-h-[840px] md:min-h-[980px] lg:min-h-[840px] overflow-hidden isolate flex flex-col justify-end"
      style={{
        background: 'linear-gradient(90deg, #fbfbf8 0%, rgba(251,251,248,0.98) 32%, rgba(251,251,248,0.64) 52%, rgba(251,251,248,0) 70%), url(https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85) center right / cover no-repeat',
      }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at 44% 48%, rgba(255,255,255,0.74), rgba(255,255,255,0) 31%), linear-gradient(180deg, rgba(255,255,255,0.52), rgba(255,255,255,0.18))',
        }}
      />

      <div className="flex-1 w-full max-w-[1510px] mx-auto px-[5.5vw] pt-[170px] md:pt-[150px]">
        <div className="max-w-[620px]">
          <h1 className="m-0 text-[#0c3d34] text-[clamp(3rem,5.2vw,5.9rem)] font-black leading-[1.04] tracking-normal">
            Encuentra tu
            <span className="block">proximo hogar</span>
            <strong className="block text-[#87bd88]">con Horizonte Inmobiliario</strong>
          </h1>
          <p className="max-w-[505px] mt-7 text-[#4d5a58] text-[clamp(1rem,1.2vw,1.25rem)] font-[650] leading-relaxed">
            Te acompañamos en todo el proceso de compra, venta o arriendo de propiedades.
          </p>

          <div className="flex flex-wrap gap-6 mt-[34px]">
            <Link className="inline-flex items-center justify-center min-w-[205px] min-h-[58px] rounded-lg font-[850] no-underline bg-forest text-white shadow-[0_14px_28px_rgba(15,74,61,0.15)]" to="/propiedades">
              Ver propiedades
            </Link>
            <Link className="inline-flex items-center justify-center min-w-[205px] min-h-[58px] rounded-lg font-[850] no-underline border-2 border-[rgba(42,59,56,0.32)] bg-white/70 text-[#46534f]" to="/vender">
              Vende tu propiedad
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px] md:gap-[30px] mt-[60px] md:mt-[60px] mb-[60px] md:mb-[60px]" aria-label="Beneficios">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article className="flex items-start gap-[13px] text-[#31554e]" key={title}>
                <Icon size={34} strokeWidth={1.7} className="flex-shrink-0 mt-[2px]" aria-hidden="true" />
                <div>
                  <h2 className="m-0 text-[#3b4744] text-base font-black">{title}</h2>
                  <p className="m-0 mt-2 text-[#67716f] text-[0.92rem] font-[650]">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <form
        className="w-[min(86vw,1710px)] mx-auto mb-[42px] grid grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto] gap-4 items-end px-7 py-6 border border-[rgba(18,63,53,0.07)] rounded-[18px] bg-white/93 shadow-[0_18px_50px_rgba(30,46,42,0.14)] backdrop-blur md:w-[min(92vw,760px)] lg:w-[min(86vw,1710px)] md:grid-cols-2"
        onSubmit={handleSubmit}
        aria-label="Buscar propiedades"
      >
        <label className="grid gap-[7px] min-w-0">
          <span className="text-[#929997] text-[0.82rem] font-[850]">Operación</span>
          <div className="relative">
            <select
              className="w-full min-h-[50px] border border-border-input rounded-[7px] bg-white text-[#3c4744] px-4 font-extrabold appearance-none cursor-pointer"
              value={filters.operacion}
              onChange={(e) => set('operacion', e.target.value)}
            >
              <option value="Comprar">Comprar</option>
              <option value="Arriendo">Arriendo</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa5a1] pointer-events-none" aria-hidden="true" />
          </div>
        </label>

        <label className="grid gap-[7px] min-w-0">
          <span className="text-[#929997] text-[0.82rem] font-[850]">Tipo</span>
          <div className="relative">
            <select
              className="w-full min-h-[50px] border border-border-input rounded-[7px] bg-white text-[#3c4744] px-4 font-extrabold appearance-none cursor-pointer"
              value={filters.tipo}
              onChange={(e) => set('tipo', e.target.value)}
            >
              <option value="">Selecciona</option>
              {tipos.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa5a1] pointer-events-none" aria-hidden="true" />
          </div>
        </label>

        <label className="grid gap-[7px] min-w-0">
          <span className="text-[#929997] text-[0.82rem] font-[850]">Comuna</span>
          <div className="relative">
            <select
              className="w-full min-h-[50px] border border-border-input rounded-[7px] bg-white text-[#3c4744] px-4 font-extrabold appearance-none cursor-pointer"
              value={filters.comuna}
              onChange={(e) => set('comuna', e.target.value)}
            >
              <option value="">Selecciona</option>
              {comunas.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa5a1] pointer-events-none" aria-hidden="true" />
          </div>
        </label>

        <button type="submit" className="inline-flex items-center justify-center gap-[10px] min-w-[160px] min-h-[50px] border-0 rounded-[7px] bg-forest text-white px-5 font-extrabold shadow-[0_12px_24px_rgba(15,74,61,0.16)] md:col-span-full lg:col-auto cursor-pointer">
          <Search size={20} aria-hidden="true" />
          Buscar
        </button>
      </form>
    </section>
  );
}
