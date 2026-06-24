import { Helmet } from 'react-helmet-async';
import Featured from '../components/Featured';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <Helmet>
        <title>Horizonte Inmobiliario — Corredora de Propiedades</title>
        <meta name="description" content="Corredora de propiedades enfocada en compra, venta y arriendo con gestión integral. Encuentra tu próximo hogar con Horizonte Inmobiliario." />
        <meta property="og:title" content="Horizonte Inmobiliario — Corredora de Propiedades" />
        <meta property="og:description" content="Corredora de propiedades enfocada en compra, venta y arriendo con gestión integral." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://horizonteinmobiliario.cl/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      <Hero />
      <Featured />
      <Footer />
    </div>
  );
}
