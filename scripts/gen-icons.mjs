// Genera los iconos PWA a partir de assets/icon.svg
// Uso: node scripts/gen-icons.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = await readFile(resolve(root, 'assets/icon.svg'));
const pub = resolve(root, 'public');
await mkdir(pub, { recursive: true });

const BG = { r: 0xf3, g: 0xf0, b: 0xe8, alpha: 1 };

const targets = [
  { file: 'icon-192.png', size: 192, pad: 0 },
  { file: 'icon-512.png', size: 512, pad: 0 },
  // maskable: el glifo dentro de la "safe zone" (~80%)
  { file: 'icon-512-maskable.png', size: 512, pad: 52 },
  { file: 'apple-touch-icon.png', size: 180, pad: 0 },
];

for (const { file, size, pad } of targets) {
  const inner = size - pad * 2;
  const glyph = await sharp(src, { density: 384 }).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: glyph, top: pad, left: pad }])
    .png()
    .toFile(resolve(pub, file));
  console.log('  ✓', file);
}

// favicon.svg = copia directa del fuente
await writeFile(resolve(pub, 'favicon.svg'), src);
console.log('  ✓ favicon.svg');
