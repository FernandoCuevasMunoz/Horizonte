import PropertyCard from './PropertyCard';
import { properties } from '../data/properties';

export default function Featured() {
  return (
    <section className="w-[min(1120px,calc(100%-36px))] mx-auto pb-[82px] pt-[60px] max-[620px]:pb-14 max-[620px]:pt-10">
      <div className="max-w-[640px] mb-7">
        <h2 className="mb-[10px] text-forest-dark text-[clamp(2rem,4vw,3.1rem)] font-[950]">Propiedades destacadas</h2>
        <p className="text-moss text-[1.05rem] leading-relaxed">Opciones revisadas por nuestro equipo para comprar o arrendar con mas claridad.</p>
      </div>
      <div className="grid max-[620px]:grid-cols-1 max-[1060px]:grid-cols-2 grid-cols-4 gap-[22px]">
        {properties
          .filter((property) => property.featured)
          .map((property) => (
            <PropertyCard property={property} key={property.id} />
          ))}
      </div>
    </section>
  );
}
