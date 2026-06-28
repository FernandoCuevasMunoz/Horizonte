import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Camera, FileText, Globe, Handshake, HeartHandshake, Home, Info, Loader, MapPin, MessageCircle, Phone, TrendingUp, User, Users } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { required, phone } from '../utils/validation';
import { api } from '../utils/api';

const comunasRM = [
  'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina',
  'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central',
  'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida',
  'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea',
  'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa',
  'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén',
  'Pirque', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal',
  'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo',
  'San Miguel', 'San Pedro', 'San Ramón', 'Talagante', 'Tiltil', 'Vitacura',
];

const horas = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

const initial = {
  nombres: '',
  apellidos: '',
  telefono: '',
  email: '',
  direccion: '',
  numComplementario: '',
  comuna: '',
  tipoPropiedad: '',
  valorVenta: '',
  descripcion: '',
  horarios: [],
  comoLlegaste: '',
  publicadaTerceros: '',
};

function formatPrice(val) {
  if (!val) return '';
  const raw = val.replace(/\./g, '');
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function SectionHeader({ icon: Icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-forest-dark text-[1.1rem] font-black mb-3 mt-4 first:mt-0">
      <Icon size={20} className="text-forest shrink-0" />
      {children}
    </h3>
  );
}

function Input({ name, label, type = 'text', placeholder, required: req, value, error, onChange, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-forest-dark text-[0.92rem] font-semibold" htmlFor={name}>{label}{req && <span className="text-red-400 ml-0.5">*</span>}</label>}
      <input
        id={name}
        className={`w-full min-h-[46px] border rounded-[7px] px-[14px] font-inherit text-[0.95rem] ${error ? 'border-red-400' : 'border-border-input'}`}
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        {...rest}
      />
      {error && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{error}</p>}
    </div>
  );
}

function Select({ name, label, options, placeholder, required: req, value, error, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-forest-dark text-[0.92rem] font-semibold" htmlFor={name}>{label}{req && <span className="text-red-400 ml-0.5">*</span>}</label>}
      <select
        id={name}
        className={`w-full min-h-[46px] border rounded-[7px] px-[14px] font-inherit text-[0.95rem] ${error ? 'border-red-400' : 'border-border-input'}`}
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {error && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{error}</p>}
    </div>
  );
}

export default function Sell() {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [precioFocus, setPrecioFocus] = useState(false);
  const [apiError, setApiError] = useState('');

  function set(name, value) {
    const clean = name === 'valorVenta' && typeof value === 'string' ? value.replace(/\./g, '') : value;
    setData((prev) => ({ ...prev, [name]: clean }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function toggleHorario(h) {
    setData((prev) => {
      const horarios = prev.horarios.includes(h)
        ? prev.horarios.filter((x) => x !== h)
        : [...prev.horarios, h];
      return { ...prev, horarios };
    });
    if (errors.horarios) setErrors((prev) => ({ ...prev, horarios: '' }));
  }

  function validate() {
    const errs = {
      nombres: required(data.nombres, 'Nombres'),
      apellidos: required(data.apellidos, 'Apellidos'),
      telefono: phone(data.telefono),
      email: (() => {
        if (!data.email || !data.email.trim()) return 'Email es obligatorio';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? '' : 'Correo inválido';
      })(),
      direccion: required(data.direccion, 'Dirección'),
      comuna: required(data.comuna, 'Comuna'),
      tipoPropiedad: required(data.tipoPropiedad, 'Tipo de propiedad'),
      horarios: data.horarios.length === 0 ? 'Selecciona al menos un horario' : '',
    };
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    setApiError('');
    const horarios = data.horarios.map((h) => `${h}:00`).join(', ');
    const msg = [
      `Tipo: ${data.tipoPropiedad}`,
      `Comuna: ${data.comuna}`,
      `Dirección: ${data.direccion}${data.numComplementario ? ', ' + data.numComplementario : ''}`,
      `Valor esperado: $${formatPrice(data.valorVenta)}`,
      `Descripción: ${data.descripcion}`,
      `Horarios de contacto: ${horarios || 'No especificado'}`,
      `¿Cómo llegó?: ${data.comoLlegaste || 'No especificado'}`,
      `Publicada por terceros: ${data.publicadaTerceros || 'No especificado'}`,
    ].join('\n');
    api.contact({ name: `${data.nombres} ${data.apellidos}`, email: data.email, phone: data.telefono, message: msg, type: 'venta' })
      .then(() => { setStatus('success'); setData(initial); })
      .catch(() => { setStatus('idle'); setApiError('Error al enviar. Intenta de nuevo.'); });
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main className="w-[min(1120px,calc(100%-36px))] mx-auto">
          <section className="grid place-items-center py-32 text-center">
            <div className="bg-white border border-border rounded-lg p-12 max-w-lg shadow-lg">
              <h2 className="text-forest-dark text-2xl font-black mb-3">Solicitud enviada</h2>
              <p className="text-moss leading-relaxed mb-6">Gracias por contactarnos. Te responderemos a la brevedad para agendar la tasación de tu propiedad.</p>
              <motion.button className="bg-forest text-white font-black px-8 py-3 rounded-lg cursor-pointer" onClick={() => setStatus('idle')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>Enviar otra solicitud</motion.button>
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
      <main className="w-[min(1280px,calc(100%-36px))] mx-auto">
        <section className="text-center pt-[52px] pb-10">
          <h1 className="mb-[18px] text-forest-dark text-[clamp(2.4rem,5vw,4.4rem)] font-[950] leading-[1.05]">Vendemos tu propiedad con una estrategia clara.</h1>
          <p className="text-moss text-[1.14rem] leading-relaxed max-w-[650px] mx-auto">
            Atención cercana, comunicación permanente y una gestión profesional para ayudarte a vender tu propiedad de forma segura y eficiente.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-[22px] pb-[50px]">
          {[
            [MessageCircle, 'Comunicación permanente', 'Mantendremos contacto directo contigo durante todo el proceso. Te informaremos sobre consultas, visitas, comentarios de potenciales compradores y avances de la gestión para que siempre sepas qué está ocurriendo con tu propiedad.'],
            [TrendingUp, 'Evaluación de mercado', 'Analizamos propiedades similares, valores de cierre recientes y la realidad del mercado local para determinar un precio competitivo que aumente las posibilidades de venta sin sacrificar valor.'],
            [Camera, 'Marketing profesional', 'Creamos una presentación atractiva de tu propiedad mediante fotografías de calidad, descripciones optimizadas y material visual pensado para captar el interés de potenciales compradores.'],
            [Globe, 'Difusión en portales inmobiliarios', 'Publicamos tu propiedad en los principales portales y canales digitales para maximizar su visibilidad y llegar a más personas interesadas en comprar.'],
            [Users, 'Gestión de interesados y visitas', 'Atendemos consultas, coordinamos visitas y filtramos prospectos para optimizar tu tiempo y enfocarnos en compradores realmente interesados.'],
            [Handshake, 'Negociación y acompañamiento', 'Te representamos durante las negociaciones, buscando las mejores condiciones para la venta y acompañándote en cada etapa hasta concretar la operación.'],
            [FileText, 'Gestión documental', 'Gestionamos la recopilación de todos los documentos necesarios para la venta, incluyendo antecedentes, certificados y la documentación requerida para el proceso.'],
            [HeartHandshake, 'Asesoría durante todo el proceso', 'Desde la primera reunión hasta la firma final, contarás con el apoyo directo de nuestro equipo. Trabajarás siempre con las mismas personas, recibiendo una atención cercana, transparente y personalizada.'],
          ].map(([Icon, title, text]) => (
            <article className="p-6 border border-border rounded-lg bg-white" key={title}>
              <Icon size={34} className="text-forest" aria-hidden="true" />
              <h2 className="mt-4 mb-[9px] text-forest-dark text-[1.25rem] font-black">{title}</h2>
              <p className="text-moss leading-relaxed">{text}</p>
            </article>
          ))}
        </section>

        <form className="max-w-[800px] mx-auto p-6 sm:p-8 border border-border rounded-lg bg-white shadow-[0_18px_44px_rgba(22,45,39,0.1)] grid gap-5 mb-[76px]" onSubmit={handleSubmit} noValidate>
          <h2 className="text-forest-dark text-[1.55rem] font-black">Vende con nosotros</h2>

          {/* DATOS PERSONALES */}
          <SectionHeader icon={User}>Datos personales</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="nombres" label="Nombres" placeholder="Tus nombres" required value={data.nombres} error={errors.nombres} onChange={(e) => set('nombres', e.target.value)} />
            <Input name="apellidos" label="Apellidos" placeholder="Tus apellidos" required value={data.apellidos} error={errors.apellidos} onChange={(e) => set('apellidos', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="telefono" type="tel" label="Teléfono" placeholder="+56 9 9300 1522" required value={data.telefono} error={errors.telefono} onChange={(e) => set('telefono', e.target.value)} />
            <Input name="email" type="email" label="Email" placeholder="correo@ejemplo.cl" required value={data.email} error={errors.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          {/* UBICACIÓN */}
          <SectionHeader icon={MapPin}>Ubicación</SectionHeader>
          <Input name="direccion" label="Dirección" placeholder="Nombre y número de la calle" required value={data.direccion} error={errors.direccion} onChange={(e) => set('direccion', e.target.value)} />
          <Input name="numComplementario" label="Número de casa / departamento" placeholder="Ej: Dpto 603, Oficina 201, etc." value={data.numComplementario} error={errors.numComplementario} onChange={(e) => set('numComplementario', e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <SectionHeader icon={Building2}>Comuna</SectionHeader>
              <Select name="comuna" label="Comuna de la propiedad" options={comunasRM} placeholder="Selecciona una comuna" required value={data.comuna} error={errors.comuna} onChange={(e) => set('comuna', e.target.value)} />
            </div>
            <div>
              <SectionHeader icon={Home}>Propiedad</SectionHeader>
              <Select name="tipoPropiedad" label="Tipo de propiedad" options={['Casa', 'Departamento', 'Local Comercial', 'Oficina', 'Otro']} placeholder="Selecciona un tipo" required value={data.tipoPropiedad} error={errors.tipoPropiedad} onChange={(e) => set('tipoPropiedad', e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-forest-dark text-[0.92rem] font-semibold" htmlFor="valorVenta">CLP Valor esperado de venta</label>
            <input
              id="valorVenta"
              className={`w-full min-h-[46px] border rounded-[7px] px-[14px] font-inherit text-[0.95rem] ${errors.valorVenta ? 'border-red-400' : 'border-border-input'}`}
              type="text"
              inputMode="numeric"
              placeholder="Ej: 150.000.000"
              name="valorVenta"
              value={precioFocus ? data.valorVenta.replace(/\./g, '') : formatPrice(data.valorVenta)}
              onFocus={() => setPrecioFocus(true)}
              onBlur={() => setPrecioFocus(false)}
              onChange={(e) => set('valorVenta', e.target.value.replace(/[^\d]/g, ''))}
            />
            {errors.valorVenta && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.valorVenta}</p>}
          </div>

          {/* DESCRIPCIÓN */}
          <SectionHeader icon={FileText}>Descripción</SectionHeader>
          <div className="flex flex-col gap-1">
            <label className="text-forest-dark text-[0.92rem] font-semibold" htmlFor="descripcion">Cuéntanos más</label>
            <textarea
              id="descripcion"
              className={`w-full min-h-[110px] border rounded-[7px] px-[14px] py-3 font-inherit text-[0.95rem] resize-y ${errors.descripcion ? 'border-red-400' : 'border-border-input'}`}
              placeholder="Metraje aprox. (interior/exterior), n° de dormitorios y baños, orientación, etc."
              name="descripcion"
              value={data.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
            />
          </div>

          {/* PREFERENCIAS DE CONTACTO */}
          <SectionHeader icon={Phone}>Preferencias de contacto</SectionHeader>
          <div className="flex flex-col gap-1">
            <p className="text-forest-dark text-[0.92rem] font-semibold">¿A qué hora te acomoda que te contactemos?</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {horas.map((h) => {
                const selected = data.horarios.includes(h);
                return (
                  <motion.button
                    key={h}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg border text-[0.88rem] font-semibold transition cursor-pointer ${selected ? 'bg-forest text-white border-forest' : 'bg-white text-forest-dark border-border-input hover:border-forest'}`}
                    onClick={() => toggleHorario(h)}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    {h}:00
                  </motion.button>
                );
              })}
            </div>
            {errors.horarios && <p className="text-red-500 text-[0.82rem] font-bold mt-1">{errors.horarios}</p>}
          </div>

          {/* INFORMACIÓN ADICIONAL */}
          <SectionHeader icon={Info}>Información adicional</SectionHeader>
          <Select name="comoLlegaste" label="¿Cómo llegaste a nosotros?" options={['Google', 'Facebook', 'Instagram', 'Recomendación', 'Portal inmobiliario', 'Otro']} placeholder="Selecciona una opción" value={data.comoLlegaste} error={errors.comoLlegaste} onChange={(e) => set('comoLlegaste', e.target.value)} />
          <div className="flex flex-col gap-1">
            <p className="text-forest-dark text-[0.92rem] font-semibold">¿Tu propiedad está publicada por terceros?</p>
            <div className="flex gap-6 mt-1">
              {['Sí', 'No'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-[0.95rem] text-forest-dark cursor-pointer">
                  <input
                    type="radio"
                    name="publicadaTerceros"
                    value={opt}
                    checked={data.publicadaTerceros === opt}
                    onChange={(e) => set('publicadaTerceros', e.target.value)}
                    className="accent-forest w-4 h-4"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* BOTÓN */}
          {apiError && <p className="text-red-500 text-[0.82rem] font-bold text-center">{apiError}</p>}
          <motion.button
            className="min-h-[52px] border-0 rounded-[7px] bg-forest text-white font-black flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
            type="submit"
            disabled={status === 'loading'}
            whileHover={status !== 'loading' ? { scale: 1.03 } : undefined}
            whileTap={status !== 'loading' ? { scale: 0.97 } : undefined}
          >
            {status === 'loading' && <Loader size={18} className="animate-spin" />}
            {status === 'loading' ? 'Enviando...' : 'Enviar Solicitud'}
          </motion.button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
