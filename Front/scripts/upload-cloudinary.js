import { v2 as cloudinary } from 'cloudinary';
import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const folder = process.argv[2];
if (!folder) {
  console.error('Usa: node scripts/upload-cloudinary.js <ruta-de-carpeta>');
  process.exit(1);
}

const dir = resolve(folder);
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

if (files.length === 0) {
  console.log('No se encontraron imágenes en:', dir);
  process.exit(0);
}

console.log(`Subiendo ${files.length} archivo(s) desde ${dir}...\n`);

for (const file of files) {
  try {
    const publicId = file.replace(/\.[^.]+$/, '');
    const imagePath = join(dir, file);
    const resized = await sharp(imagePath)
      .resize({ width: 2000, fit: 'inside' })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { public_id: publicId, folder: 'horizonte-inmobiliario' },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
      upload.end(resized);
    });

    const wmUrl = result.secure_url.replace('/upload/', '/upload/g_south_east,l_wm-logo,o_90,w_300/');

    console.log(wmUrl);
  } catch (err) {
    console.error(`Error con ${file}:`, err.message);
  }
}
