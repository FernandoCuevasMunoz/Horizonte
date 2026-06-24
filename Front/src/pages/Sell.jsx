import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Calculator, ClipboardCheck, HandCoins, Loader } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { required, phone } from '../utils/validation';

const fields = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Nombre' },
  { name: 'telefono', label: 'Teléfono', placeholder: 'Teléfono' },
  { name: 'comuna', label: 'Comuna de la propiedad', placeholder: 'Comuna de la propiedad' },
];

const tipos = ['Casa', 'Departamento', 'Oficina', 'Local comercial', 'Parcela'];

const initial = { nombre: '', telefono: '', comuna: '', tipo: '' };

export default function Sell() {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success

  function set(name, value) {
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {
      nombre: required(data.nombre, 'Nombre'),
      telefono: phone(data.telefono),
      comuna: required(data.comuna, 'Comuna'),
      tipo: required(data.tipo, 'Tipo de propiedad'),
    };
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setData(initial);
    }, 1200);
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main className="w-[min(1120px,calc(100%-36px))] mx-auto">
          <section className="grid place-items-center py-32 text-center">
            <div className="bg-white border border-border rounded-lg p-12 max-w-lg shadow-lg">
              <h2 className="text-forest-dark text-2xl font-black mb-3">Solicitud enviada</h2>
              <p className="text-moss leading-relaxed mb-6">Gracias por contactarnos. Te responderemos a la brevedad para coordinar la tasación.</p>
              <button className="bg-forest text-white font-black px-8 py-3 rounded-lg" onClick={() => setStatus('idle')}>Enviar otra solicitud</button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Helmet>
        <title>Vender — Horizonte Inmobiliario</title>
        <meta name="description" content="Vende tu propiedad con una estrategia clara. Tasación, publicación y cierre acompañado por Horizonte Inmobiliario." />
        <meta property="og:title" content="Vender — Horizonte Inmobiliario" />
        <meta property="og:description" content="Vende tu propiedad con una estrategia clara. Tasación, publicación y cierre acompañado." />
      </Helmet>
      <Navbar />
      <main className="w-[min(1120px,calc(100%-36px))] mx-auto">
        <section className="grid grid-cols-1 md:grid-cols-[1.05fr_0.75fr] gap-12 items-center pt-[52px] pb-[76px]">
          <div>
            <h1 className="mb-[18px] text-forest-dark text-[clamp(2.4rem,5vw,4.4rem)] font-[950] leading-[1.05]">Vendemos tu propiedad con una estrategia clara.</h1>
            <p className="text-moss text-[1.14rem] leading-relaxed">
               Tasación, material comercial, visitas coordinadas y negociación profesional para que tomes buenas decisiones en cada etapa.
            </p>
          </div>
          <form className="grid gap-[14px] p-7 border border-border rounded-lg bg-white shadow-[0_18px_44px_rgba(22,45,39,0.1)]" onSubmit={handleSubmit} noValidate>
            <h2 className="m-0 mb-[6px] text-forest-dark text-[1.55rem] font-black">Solicita una tasacion</h2>
            {fields.map(({ name, label, placeholder }) => (
              <div key={name}>
                <input
                  className={`w-full min-h-[50px] border rounded-[7px] px-[14px] font-inherit ${errors[name] ? 'border-red-400' : 'border-border-input'}`}
                  placeholder={placeholder}
                  name={name}
                  value={data[name]}
                  onChange={(e) => set(name, e.target.value)}
                />
                {errors[name] && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors[name]}</p>}
              </div>
            ))}
            <div>
              <select
                className={`w-full min-h-[50px] border rounded-[7px] px-[14px] font-inherit ${errors.tipo ? 'border-red-400' : 'border-border-input'}`}
                value={data.tipo}
                name="tipo"
                onChange={(e) => set('tipo', e.target.value)}
              >
                <option value="">Tipo de propiedad</option>
                {tipos.map((t) => <option key={t}>{t}</option>)}
              </select>
              {errors.tipo && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.tipo}</p>}
            </div>
            <button
              className="min-h-[52px] border-0 rounded-[7px] bg-forest text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' && <Loader size={18} className="animate-spin" />}
              {status === 'loading' ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-[22px] pb-[78px]">
          {[
            [Calculator, 'Tasación precisa', 'Analizamos mercado, ubicación y atributos reales.'],
            [ClipboardCheck, 'Publicacion completa', 'Preparamos fotos, ficha, precio y canales de venta.'],
            [HandCoins, 'Cierre acompañado', 'Negociamos ofertas y coordinamos promesa, banco y firma.'],
          ].map(([Icon, title, text]) => (
            <article className="p-6 border border-border rounded-lg bg-white" key={title}>
              <Icon size={34} className="text-forest" aria-hidden="true" />
              <h2 className="mt-4 mb-[9px] text-forest-dark text-[1.25rem] font-black">{title}</h2>
              <p className="text-moss leading-relaxed">{text}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
