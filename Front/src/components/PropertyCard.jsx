import { Link } from 'react-router-dom';
import { Bath, BedDouble, MapPin, Ruler } from 'lucide-react';
import { formatCLP, formatUFEstimate } from '../utils/format';
import { useUFRate } from '../utils/ufRate';

export default function PropertyCard({ property }) {
  const ufRate = useUFRate();
  return (
    <Link
      className="block overflow-hidden border border-border rounded-lg bg-white shadow-[0_14px_34px_rgba(22,45,39,0.08)] text-inherit no-underline transition-transform duration-[180ms] ease-[ease] hover:-translate-y-[3px] hover:shadow-[0_18px_44px_rgba(22,45,39,0.12)]"
      to={`/propiedades/${property.code || property.id}`}
    >
      <div className="relative">
        <img className={`block w-full aspect-[1.25] object-cover ${property.status ? 'grayscale opacity-50' : ''}`} src={property.image} alt={property.title} />
        {property.status && (
          <span className={`absolute top-3 right-3 text-[0.75rem] font-black px-3 py-1.5 rounded-lg shadow-lg ${property.status === 'Vendido' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}`}>
            {property.status.toUpperCase()}
          </span>
        )}
      </div>
      <div className={`p-5 ${property.status ? 'opacity-60' : ''}`}>
        <span className="inline-flex mb-3 px-[10px] py-[5px] rounded-full bg-[#e8f2e8] text-forest text-[0.78rem] font-[850]">{property.operation}</span>
        {property.code && <span className="text-[#68736f] text-[0.78rem] font-bold ml-2">{property.code}</span>}
        <h3 className="m-0 text-[#173f36] text-[1.16rem] font-black leading-tight">{property.title}</h3>
        <p className="flex items-center gap-[6px] my-[10px] mb-[14px] text-[#68736f] font-bold">
          <MapPin size={16} aria-hidden="true" />
          {property.neighborhood}
        </p>
        <div className="flex flex-wrap gap-3 text-[#46534f] text-[0.95rem] font-[750]">
          <span className="inline-flex items-center gap-[5px]">
            <BedDouble size={17} aria-hidden="true" />
            {property.beds}D
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <Bath size={17} aria-hidden="true" />
            {property.baths}B
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <Ruler size={17} aria-hidden="true" />
            {property.area} m2
          </span>
        </div>
        <div className="mt-[18px] pt-4 border-t border-[#edf1ef]">
          <div className="flex items-end justify-between">
            <div>
              {property.price.startsWith('UF') ? (
                <>
                  <strong className="text-forest text-[1.2rem] whitespace-nowrap">{property.price}</strong>
                  <span className="block mt-[2px] text-[#68736f] text-[0.85rem] font-bold">{formatCLP(property.numericPrice)}</span>
                </>
              ) : (
                <>
                  <strong className="text-forest text-[1.2rem] whitespace-nowrap">{formatCLP(property.numericPrice)}</strong>
                  {formatUFEstimate(property.numericPrice, ufRate) && (
                    <span className="block mt-[2px] text-[#68736f] text-[0.85rem] font-bold">{formatUFEstimate(property.numericPrice, ufRate)}</span>
                  )}
                </>
              )}
            </div>
          </div>
          <span className="block text-center mt-5 text-[#173f36] font-[850] no-underline text-[0.95rem]">Ver detalle</span>
        </div>
      </div>
    </Link>
  );
}
