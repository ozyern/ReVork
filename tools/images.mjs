// Regenerates the optimised device renders + favicons from the sources in assets/src.
// Run with `npm run images` after dropping a new PNG in there.
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets/src';
const OUT = 'assets';

// Cards top out at 280px tall, so 640 covers 2x displays with room to spare.
const MAX_H = 640;

const files = (await readdir(SRC)).filter((f) => f.endsWith('.png'));

for (const file of files) {
  const base = path.basename(file, '.png');
  const img = sharp(path.join(SRC, file)).resize({ height: MAX_H, withoutEnlargement: true });

  if (base === 'favicon') continue;

  await img.clone().webp({ quality: 82, effort: 6 }).toFile(path.join(OUT, `${base}.webp`));
  await img.clone().png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(path.join(OUT, `${base}.png`));
  console.log('device', base);
}

// Favicons: one 32px for tabs, one 180px for iOS home screens.
const fav = sharp(path.join(SRC, 'favicon.png'));
await fav.clone().resize(32, 32).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'favicon.png'));
await fav.clone().resize(180, 180).png({ compressionLevel: 9, palette: true }).toFile(path.join(OUT, 'apple-touch-icon.png'));
console.log('favicons done');
