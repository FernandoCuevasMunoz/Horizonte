import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { isAuthenticated, setToken, api } from '../utils/api';
import { LayoutDashboard, Home, Building2, MessageSquare, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/admin/login'); return; }
    let mounted = true;
    api.verify().then(() => mounted && setVerified(true)).catch(() => { if (mounted) { setToken(null); navigate('/admin/login'); } });
    return () => { mounted = false; };
  }, []);

  if (!verified) return null;

  function logout() { setToken(null); navigate('/admin/login'); }

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/propiedades', icon: Building2, label: 'Propiedades' },
    { to: '/admin/mensajes', icon: MessageSquare, label: 'Mensajes' },
    { to: '/', icon: Home, label: 'Ver sitio' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-forest-dark text-white transform transition-transform lg:translate-x-0 lg:static lg:inset-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 bg-white border-b border-gray-200">
          <img src="/logo.png" alt="Horizonte" className="h-10 mx-auto" />
        </div>
        <nav className="p-2 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/admin'} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <l.icon size={18} /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition w-full">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-gray-100">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <img src="/logo.png" alt="Horizonte" className="h-8" />
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
