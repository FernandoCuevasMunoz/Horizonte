import { NavLink, useLocation } from 'react-router-dom';
import { Menu, Phone } from 'lucide-react';
import { useState } from 'react';

const links = [
  ['Inicio', '/'],
  ['Propiedades', '/propiedades'],
  ['Arriendos', '/arriendos'],
  ['Vender', '/vender'],
  ['Nosotros', '/nosotros'],
  ['Contacto', '/contacto'],
];

export default function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isDetail = pathname.startsWith('/propiedades/');
  const [open, setOpen] = useState(false);

  return (
    <header className={`${isHome ? 'absolute top-0 left-0' : 'relative bg-white shadow-[0_1px_0_#ededed]'} z-20 w-full flex items-center justify-between gap-7 px-[5.5vw] pt-7 pb-[18px] ${isDetail ? 'text-[#111]' : 'text-forest-dark'}`}>
      <NavLink className="inline-flex items-center text-inherit no-underline flex-shrink-0" to="/" aria-label="Horizonte Inmobiliario inicio">
        <img src="/logo.png" alt="Horizonte Inmobiliario" className="h-[86px] w-auto" />
      </NavLink>

      <nav className="hidden lg:flex items-center justify-center gap-[clamp(18px,2.2vw,34px)] flex-1" aria-label="Navegación principal">
        {links.map(([label, path]) => (
          <NavLink to={path} key={path} className={({ isActive }) =>
            `${isDetail ? 'hover:text-[#333]' : 'hover:text-[#0d4a3d]'} text-[#31423f] text-[1.1rem] font-bold no-underline transition-colors duration-[160ms] ${isActive ? (isDetail ? '!text-[#111]' : '!text-forest') : ''}`
          }>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-[18px] min-w-max">
        <a className={`hidden lg:inline-flex items-center gap-[7px] font-bold whitespace-nowrap text-[1.1rem] ${isDetail ? 'text-[#111]' : 'text-[#183b34]'}`} href="tel:+56912345678">
          <Phone size={18} aria-hidden="true" />
          +56 9 1234 5678
        </a>
        <NavLink className="hidden lg:inline-flex items-center min-h-[58px] px-[30px] rounded-lg bg-forest text-white text-[1.1rem] font-bold shadow-[0_12px_24px_#0f4a3d2e]" to="/publicar">
          Publica tu propiedad
        </NavLink>
        <button
          className="lg:hidden inline-flex items-center justify-center w-11 h-11 border border-[rgba(18,63,53,0.18)] rounded-lg bg-white/76 text-forest-dark"
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen(!open)}
        >
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <nav className="absolute top-full left-0 w-full bg-white border-t border-border shadow-lg flex flex-col p-4 gap-3 lg:hidden z-30" aria-label="Navegación móvil">
          {links.map(([label, path]) => (
            <NavLink to={path} key={path} className="text-forest-dark text-[1.1rem] font-bold no-underline py-2 px-3 rounded hover:bg-cream" onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
          <hr className="border-border my-1" />
          <a className="text-forest-dark text-[1.1rem] font-bold py-2 px-3" href="tel:+56912345678">
            <Phone size={20} className="inline mr-2" aria-hidden="true" />
            +56 9 1234 5678
          </a>
          <NavLink to="/publicar" className="bg-forest text-white text-[1.1rem] font-bold text-center py-3 px-4 rounded-lg mt-1" onClick={() => setOpen(false)}>
            Publica tu propiedad
          </NavLink>
        </nav>
      )}
    </header>
  );
}
