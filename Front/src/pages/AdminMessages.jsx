import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Mail, Phone, User, X } from 'lucide-react';

function parseVentaMessage(text) {
  const fields = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (m) fields[m[1].trim()] = m[2].trim();
  }
  return fields;
}

const fieldLabels = {
  'Tipo': 'Tipo de propiedad',
  'Comuna': 'Comuna',
  'Dirección': 'Dirección',
  'Valor esperado': 'Valor esperado de venta',
  'Descripción': 'Descripción',
  'Horarios de contacto': 'Horarios de contacto',
  '¿Cómo llegó?': '¿Cómo llegó a nosotros?',
  'Publicada por terceros': 'Publicada por terceros',
};

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.getMessages().then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black text-forest-dark mb-6">Mensajes</h1>
      {loading ? <p className="text-moss">Cargando...</p> : messages.length === 0 ? (
        <p className="text-moss">No hay mensajes aún</p>
      ) : (
        <div className="space-y-4">
          {messages.toReversed().map(m => (
            <div key={m.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-forest/10 text-forest">
                    {m.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(m.createdAt).toLocaleString('es-CL')}
                  </span>
                </div>
                {m.type === 'venta' && (
                  <button
                    className="text-xs font-bold text-forest hover:text-forest-dark underline underline-offset-2 cursor-pointer"
                    onClick={() => setSelected(m)}
                  >
                    Consulta #{m.id}
                  </button>
                )}
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="flex items-center gap-2">
                  <User size={14} className="text-moss flex-shrink-0" />
                  <span className="font-semibold text-forest-dark">{m.name}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-moss flex-shrink-0" />
                  <a href={`mailto:${m.email}`} className="text-forest hover:underline">{m.email}</a>
                </p>
                {m.phone && <p className="flex items-center gap-2">
                  <Phone size={14} className="text-moss flex-shrink-0" />
                  <span>{m.phone}</span>
                </p>}
                <p className="mt-3 text-forest-dark bg-gray-50 p-3 rounded-lg whitespace-pre-wrap text-[0.82rem]">{m.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-forest-dark">Consulta de venta #{selected.id}</h2>
              <button className="text-moss hover:text-forest-dark cursor-pointer" onClick={() => setSelected(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="bg-cream rounded-lg p-4 mb-5 space-y-2 text-sm">
              <p><span className="font-semibold text-forest-dark">Nombre:</span> {selected.name}</p>
              <p><span className="font-semibold text-forest-dark">Email:</span> <a href={`mailto:${selected.email}`} className="text-forest hover:underline">{selected.email}</a></p>
              {selected.phone && <p><span className="font-semibold text-forest-dark">Teléfono:</span> {selected.phone}</p>}
            </div>

            {(() => {
              const fields = parseVentaMessage(selected.message);
              return (
                <div className="space-y-3">
                  {Object.entries(fieldLabels).map(([key, label]) => {
                    const val = fields[key];
                    if (!val || val === 'No especificado') return null;
                    return (
                      <div key={key}>
                        <label className="block text-xs font-bold text-moss uppercase tracking-wide mb-1">{label}</label>
                        <div className="w-full bg-gray-50 border border-border rounded-lg px-3 py-2 text-sm text-forest-dark">
                          {val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="mt-6 text-xs text-moss">
              Recibido: {new Date(selected.createdAt).toLocaleString('es-CL')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
