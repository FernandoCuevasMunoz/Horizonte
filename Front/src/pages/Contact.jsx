import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Loader, Mail, MapPin, Phone } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { email, required, phone as phoneVal, minLength } from '../utils/validation';

const initial = { nombre: '', correo: '', telefono: '', mensaje: '' };

export default function Contact() {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  function set(name, value) {
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {
      nombre: required(data.nombre, 'Nombre'),
      correo: email(data.correo),
      telefono: phoneVal(data.telefono),
      mensaje: minLength(data.mensaje, 10, 'Mensaje'),
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
              <h2 className="text-forest-dark text-2xl font-black mb-3">Mensaje enviado</h2>
              <p className="text-moss leading-relaxed mb-6">Gracias por contactarnos. Te responderemos dentro de las próximas 24 horas.</p>
              <button className="bg-forest text-white font-black px-8 py-3 rounded-lg" onClick={() => setStatus('idle')}>Enviar otro mensaje</button>
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
        <title>Contacto — Horizonte Inmobiliario</title>
        <meta name="description" content="Contáctanos para orientación en compra, venta, arriendo o administración de propiedades." />
        <meta property="og:title" content="Contacto — Horizonte Inmobiliario" />
        <meta property="og:description" content="Hablemos de tu próximo movimiento inmobiliario." />
      </Helmet>
      <Navbar />
      <main className="w-[min(1120px,calc(100%-36px))] mx-auto">
        <section className="grid grid-cols-1 md:grid-cols-[1fr_0.86fr] gap-12 items-start pt-[52px] pb-[88px]">
          <div>
            <h1 className="mb-[18px] text-forest-dark text-[clamp(2.4rem,5vw,4.4rem)] font-[950] leading-[1.05]">Hablemos de tu proximo movimiento.</h1>
            <p className="text-moss text-[1.16rem] leading-relaxed">
              Cuéntanos que necesitas y te contactaremos para orientar compra, venta, arriendo o administracion.
            </p>
            <div className="grid gap-[14px] mt-7">
              <a className="flex items-center gap-[10px] text-[#173f36] font-[850] no-underline" href="tel:+56912345678"><Phone size={19} />+56 9 1234 5678</a>
              <a className="flex items-center gap-[10px] text-[#173f36] font-[850] no-underline" href="mailto:contacto@horizonteinmobiliario.cl"><Mail size={19} />contacto@horizonteinmobiliario.cl</a>
              <span className="flex items-center gap-[10px] text-[#173f36] font-[850]"><MapPin size={19} />Santiago, Chile</span>
            </div>
          </div>
          <form className="grid gap-[14px] p-7 border border-border rounded-lg bg-white shadow-[0_18px_44px_rgba(22,45,39,0.1)]" onSubmit={handleSubmit} noValidate>
            <div>
              <input
                className={`w-full border rounded-[7px] p-[14px] font-inherit ${errors.nombre ? 'border-red-400' : 'border-border-input'}`}
                placeholder="Nombre" name="nombre" value={data.nombre} onChange={(e) => set('nombre', e.target.value)}
              />
              {errors.nombre && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <input
                className={`w-full border rounded-[7px] p-[14px] font-inherit ${errors.correo ? 'border-red-400' : 'border-border-input'}`}
                placeholder="Correo" type="email" name="correo" value={data.correo} onChange={(e) => set('correo', e.target.value)}
              />
              {errors.correo && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.correo}</p>}
            </div>
            <div>
              <input
                className={`w-full border rounded-[7px] p-[14px] font-inherit ${errors.telefono ? 'border-red-400' : 'border-border-input'}`}
                placeholder="Teléfono" name="telefono" value={data.telefono} onChange={(e) => set('telefono', e.target.value)}
              />
              {errors.telefono && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.telefono}</p>}
            </div>
            <div>
              <textarea
                className={`w-full border rounded-[7px] p-[14px] font-inherit ${errors.mensaje ? 'border-red-400' : 'border-border-input'}`}
                placeholder="Mensaje" rows="5" name="mensaje" value={data.mensaje} onChange={(e) => set('mensaje', e.target.value)}
              />
              {errors.mensaje && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.mensaje}</p>}
            </div>
            <button className="min-h-[52px] border-0 rounded-[7px] bg-forest text-white font-black flex items-center justify-center gap-2 disabled:opacity-60" type="submit" disabled={status === 'loading'}>
              {status === 'loading' && <Loader size={18} className="animate-spin" />}
              {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
