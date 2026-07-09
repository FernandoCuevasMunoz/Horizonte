import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCLP } from '../utils/format';
import { Plus, Pencil, Trash2, Star, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminProperties() {
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mlStatuses, setMlStatuses] = useState({});

  function load() {
    setLoading(true);
    api.getProperties().then(data => {
      setProps(data);
      data.forEach(p => {
        api.getMercadoLibrePropertyStatus(p.id).then(status => {
          setMlStatuses(prev => ({ ...prev, [p.id]: status }));
        }).catch(() => {});
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    try {
      await api.deleteProperty(id);
      setProps(props.filter(p => p.id !== id));
    } catch (e) { alert('Error al eliminar'); }
  }

  async function toggleStatus(p) {
    const isRent = p.operation === 'Arriendo' || p.operation === 'Arrendar';
    if (isRent) {
      const next = p.status === 'Arrendado' ? null : 'Arrendado';
      try {
        await api.toggleStatus(p.id, next || '');
        setProps(props.map(prop => prop.id === p.id ? { ...prop, status: next } : prop));
      } catch (e) { alert('Error al cambiar estado'); }
    } else {
      const next = p.status === 'Vendido' ? null : 'Vendido';
      try {
        await api.toggleStatus(p.id, next || '');
        setProps(props.map(prop => prop.id === p.id ? { ...prop, status: next } : prop));
      } catch (e) { alert('Error al cambiar estado'); }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-forest-dark">Propiedades</h1>
        <Link to="/admin/propiedades/nueva"
          className="flex items-center gap-2 bg-forest text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-forest-dark transition">
          <Plus size={18} /> Nueva propiedad
        </Link>
      </div>

      {loading ? <p className="text-moss">Cargando...</p> : props.length === 0 ? (
        <p className="text-moss">No hay propiedades. ¡Crea la primera!</p>
      ) : (
        <div className="grid gap-4">
          {props.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4">
              <img src={p.image} alt={p.title} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-moss uppercase">{p.code}</span>
                  <p className="font-semibold text-forest-dark truncate">{p.title}</p>
                  {p.featured && <Star size={14} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                  {mlStatuses[p.id]?.published && (
                    <a href={mlStatuses[p.id].permalink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 transition" title="Publicado en MercadoLibre">
                      <ExternalLink size={12} /> ML
                    </a>
                  )}
                  {p.status && (
                    <span className={`text-[0.65rem] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === 'Vendido' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{p.status}</span>
                  )}
                </div>
                <p className="text-sm text-moss">{formatCLP(p.numericPrice)} — {p.location}</p>
                <p className="text-xs text-gray-400">{p.type} · {p.operation} · {p.beds}D {p.baths}B · {p.area}m²</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleStatus(p)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-moss hover:text-forest-dark transition group relative"
                  title={`Estado: ${p.status || 'Disponible'} — click para cambiar`}>
                  <ToggleRight size={26} className={p.status ? 'text-amber-600' : 'text-green-600'} />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition">{p.status || 'Disponible'}</span>
                </button>
                {mlStatuses[p.id]?.published && (
                  <a href={mlStatuses[p.id].permalink} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-yellow-50 text-moss hover:text-yellow-600 transition"
                    title="Ver en MercadoLibre">
                    <ExternalLink size={18} />
                  </a>
                )}
                <Link to={`/admin/propiedades/${p.id}`}
                  className="p-2 rounded-lg hover:bg-gray-100 text-moss hover:text-forest-dark transition">
                  <Pencil size={18} />
                </Link>
                <button onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-moss hover:text-red-600 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
