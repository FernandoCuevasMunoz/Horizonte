import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../utils/api';
import { ArrowLeft } from 'lucide-react';

const TYPES = ['Departamento', 'Casa', 'Oficina', 'Local comercial', 'Parcela'];
const OPERATIONS = ['Comprar', 'Arrendar'];
const COMMUNES = [
  'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba',
  'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina',
  'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa',
  'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal',
  'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Santiago Centro', 'Vitacura',
];

export default function AdminPropertyForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', code: '', type: 'Departamento', operation: 'Comprar', location: '', region: 'Región Metropolitana',
    price: '', numericPrice: '', beds: 1, baths: 1, area: 50, image: '', neighborhood: '',
    lat: -33.45, lng: -70.65, expenses: '', contributions: '', year: 2020, orientation: 'Norte',
    floor: '', buildingFloors: '', recentWork: '', nearby: '', equipment: '', community: '',
    featured: false, gallery: '',
  });

  useEffect(() => {
    if (isEdit) api.getProperty(id).then(p => {
      setForm({
        ...p,
        numericPrice: p.numericPrice || '',
        beds: p.beds || 1,
        baths: p.baths || 1,
        area: p.area || 50,
        year: p.builtYear || p.year || 2020,
        lat: p.lat || -33.45,
        lng: p.lng || -70.65,
        equipment: p.equipment ? (Array.isArray(p.equipment) ? p.equipment.join(', ') : p.equipment) : '',
        gallery: p.gallery ? (Array.isArray(p.gallery) ? p.gallery.join('\n') : p.gallery) : '',
      });
    }).catch(() => navigate('/admin/propiedades'));
  }, [id]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
        area: Number(form.area) || 0,
        builtYear: Number(form.year) || 2020,
        year: undefined,
        equipment: form.equipment,
        gallery: form.gallery,
      };
      const numPrice = Number(form.numericPrice);
      if (numPrice || !isEdit) body.numericPrice = numPrice || 0;
      if (isEdit) await api.updateProperty(id, body);
      else await api.createProperty(body);
      navigate('/admin/propiedades');
    } catch (e) {
      alert('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-border-input rounded-lg text-forest-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest';

  return (
    <div>
      <button onClick={() => navigate('/admin/propiedades')} className="flex items-center gap-1 text-moss hover:text-forest-dark text-sm mb-4 transition">
        <ArrowLeft size={16} /> Volver
      </button>
      <h1 className="text-2xl font-black text-forest-dark mb-6">{isEdit ? 'Editar' : 'Nueva'} propiedad</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border max-w-3xl space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-forest-dark mb-1">Título</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Código</label>
            <input value={form.code} onChange={e => set('code', e.target.value)} className={inputClass} placeholder="PRV-001" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Tipo</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputClass}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Operación</label>
            <select value={form.operation} onChange={e => set('operation', e.target.value)} className={inputClass}>
              {OPERATIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Ubicación</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} className={inputClass} placeholder="Dirección" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Comuna</label>
            <select value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} className={inputClass}>
              <option value="">Seleccionar</option>
              {COMMUNES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Precio (texto)</label>
            <input value={form.price} onChange={e => set('price', e.target.value)} className={inputClass} placeholder="UF 5.450" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Precio numérico</label>
            <input type="number" value={form.numericPrice} onChange={e => set('numericPrice', e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-semibold text-forest-dark mb-1">Dorm.</label>
              <input type="number" value={form.beds} onChange={e => set('beds', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest-dark mb-1">Baños</label>
              <input type="number" value={form.baths} onChange={e => set('baths', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest-dark mb-1">m²</label>
              <input type="number" value={form.area} onChange={e => set('area', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Año construcción</label>
            <input type="number" value={form.year} onChange={e => set('year', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Orientación</label>
            <select value={form.orientation} onChange={e => set('orientation', e.target.value)} className={inputClass}>
              {['Norte', 'Sur', 'Oriente', 'Poniente'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4" />
            <label htmlFor="featured" className="text-sm font-semibold text-forest-dark">Destacada</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-forest-dark mb-1">URL de imagen principal</label>
          <input value={form.image} onChange={e => set('image', e.target.value)} className={inputClass} placeholder="https://..." />
        </div>

        <div>
          <label className="block text-sm font-semibold text-forest-dark mb-1">Galería (una URL por línea)</label>
          <textarea value={form.gallery} onChange={e => set('gallery', e.target.value)} className={inputClass + ' h-24'} placeholder="https://..." />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Equipamiento (separado por coma)</label>
            <textarea value={form.equipment} onChange={e => set('equipment', e.target.value)} className={inputClass + ' h-20'} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Gastos comunes</label>
            <input value={form.expenses} onChange={e => set('expenses', e.target.value)} className={inputClass} />
            <label className="block text-sm font-semibold text-forest-dark mb-1 mt-2">Contribuciones</label>
            <input value={form.contributions} onChange={e => set('contributions', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-forest-dark mb-1">Cercanías</label>
          <input value={form.nearby} onChange={e => set('nearby', e.target.value)} className={inputClass} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <motion.button type="submit" disabled={saving}
            className="bg-forest text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-forest-dark transition disabled:opacity-60"
            whileHover={!saving ? { scale: 1.03 } : undefined}
            whileTap={!saving ? { scale: 0.97 } : undefined}>
            {saving ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear propiedad')}
          </motion.button>
          <button type="button" onClick={() => navigate('/admin/propiedades')}
            className="text-moss hover:text-forest-dark text-sm font-semibold transition">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
