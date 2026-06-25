import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { email, required, phone } from '../utils/validation';

const initial = { nombre: '', telefono: '', correo: '', operacion: '', tipo: '', comuna: '', precio: '', descripcion: '' };

const fieldConfig = [
  { name: 'nombre', label: 'Nombre del propietario', placeholder: 'Nombre del propietario' },
  { name: 'telefono', label: 'Teléfono', placeholder: 'Teléfono' },
  { name: 'correo', label: 'Correo', placeholder: 'Correo', type: 'email', optional: true },
  { name: 'comuna', label: 'Comuna', placeholder: 'Comuna' },
  { name: 'precio', label: 'Precio esperado', placeholder: 'Precio esperado' },
];

export default function Publish() {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  function set(name, value) {
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {
      nombre: required(data.nombre, 'Nombre del propietario'),
      telefono: phone(data.telefono),
      correo: data.correo ? email(data.correo) : '',
      operacion: required(data.operacion, 'Operación'),
      tipo: required(data.tipo, 'Tipo de propiedad'),
      comuna: required(data.comuna, 'Comuna'),
      precio: required(data.precio, 'Precio esperado'),
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
        <main className="w-[min(980px,calc(100%-36px))] mx-auto">
          <section className="grid place-items-center py-32 text-center">
            <div className="bg-white border border-border rounded-lg p-12 max-w-lg shadow-lg">
              <h2 className="text-forest-dark text-2xl font-black mb-3">Propiedad recibida</h2>
              <p className="text-moss leading-relaxed mb-6">Gracias por confiar en nosotros. Te contactaremos para coordinar la visita y definir la mejor estrategia.</p>
              <motion.button className="bg-forest text-white font-black px-8 py-3 rounded-lg" onClick={() => setStatus('idle')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>Publicar otra propiedad</motion.button>
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
        <title>Publicar Propiedad — Horizonte Inmobiliario</title>
        <meta name="description" content="Publica tu propiedad con Horizonte Inmobiliario. Comparte los datos y te acompañamos en todo el proceso comercial." />
        <meta property="og:title" content="Publicar Propiedad — Horizonte Inmobiliario" />
        <meta property="og:description" content="Publica tu propiedad y recibe asesoría comercial completa." />
      </Helmet>
      <Navbar />
      <main className="w-[min(980px,calc(100%-36px))] mx-auto pt-[52px] pb-[88px]">
        <section className="max-w-[780px] mb-7">
          <h1 className="mb-[18px] text-forest-dark text-[clamp(2.35rem,5vw,4.2rem)] font-[950] leading-[1.05]">Comparte los datos principales y nosotros seguimos contigo.</h1>
          <p className="text-moss text-[1.14rem] leading-relaxed">
            Este formulario nos ayuda a preparar una primera evaluación y definir la mejor estrategia comercial para tu propiedad.
          </p>
        </section>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-[14px] p-7 border border-border rounded-lg bg-white shadow-[0_18px_44px_rgba(22,45,39,0.1)]" onSubmit={handleSubmit} noValidate>
          {fieldConfig.map(({ name, label, placeholder, type, optional }) => (
            <div key={name}>
              <input
                className={`w-full min-h-[50px] border rounded-[7px] px-[14px] font-inherit ${errors[name] ? 'border-red-400' : 'border-border-input'}`}
                placeholder={placeholder} name={name} type={type || 'text'} value={data[name]} onChange={(e) => set(name, e.target.value)}
              />
              {errors[name] && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors[name]}</p>}
            </div>
          ))}
          <div>
            <select
              className={`w-full min-h-[50px] border rounded-[7px] px-[14px] font-inherit ${errors.operacion ? 'border-red-400' : 'border-border-input'}`}
              value={data.operacion} name="operacion" onChange={(e) => set('operacion', e.target.value)}
            >
              <option value="">Operación</option>
              <option>Vender</option>
              <option>Arrendar</option>
            </select>
            {errors.operacion && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.operacion}</p>}
          </div>
          <div>
            <select
              className={`w-full min-h-[50px] border rounded-[7px] px-[14px] font-inherit ${errors.tipo ? 'border-red-400' : 'border-border-input'}`}
              value={data.tipo} name="tipo" onChange={(e) => set('tipo', e.target.value)}
            >
              <option value="">Tipo de propiedad</option>
              <option>Casa</option>
              <option>Departamento</option>
              <option>Oficina</option>
              <option>Local comercial</option>
              <option>Parcela</option>
            </select>
            {errors.tipo && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.tipo}</p>}
          </div>
          <div className="col-span-full">
            <textarea
              className={`w-full border rounded-[7px] p-[14px] font-inherit ${errors.descripcion ? 'border-red-400' : 'border-border-input'}`}
              placeholder="Descripción breve" rows="5" name="descripcion" value={data.descripcion} onChange={(e) => set('descripcion', e.target.value)}
            />
          </div>
          <motion.button
            className="col-span-full min-h-[52px] border-0 rounded-[7px] bg-forest text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
            type="submit" disabled={status === 'loading'}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            {status === 'loading' && <Loader size={18} className="animate-spin" />}
            {status === 'loading' ? 'Enviando...' : 'Enviar propiedad'}
          </motion.button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
