import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import PropertyCard from './PropertyCard';

export default function Featured() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    api.getFeatured().then(setProperties).catch(() => setApiError('Error al cargar destacadas')).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="w-[min(1120px,calc(100%-36px))] mx-auto pb-[82px] pt-[60px] max-[620px]:pb-14 max-[620px]:pt-10">
      <div className="max-w-[640px] mb-7">
        <h2 className="mb-[10px] text-forest-dark text-[clamp(2rem,4vw,3.1rem)] font-[950]">Propiedades destacadas</h2>
        <p className="text-moss text-[1.05rem] leading-relaxed">Opciones revisadas por nuestro equipo para comprar o arrendar con más claridad.</p>
      </div>
      {apiError && <p className="text-red-600 text-sm font-bold mb-4">{apiError}</p>}
      <div className="grid grid-cols-4 max-[1060px]:grid-cols-2 max-[620px]:grid-cols-1 gap-[22px]">
        {properties.map((property) => (
          <PropertyCard property={property} key={property.id} />
        ))}
      </div>
    </section>
  );
}
