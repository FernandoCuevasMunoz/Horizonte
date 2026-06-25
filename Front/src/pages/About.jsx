import { Helmet } from 'react-helmet-async';
import { Award, KeyRound, Users } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen bg-cream">
      <Helmet>
        <title>Nosotros — Horizonte Inmobiliario</title>
        <meta name="description" content="Corretaje cercano, ordenado y transparente. Más de 180 operaciones acompañadas con un 96% de clientes satisfechos." />
        <meta property="og:title" content="Nosotros — Horizonte Inmobiliario" />
        <meta property="og:description" content="Corretaje cercano, ordenado y transparente. Conoce más sobre Horizonte Inmobiliario." />
      </Helmet>
      <Navbar />
      <main className="w-[min(1120px,calc(100%-36px))] mx-auto">
        <section className="max-w-[780px] pt-[52px] pb-[34px]">
          <h1 className="mb-[18px] text-forest-dark text-[clamp(2.4rem,5vw,4.4rem)] font-[950] leading-[1.05]">Corretaje cercano, ordenado y transparente.</h1>
          <p className="text-moss text-[1.16rem] leading-relaxed">
            Horizonte Inmobiliario nace para acompañar decisiones inmobiliarias importantes con información clara, propiedades verificadas y una gestión humana.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
          <article className="grid gap-[7px] p-7 border border-border rounded-lg bg-white">
            <strong className="text-forest text-[2.7rem] leading-none">+180</strong>
            <span className="text-moss font-extrabold">operaciones acompañadas</span>
          </article>
          <article className="grid gap-[7px] p-7 border border-border rounded-lg bg-white">
            <strong className="text-forest text-[2.7rem] leading-none">96%</strong>
            <span className="text-moss font-extrabold">clientes satisfechos</span>
          </article>
          <article className="grid gap-[7px] p-7 border border-border rounded-lg bg-white">
            <strong className="text-forest text-[2.7rem] leading-none">12</strong>
            <span className="text-moss font-extrabold">comunas activas</span>
          </article>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-[22px] py-6 pb-[78px]">
          {[
            [Users, 'Acompañamiento real', 'Te explicamos cada paso sin letra chica.'],
            [Award, 'Criterio profesional', 'Valoramos precio, mercado y oportunidad.'],
            [KeyRound, 'Gestión completa', 'Coordinamos visitas, documentos y cierre.'],
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
