import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../utils/api';
import { useUFRate } from '../utils/ufRate';
import { ArrowLeft, ChevronUp, ChevronDown, Star, Trash2, Upload, MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const markerSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="#1E4D40" d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="#FFF" cx="12.5" cy="12.5" r="4.5"/></svg>');
const defaultIcon = L.icon({ iconUrl: `data:image/svg+xml,${markerSvg}`, iconSize: [25, 41], iconAnchor: [12, 41], shadowUrl: iconShadow, shadowSize: [41, 41], shadowAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

const TYPES = ['Departamento', 'Casa', 'Oficina', 'Local comercial', 'Parcela'];
const OPERATIONS = ['Comprar', 'Arrendar'];
const COMMUNES = [
  'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí',
  'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia',
  'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina',
  'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú',
  'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda',
  'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura',
  'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo',
  'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura',
];

export default function AdminPropertyForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const ufRate = useUFRate();

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'k1liapob';
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'horizonte_unsigned';

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadError, setUploadError] = useState('');

  function getGalleryUrls() {
    return form.gallery ? form.gallery.split('\n').filter(Boolean) : [];
  }

  function setGalleryUrls(urls) {
    set('gallery', urls.join('\n'));
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');
    const existing = getGalleryUrls();
    const newUrls = [...existing];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });
      try {
        const fd = new FormData();
        fd.append('file', files[i]);
        fd.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Error HTTP ${res.status}`);
        }
        const data = await res.json();
        const wmUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/g_south_east,l_wm-logo,o_90,w_300/v${data.version}/${data.public_id}.${data.format}`;
        newUrls.push(wmUrl);
      } catch (err) {
        setUploadError(`Error con "${files[i].name}": ${err.message}`);
        break;
      }
    }

    setGalleryUrls(newUrls);
    if (!form.image && newUrls.length) set('image', newUrls[0]);
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    e.target.value = '';
  }

  function removeImage(url) {
    const urls = getGalleryUrls().filter(u => u !== url);
    setGalleryUrls(urls);
    if (form.image === url) set('image', urls.length ? urls[0] : '');
  }

  const dragIndex = useRef(null);

  function handleDragStart(e, i) {
    dragIndex.current = i;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, i) {
    if (dragIndex.current === null || dragIndex.current === i) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, i) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) return;
    const urls = getGalleryUrls();
    const next = [...urls];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setGalleryUrls(next);
    if (form.image === urls[from] && form.image !== next[0]) set('image', next[0]);
    dragIndex.current = null;
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  function moveImage(i, dir) {
    const urls = getGalleryUrls();
    const j = i + dir;
    if (j < 0 || j >= urls.length) return;
    const next = [...urls];
    [next[i], next[j]] = [next[j], next[i]];
    setGalleryUrls(next);
    if (form.image === urls[i] && form.image !== next[0]) set('image', next[0]);
  }

  const [geoStatus, setGeoStatus] = useState('idle');

  function DraggableMarker() {
    const markerRef = useRef(null);

    function handleMove(lat, lng) {
      set('lat', Math.round(lat * 10000) / 10000);
      set('lng', Math.round(lng * 10000) / 10000);
    }

    useMapEvents({
      click(e) { handleMove(e.latlng.lat, e.latlng.lng); },
    });

    return (
      <Marker
        ref={markerRef}
        position={[form.lat, form.lng]}
        draggable={true}
        eventHandlers={{
          dragend() { const m = markerRef.current; if (m) { const p = m.getLatLng(); handleMove(p.lat, p.lng); } },
        }}
      />
    );
  }

  async function handleGeoCode() {
    const q = [form.location, form.neighborhood, 'Santiago', 'Chile'].filter(Boolean).join(', ');
    if (!form.location || !form.neighborhood) { setGeoStatus('notfound'); return; }
    setGeoStatus('loading');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await res.json();
      if (data.length) {
        set('lat', parseFloat(data[0].lat));
        set('lng', parseFloat(data[0].lon));
        setGeoStatus('found');
      } else {
        setGeoStatus('notfound');
      }
    } catch {
      setGeoStatus('notfound');
    }
  }

  function syncLat(e) {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) set('lat', v);
  }

  function syncLng(e) {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) set('lng', v);
  }

  function formatUF(amount, rate) {
    if (!rate || !amount) return '';
    const uf = Number(amount) / rate;
    if (uf >= 1000) return `UF ${Math.round(uf).toLocaleString('es-CL')}`;
    return `UF ${uf.toFixed(1).replace('.', ',')}`;
  }

  const [form, setForm] = useState({
    title: '', code: '', type: 'Departamento', operation: 'Comprar', location: '', region: 'Región Metropolitana',
    price: '', numericPrice: '', beds: 1, baths: 1, area: 50, image: '', neighborhood: '',
    lat: -33.45, lng: -70.65, expenses: '', contributions: '', year: 2020, orientation: 'Norte', parking: 2,
    floor: '', buildingFloors: '', recentWork: '', nearby: '', equipment: '', community: '',
    featured: false, gallery: '', description: '',
  });

  useEffect(() => {
    if (isEdit) api.getProperty(id).then(p => {
      const numericPrice = p.numericPrice || '';
      setForm({
        ...p,
        numericPrice,
        price: formatUF(numericPrice, ufRate) || p.price || '',
        beds: p.beds || 1,
        baths: p.baths || 1,
        area: p.area || 50,
        year: p.builtYear || p.year || 2020,
        lat: p.lat || -33.45,
        lng: p.lng || -70.65,
        equipment: p.equipment ? (Array.isArray(p.equipment) ? p.equipment.join(', ') : p.equipment) : '',
        gallery: p.gallery ? (Array.isArray(p.gallery) ? p.gallery.join('\n') : p.gallery) : '',
        description: p.description || '',
      });
    }).catch(() => navigate('/admin/propiedades'));
  }, [id]);

  useEffect(() => {
    if (ufRate && form.numericPrice && !form.price) {
      setForm(f => ({ ...f, price: formatUF(f.numericPrice, ufRate) }));
    }
  }, [ufRate]);

  useEffect(() => {
    if (isEdit) return;
    let cancelled = false;
    api.getProperties().then(props => {
      if (cancelled) return;
      const prefix = form.operation === 'Comprar' ? 'PRV' : 'PRA';
      const codes = props
        .filter(p => p.code?.startsWith(prefix))
        .map(p => parseInt(p.code.split('-')[1], 10))
        .filter(n => !isNaN(n));
      const max = codes.length ? Math.max(...codes) : 0;
      setForm(f => ({ ...f, code: `${prefix}-${String(max + 1).padStart(3, '0')}` }));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [form.operation, isEdit]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function setNumericPrice(value) {
    setForm(f => ({ ...f, numericPrice: value, price: formatUF(value, ufRate) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const numPrice = Number(form.numericPrice);
      const body = {
        ...form,
        price: formatUF(numPrice, ufRate) || form.price || '',
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
        area: Number(form.area) || 0,
        builtYear: Number(form.year) || 2020,
        year: undefined,
        equipment: form.equipment,
        gallery: form.gallery,
        description: form.description,
      };
      body.numericPrice = numPrice || 0;
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
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-forest-dark mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} className={inputClass + ' h-24'} placeholder="Describe la propiedad: distribución, entorno, características destacadas..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Código</label>
            <input value={form.code} disabled className={inputClass + ' bg-gray-100 cursor-not-allowed'} />
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
            <label className="block text-sm font-semibold text-forest-dark mb-1">Precio UF</label>
            <input value={form.price} disabled className={inputClass + ' bg-gray-100 cursor-not-allowed'} placeholder="Se calcula automáticamente" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Precio CLP</label>
            <input type="number" value={form.numericPrice} onChange={e => setNumericPrice(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-sm font-semibold text-forest-dark mb-1">Dorm.</label>
              <input type="number" value={form.beds} onChange={e => set('beds', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest-dark mb-1">Baños</label>
              <input type="number" value={form.baths} onChange={e => set('baths', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest-dark mb-1">Estac.</label>
              <input type="number" value={form.parking} onChange={e => set('parking', e.target.value)} className={inputClass} />
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

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Gastos comunes</label>
            <input value={form.expenses} onChange={e => set('expenses', e.target.value)} className={inputClass} />
          </div>
          <div>
            {form.operation !== 'Arrendar' && (
              <>
                <label className="block text-sm font-semibold text-forest-dark mb-1">Contribuciones</label>
                <input value={form.contributions} onChange={e => set('contributions', e.target.value)} className={inputClass} />
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Piso unidad</label>
            <input value={form.floor} onChange={e => set('floor', e.target.value)} className={inputClass} placeholder="Ej: Piso 8, 13" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Total pisos edificio</label>
            <input value={form.buildingFloors} onChange={e => set('buildingFloors', e.target.value)} className={inputClass} placeholder="Ej: 9, 17" />
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-forest-dark mb-3">Ubicación en mapa</h3>

          <button type="button" onClick={handleGeoCode} disabled={geoStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-white text-sm font-semibold hover:bg-forest-dark transition disabled:opacity-60 mb-3">
            <Navigation size={16} />
            {geoStatus === 'loading' ? 'Buscando...' : 'Buscar dirección'}
          </button>

          {geoStatus === 'found' && <p className="text-green-600 text-xs font-semibold mb-2">✓ Ubicación encontrada</p>}
          {geoStatus === 'notfound' && <p className="text-amber-600 text-xs font-semibold mb-2">No se pudo geocodificar. Arrastra el marcador o ingresa las coordenadas manualmente.</p>}

          <div className="h-[260px] rounded-lg overflow-hidden border mb-3">
            <MapContainer center={[form.lat, form.lng]} zoom={15} scrollWheelZoom={true} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <DraggableMarker />
            </MapContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1">Latitud</label>
              <input type="number" step="any" value={form.lat} onChange={syncLat} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1">Longitud</label>
              <input type="number" step="any" value={form.lng} onChange={syncLng} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Equipamiento (separado por coma)</label>
            <textarea value={form.equipment} onChange={e => set('equipment', e.target.value)} className={inputClass + ' h-20'} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-dark mb-1">Cercanías</label>
            <input value={form.nearby} onChange={e => set('nearby', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-forest-dark mb-3">Imágenes</h3>

          <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition ${uploading ? 'border-gray-200 bg-gray-100 cursor-wait' : 'border-gray-300 hover:border-forest hover:bg-forest/5'}`}>
            <Upload size={20} className={uploading ? 'text-gray-400' : 'text-moss'} />
            <span className={`text-sm font-medium ${uploading ? 'text-gray-400' : 'text-moss'}`}>
              {uploading ? `Subiendo ${uploadProgress.current} de ${uploadProgress.total}...` : 'Seleccionar imágenes'}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>

          {uploading && (
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-forest rounded-full transition-all duration-300" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
            </div>
          )}

          {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}

          {getGalleryUrls().length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
              {getGalleryUrls().map((url, i) => (
                <div key={i} draggable={true}
                  onDragStart={e => handleDragStart(e, i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDrop={e => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  className="relative group aspect-square rounded-lg overflow-hidden border bg-white cursor-grab active:cursor-grabbing">
                  <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                  {url === form.image && (
                    <div className="absolute top-1 left-1 bg-amber-400 text-white rounded-full p-1 shadow pointer-events-none">
                      <Star size={12} fill="white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1.5">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                      className="p-1.5 rounded-full bg-white text-moss hover:bg-forest hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed" title="Mover izquierda">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" onClick={() => set('image', url)}
                      className={`p-1.5 rounded-full transition ${url === form.image ? 'bg-amber-400 text-white' : 'bg-white text-moss hover:bg-amber-400 hover:text-white'}`} title="Principal">
                      <Star size={14} />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === getGalleryUrls().length - 1}
                      className="p-1.5 rounded-full bg-white text-moss hover:bg-forest hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed" title="Mover derecha">
                      <ChevronDown size={14} />
                    </button>
                    <button type="button" onClick={() => removeImage(url)}
                      className="p-1.5 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
