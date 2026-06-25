import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const folder = process.argv[2] || 'horizonte-inmobiliario';

try {
  const { resources } = await cloudinary.api.resources({
    type: 'upload',
    prefix: folder + '/',
    max_results: 500,
  });

  if (resources.length === 0) {
    console.log('No hay imágenes en', folder);
    process.exit(0);
  }

  const publicIds = resources.map((r) => r.public_id);
  console.log(`Eliminando ${publicIds.length} imagen(es) de ${folder}...`);

  const result = await cloudinary.api.delete_resources(publicIds);
  const deleted = Object.values(result.deleted).filter(Boolean).length;
  console.log(`Eliminadas: ${deleted}`);
  console.log(`Errores: ${Object.values(result.deleted).filter((v) => !v).length}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
