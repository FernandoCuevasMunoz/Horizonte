const API = 'http://localhost:8080/api';

async function getToken() {
  const res = await fetch(API + '/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || 'admin123' }),
  });
  if (!res.ok) throw new Error('Login failed: ' + res.status);
  const data = await res.json();
  return data.token;
}

const properties = [
  {
    code: "PRA-001",
    title: "Bello Departamento 1D 1B a pasos del Metro Santa Lucía",
    type: "Departamento",
    operation: "Arriendo",
    location: "San Isidro 151, Santiago Centro",
    region: "Región Metropolitana",
    price: "$330.000",
    numericPrice: 330000,
    beds: 1, baths: 1, area: 44, parking: 1,
    image: "https://res.cloudinary.com/k1liapob/image/upload/g_south_east,l_wm-logo,o_90,w_390/v1782362980/horizonte-inmobiliario/01sanIsidro151.jpg",
    neighborhood: "Santiago Centro",
    lat: -33.4436, lng: -70.6535,
    expenses: "GGCC: $65.000 aprox.",
    contributions: "No aplica para arrendatario.",
    builtYear: 2020,
    orientation: "Norte",
    floor: "Piso 8",
    buildingFloors: "9",
    nearby: "Metro Santa Lucía, clínica, supermercados, comercio diverso",
    equipment: "Encimera a gas, Caldera (agua caliente), Conexión para lavadora",
    featured: true,
    gallery: [
      "https://res.cloudinary.com/k1liapob/image/upload/g_south_east,l_wm-logo,o_90,w_390/v1782362980/horizonte-inmobiliario/01sanIsidro151.jpg",
      "https://res.cloudinary.com/k1liapob/image/upload/g_south_east,l_wm-logo,o_90,w_390/v1782362983/horizonte-inmobiliario/02sanIsidro151.jpg",
      "https://res.cloudinary.com/k1liapob/image/upload/g_south_east,l_wm-logo,o_90,w_390/v1782362984/horizonte-inmobiliario/03sanIsidro151.jpg",
      "https://res.cloudinary.com/k1liapob/image/upload/g_south_east,l_wm-logo,o_90,w_390/v1782362986/horizonte-inmobiliario/04sanIsidro151.jpg",
    ].join('\n'),
  },
  {
    code: "PRV-001",
    title: "Departamento luminoso en Ñuñoa",
    type: "Departamento",
    operation: "Comprar",
    location: "Ñuñoa",
    region: "Región Metropolitana",
    price: "UF 5.450",
    numericPrice: 196000000,
    beds: 2, baths: 2, area: 76, parking: 1,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=82",
    neighborhood: "Barrio residencial Ñuñoa",
    lat: -33.4567, lng: -70.6019,
    expenses: "GGCC: $111.601 aprox.",
    contributions: "Contribuciones: $82.694 por cuota.",
    builtYear: 1990,
    orientation: "Oriente",
    floor: "13",
    buildingFloors: "17",
    recentWork: "Baños, cocina y pisos",
    nearby: "Metro, colegios y universidades",
    equipment: "Aire acondicionado, Agua caliente por calefont, Cubierta de cocina en granito, Ventanas con marco de aluminio",
    community: "Ascensor, jardines y conserjería 24/7",
    featured: true,
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=900&q=82",
    ].join('\n'),
  },
  {
    code: "PRV-002",
    title: "Casa con jardin en Las Condes",
    type: "Casa",
    operation: "Comprar",
    location: "Las Condes",
    region: "Región Metropolitana",
    price: "UF 13.200",
    numericPrice: 475000000,
    beds: 5, baths: 4, area: 245, parking: 1,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=82",
    neighborhood: "San Carlos de Apoquindo",
    lat: -33.4167, lng: -70.5833,
    expenses: "GGCC: $260.000 aprox.",
    contributions: "Contribuciones: $390.000 por cuota.",
    builtYear: 2014,
    orientation: "Norte",
    floor: "Casa",
    buildingFloors: "2 pisos",
    recentWork: "Terraza, quincho y paisajismo",
    nearby: "Colegios, universidades y senderos",
    equipment: "Piscina, Quincho, Calefacción por losa, Dormitorio de servicio",
    community: "Accesos controlados y áreas deportivas cercanas",
    featured: true,
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=900&q=82",
    ].join('\n'),
  },
  {
    code: "PRA-002",
    title: "Townhouse moderno en Vitacura",
    type: "Casa",
    operation: "Arriendo",
    location: "Vitacura",
    region: "Región Metropolitana",
    price: "$ 2.100.000",
    numericPrice: 2100000,
    beds: 3, baths: 3, area: 132, parking: 1,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=82",
    neighborhood: "Vitacura oriente",
    lat: -33.4000, lng: -70.5833,
    expenses: "GGCC incluidos en arriendo.",
    contributions: "No aplica para arrendatario.",
    builtYear: 2019,
    orientation: "Poniente",
    floor: "Townhouse",
    buildingFloors: "3 niveles",
    recentWork: "Pintura completa y mantención general",
    nearby: "Parques, restaurantes y comercio",
    equipment: "Climatización, Cocina integrada, Estacionamiento doble, Bodega",
    community: "Condominio boutique con acceso controlado",
    featured: true,
    gallery: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=82",
    ].join('\n'),
  },
  {
    code: "PRA-003",
    title: "Oficina boutique en Providencia",
    type: "Oficina",
    operation: "Arriendo",
    location: "Providencia",
    region: "Región Metropolitana",
    price: "$ 980.000",
    numericPrice: 980000,
    beds: 4, baths: 2, area: 94, parking: 1,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=82",
    neighborhood: "Metro Pedro de Valdivia",
    lat: -33.4333, lng: -70.6167,
    expenses: "GGCC: $145.000 aprox.",
    contributions: "No aplica para arrendatario.",
    builtYear: 2012,
    orientation: "Sur",
    floor: "6",
    buildingFloors: "12",
    recentWork: "Piso flotante y luminarias",
    nearby: "Metro, bancos y servicios",
    equipment: "Climatización, Sala de reuniones, Kitchenette, Cableado de red",
    community: "Recepción, ascensores y seguridad",
    featured: false,
    gallery: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=82",
    ].join('\n'),
  },
  {
    code: "PRV-003",
    title: "Parcela equipada en Chicureo",
    type: "Parcela",
    operation: "Comprar",
    location: "Chicureo",
    region: "Región Metropolitana",
    price: "UF 10.800",
    numericPrice: 388000000,
    beds: 4, baths: 3, area: 310, parking: 1,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=82",
    neighborhood: "Chicureo poniente",
    lat: -33.2833, lng: -70.6333,
    expenses: "GGCC: $210.000 aprox.",
    contributions: "Contribuciones: $185.000 por cuota.",
    builtYear: 2017,
    orientation: "Norte",
    floor: "Casa",
    buildingFloors: "1 piso",
    recentWork: "Terraza, piscina y quincho",
    nearby: "Colegios, autopistas y strip centers",
    equipment: "Piscina, Paneles solares, Riego automático, Portón eléctrico",
    community: "Condominio consolidado con seguridad",
    featured: false,
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=900&q=82",
    ].join('\n'),
  },
  {
    code: "PRA-004",
    title: "Local comercial en Providencia",
    type: "Local comercial",
    operation: "Arriendo",
    location: "Providencia",
    region: "Región Metropolitana",
    price: "$ 1.850.000",
    numericPrice: 1850000,
    beds: 1, baths: 1, area: 64, parking: 1,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=82",
    neighborhood: "Av. Providencia",
    lat: -33.4280, lng: -70.6167,
    expenses: "GGCC: $98.000 aprox.",
    contributions: "No aplica para arrendatario.",
    builtYear: 2015,
    orientation: "Norte",
    floor: "1",
    buildingFloors: "8",
    recentWork: "Fachada renovada",
    nearby: "Metro, bancos y comercio",
    equipment: "Climatización, Baño privado, Vitrina, Cableado de red",
    community: "Edificio corporativo con conserjería",
    featured: false,
    gallery: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=82",
    ].join('\n'),
  },
];

async function seed() {
  let token;
  try {
    token = await getToken();
  } catch (e) {
    console.log('ERROR: No se pudo autenticar — ' + e.message);
    return;
  }

  let ok = 0, fail = 0;
  for (const p of properties) {
    try {
      const res = await fetch(API + '/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(p),
      });
      if (res.ok) { ok++; console.log(`OK: ${p.title}`); }
      else { fail++; console.log(`FAIL: ${p.title} — ${res.status}`); }
    } catch (e) {
      fail++;
      console.log(`ERROR: ${p.title} — ${e.message}`);
    }
  }
  console.log(`\nSeed completo: ${ok} OK, ${fail} fallos`);
}

seed();
