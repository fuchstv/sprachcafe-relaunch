const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const requiredAssets = [
  // 3 Kiez Architectural Illustrations
  { path: 'public/images/illustrations/kiez-pankow.webp', type: 'raster', maxKb: 120 },
  { path: 'public/images/illustrations/kiez-schoeneberg.webp', type: 'raster', maxKb: 120 },
  { path: 'public/images/illustrations/kiez-koepenick.webp', type: 'raster', maxKb: 120 },
  
  // 6 Polish Poster School Cultural Linocuts
  { path: 'public/images/illustrations/linocut-lesung.webp', type: 'raster', maxKb: 120 },
  { path: 'public/images/illustrations/linocut-jazz.webp', type: 'raster', maxKb: 120 },
  { path: 'public/images/illustrations/linocut-tandem.webp', type: 'raster', maxKb: 120 },
  { path: 'public/images/illustrations/linocut-kunst.webp', type: 'raster', maxKb: 120 },
  { path: 'public/images/illustrations/linocut-kinder.webp', type: 'raster', maxKb: 120 },
  { path: 'public/images/illustrations/linocut-film.webp', type: 'raster', maxKb: 120 },
  
  // Stamps & Textures in stamps/
  { path: 'public/images/stamps/stamp-verfuegbar.svg', type: 'vector', maxKb: 50 },
  { path: 'public/images/stamps/stamp-ausgeliehen.svg', type: 'vector', maxKb: 50 },
  { path: 'public/images/stamps/stamp-sprachcafe-seal.svg', type: 'vector', maxKb: 50 },
  { path: 'public/images/stamps/texture-torn-paper.svg', type: 'vector', maxKb: 50 },
  { path: 'public/images/stamps/texture-ticket-perforation.svg', type: 'vector', maxKb: 50 },
  
  // Hero photos
  { path: 'public/images/hero/hero-collage-1.avif', type: 'raster', maxKb: 120 },
  { path: 'public/images/hero/hero-collage-2.avif', type: 'raster', maxKb: 120 },
  { path: 'public/images/hero/hero-collage-3.avif', type: 'raster', maxKb: 120 },
  { path: 'public/images/hero/hero-collage-4.avif', type: 'raster', maxKb: 120 },
  { path: 'public/images/hero/homepage-hero.webp', type: 'raster', maxKb: 120 },
  { path: 'public/images/hero/header-general.jpg', type: 'raster', maxKb: 120 },
  { path: 'public/images/hero/hero-encounter.jpg', type: 'raster', maxKb: 120 },
];

async function validate() {
  console.log('===============================================================');
  console.log('         SPRACHCAFÉ VISUAL ASSET VALIDATION REPORT             ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  for (const item of requiredAssets) {
    const fullPath = path.join(__dirname, item.path);
    if (!fs.existsSync(fullPath)) {
      console.error(`[FAIL] File missing: ${item.path}`);
      failed++;
      continue;
    }

    const stat = fs.statSync(fullPath);
    const sizeKb = stat.size / 1024;
    const sizeOk = sizeKb <= item.maxKb;

    if (item.type === 'raster') {
      try {
        const meta = await sharp(fullPath).metadata();
        const headerOk = Boolean(meta.format && meta.width && meta.height);
        
        if (headerOk && sizeOk) {
          console.log(`[PASS] ${item.path.padEnd(52)} | ${meta.format.toUpperCase()} | ${meta.width}x${meta.height} | ${sizeKb.toFixed(1)} KB (Limit: ${item.maxKb} KB)`);
          passed++;
        } else {
          console.error(`[FAIL] ${item.path} - headerOk: ${headerOk}, sizeOk: ${sizeOk} (${sizeKb.toFixed(1)} KB)`);
          failed++;
        }
      } catch (err) {
        console.error(`[FAIL] ${item.path} invalid image header:`, err.message);
        failed++;
      }
    } else {
      // Vector
      const content = fs.readFileSync(fullPath, 'utf8');
      const isSvg = content.includes('<svg') && content.includes('</svg>');
      if (isSvg && sizeOk) {
        console.log(`[PASS] ${item.path.padEnd(52)} | SVG  | Vector    | ${sizeKb.toFixed(1)} KB (Limit: ${item.maxKb} KB)`);
        passed++;
      } else {
        console.error(`[FAIL] ${item.path} - isSvg: ${isSvg}, sizeOk: ${sizeOk}`);
        failed++;
      }
    }
  }

  console.log('\n===============================================================');
  console.log(`TOTAL VALIDATED: ${requiredAssets.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

validate();
