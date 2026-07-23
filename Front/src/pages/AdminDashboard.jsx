import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Building2, MessageSquare, TrendingUp, Home } from 'lucide-react';

export default function AdminDashboard() {
  const [props, setProps] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAdminProperties().then(setProps).catch(() => setError('Error al cargar datos'));
    api.getMessages().then(setMsgs).catch(() => setError('Error al cargar datos'));
  }, []);

  const cards = [
    { icon: Building2, label: 'Propiedades', value: props.length, color: 'bg-blue-500' },
    { icon: MessageSquare, label: 'Mensajes', value: msgs.length, color: 'bg-green-500' },
    { icon: Home, label: 'Destacadas', value: props.filter(p => p.featured).length, color: 'bg-amber-500' },
    { icon: TrendingUp, label: 'En venta', value: props.filter(p => p.operation === 'Comprar').length, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-forest-dark mb-6">Dashboard</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border">
            <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center mb-3`}>
              <c.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-black text-forest-dark">{c.value}</p>
            <p className="text-sm text-moss">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-bold text-forest-dark mb-4">Últimos mensajes</h2>
          {msgs.length === 0 ? <p className="text-moss text-sm">Sin mensajes aún</p> : (
            <div className="space-y-3">
              {msgs.slice(-5).reverse().map(m => (
                <div key={m.id} className="text-sm border-b pb-2 last:border-0">
                  <p className="font-semibold text-forest-dark">{m.name}</p>
                  <p className="text-moss">{m.email} — {m.type}</p>
                  <p className="text-gray-500 truncate">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-bold text-forest-dark mb-4">Últimas propiedades</h2>
          {props.length === 0 ? <p className="text-moss text-sm">Sin propiedades aún</p> : (
            <div className="space-y-3">
              {props.slice(-5).reverse().map(p => (
                <div key={p.id} className="text-sm border-b pb-2 last:border-0">
                  <p className="font-semibold text-forest-dark">{p.title}</p>
                  <p className="text-moss">{p.price} — {p.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
