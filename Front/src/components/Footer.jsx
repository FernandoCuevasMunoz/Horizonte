import { motion } from 'motion/react';
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
    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
  {
    name: 'LinkedIn',
    href: '#',
    path: 'M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2M8 19H5v-9h3zM6.5 8.3A1.7 1.7 0 0 1 4.8 6.5a1.7 1.7 0 0 1 1.7-1.7 1.7 1.7 0 0 1 1.7 1.7 1.7 1.7 0 0 1-1.7 1.8M19 19h-3v-4.7c0-1.1-.4-1.9-1.5-1.9a1.6 1.6 0 0 0-1.5 1.1c-.1.2-.1.5-.1.7V19h-3v-9h3v1.2a3.3 3.3 0 0 1 3-1.7c2.1 0 3.6 1.4 3.6 4.3z',
  },
  {
    name: 'Facebook',
    href: '#',
    path: 'M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07',
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
            <motion.a
              key={name}
              href={href}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
              aria-label={name}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d={path} />
              </svg>
            </motion.a>
          ))}
        </div>

        <address className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 not-italic text-white/70 text-sm">
          <a className="inline-flex items-center gap-2 text-white/70 hover:text-white no-underline" href="mailto:contacto@horizonteinmobiliario.cl">
            <Mail size={16} />contacto@horizonteinmobiliario.cl
          </a>
          <a className="inline-flex items-center gap-2 text-white/70 hover:text-white no-underline" href="tel:+56993001522">
            <Phone size={16} />+56 9 9300 1522
          </a>
        </address>
      </div>
    </footer>
  );
}
