import { Mail, Phone } from 'lucide-react';

const socials = [
  {
    name: 'Instagram',
    href: '#',
    path: 'M7.8 2h8.4C19 2 22 5 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C5 22 2 19 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  },
  {
    name: 'YouTube',
    href: '#',
    path: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8M9.5 15.5v-7l6.3 3.5z',
  },
  {
    name: 'TikTok',
    href: '#',
    path: 'M16.6 5.8A4.5 4.5 0 0 1 19 3.5V2a6 6 0 0 0-5.3 5.9v8.3a3 3 0 1 1-2.5-3V8.2a7 7 0 0 0-.5 0A7.5 7.5 0 0 0 7 18.5a7.4 7.4 0 0 0 12.6 4.8 7.4 7.4 0 0 0 2.4-5.5v-5a10 10 0 0 0 4 2.4v-3.5a6.5 6.5 0 0 1-5.4-5.9',
  },
];

export default function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="flex flex-col items-center gap-6 px-[5.5vw] py-10 text-center">
        <img src="/logo-verde2.png" alt="Horizonte Inmobiliario" className="h-[112px] w-auto" />

        <p className="max-w-md text-white/70 text-sm leading-relaxed">
          Corredora de propiedades enfocada en compra, venta y arriendo con gestión integral.
        </p>

        <div className="flex items-center gap-4">
          {socials.map(({ name, href, path }) => (
            <a
              key={name}
              href={href}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
              aria-label={name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d={path} />
              </svg>
            </a>
          ))}
        </div>

        <address className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 not-italic text-white/70 text-sm">
          <a className="inline-flex items-center gap-2 text-white/70 hover:text-white no-underline" href="mailto:contacto@horizonteinmobiliario.cl">
            <Mail size={16} />contacto@horizonteinmobiliario.cl
          </a>
          <a className="inline-flex items-center gap-2 text-white/70 hover:text-white no-underline" href="tel:+56912345678">
            <Phone size={16} />+56 9 1234 5678
          </a>
        </address>
      </div>
    </footer>
  );
}
