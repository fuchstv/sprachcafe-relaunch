const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = '/home/ubuntu/.gemini/antigravity-cli/brain/a855c228-a69d-4034-bdcc-e5119306e173';
const publicDir = path.join(__dirname, 'public/images');
const illustrationsDir = path.join(publicDir, 'illustrations');
const locationsDir = path.join(publicDir, 'locations');
const eventsDir = path.join(publicDir, 'events');
const postersDir = path.join(eventsDir, 'posters');
const heroDir = path.join(publicDir, 'hero');

[illustrationsDir, locationsDir, eventsDir, postersDir, heroDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function processKiez() {
  console.log('--- Processing Kiez Architectural Illustrations ---');
  const kiezMap = [
    {
      src: path.join(brainDir, 'kiez_pankow_bridge_1787739347992.jpg'),
      targets: [
        path.join(illustrationsDir, 'kiez-pankow.webp'),
        path.join(illustrationsDir, 'kiez-pankow-illustration.webp'),
        path.join(locationsDir, 'kiez-pankow.webp'),
        path.join(locationsDir, 'kiez-pankow-illustration.webp'),
        path.join(locationsDir, 'pankow.webp'),
      ]
    },
    {
      src: path.join(brainDir, 'kiez_schoeneberg_cafe_1787739360702.jpg'),
      targets: [
        path.join(illustrationsDir, 'kiez-schoeneberg.webp'),
        path.join(illustrationsDir, 'kiez-schoeneberg-illustration.webp'),
        path.join(locationsDir, 'kiez-schoeneberg.webp'),
        path.join(locationsDir, 'kiez-schoeneberg-illustration.webp'),
        path.join(locationsDir, 'schoeneberg.webp'),
      ]
    },
    {
      src: path.join(brainDir, 'kiez_koepenick_castle_1787739371889.jpg'),
      targets: [
        path.join(illustrationsDir, 'kiez-koepenick.webp'),
        path.join(illustrationsDir, 'kiez-koepenick-illustration.webp'),
        path.join(locationsDir, 'kiez-koepenick.webp'),
        path.join(locationsDir, 'kiez-koepenick-illustration.webp'),
        path.join(locationsDir, 'koepenick.webp'),
      ]
    }
  ];

  for (const item of kiezMap) {
    if (!fs.existsSync(item.src)) {
      console.error(`Source not found: ${item.src}`);
      continue;
    }
    const buffer = await sharp(item.src)
      .resize({ width: 850, withoutEnlargement: true })
      .webp({ quality: 76, effort: 6 })
      .toBuffer();

    for (const target of item.targets) {
      fs.writeFileSync(target, buffer);
      const stats = fs.statSync(target);
      console.log(`Saved: ${target} (${stats.size} bytes = ${(stats.size / 1024).toFixed(1)} KB)`);
    }
  }
}

async function processLinocuts() {
  console.log('\n--- Processing Polish Poster School Linocuts ---');
  const linocutMap = [
    {
      src: path.join(brainDir, 'linocut_lesung_literatur_1787739390608.jpg'),
      targets: [
        path.join(illustrationsDir, 'linocut-lesung.webp'),
        path.join(illustrationsDir, 'linocut-literatur.webp'),
        path.join(postersDir, 'poster-literatur.webp'),
        path.join(postersDir, 'linocut-lesung.webp'),
        path.join(eventsDir, 'linocut-lesung.webp'),
      ]
    },
    {
      src: path.join(brainDir, 'linocut_jazz_music_1787739407959.jpg'),
      targets: [
        path.join(illustrationsDir, 'linocut-jazz.webp'),
        path.join(postersDir, 'poster-jazz.webp'),
        path.join(postersDir, 'linocut-jazz.webp'),
        path.join(eventsDir, 'linocut-jazz.webp'),
      ]
    },
    {
      src: path.join(brainDir, 'linocut_tandem_dialog_1787739422845.jpg'),
      targets: [
        path.join(illustrationsDir, 'linocut-tandem.webp'),
        path.join(postersDir, 'poster-tandem.webp'),
        path.join(postersDir, 'linocut-tandem.webp'),
        path.join(eventsDir, 'linocut-tandem.webp'),
      ]
    },
    {
      src: path.join(brainDir, 'linocut_kunst_exhibition_1787739436420.jpg'),
      targets: [
        path.join(illustrationsDir, 'linocut-kunst.webp'),
        path.join(postersDir, 'poster-kunst.webp'),
        path.join(postersDir, 'linocut-kunst.webp'),
        path.join(eventsDir, 'linocut-kunst.webp'),
      ]
    },
    {
      src: path.join(brainDir, 'linocut_kinder_familie_1787739450794.jpg'),
      targets: [
        path.join(illustrationsDir, 'linocut-kinder.webp'),
        path.join(postersDir, 'poster-familie.webp'),
        path.join(postersDir, 'linocut-kinder.webp'),
        path.join(eventsDir, 'linocut-kinder.webp'),
      ]
    },
    {
      src: path.join(brainDir, 'linocut_film_kino_1787739466064.jpg'),
      targets: [
        path.join(illustrationsDir, 'linocut-film.webp'),
        path.join(postersDir, 'poster-film.webp'),
        path.join(postersDir, 'linocut-film.webp'),
        path.join(eventsDir, 'linocut-film.webp'),
      ]
    },
  ];

  for (const item of linocutMap) {
    if (!fs.existsSync(item.src)) {
      console.error(`Source not found: ${item.src}`);
      continue;
    }
    const buffer = await sharp(item.src)
      .resize({ width: 640, height: 640, fit: 'cover' })
      .webp({ quality: 76, effort: 6 })
      .toBuffer();

    for (const target of item.targets) {
      fs.writeFileSync(target, buffer);
      const stats = fs.statSync(target);
      console.log(`Saved: ${target} (${stats.size} bytes = ${(stats.size / 1024).toFixed(1)} KB)`);
    }
  }
}

async function optimizeHeroPhotos() {
  console.log('\n--- Optimizing Hero Photos ---');
  const heroFiles = fs.readdirSync(heroDir);
  for (const file of heroFiles) {
    const filePath = path.join(heroDir, file);
    const stat = fs.statSync(filePath);
    
    // Check if > 115 KB
    if (stat.size > 115 * 1024) {
      console.log(`Optimizing oversized ${file} (${(stat.size / 1024).toFixed(1)} KB)...`);
      const ext = path.extname(file).toLowerCase();
      const meta = await sharp(filePath).metadata();
      let pipeline = sharp(filePath).resize({ width: Math.min(meta.width || 1100, 1100), withoutEnlargement: true });
      
      if (ext === '.avif') {
        pipeline = pipeline.avif({ quality: 68, effort: 4 });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 74, effort: 5 });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 76, mozjpeg: true });
      }
      
      const optimizedBuffer = await pipeline.toBuffer();
      fs.writeFileSync(filePath, optimizedBuffer);
      const newStat = fs.statSync(filePath);
      console.log(`Optimized ${file}: ${(stat.size / 1024).toFixed(1)} KB -> ${(newStat.size / 1024).toFixed(1)} KB`);
    }
  }
}

async function main() {
  try {
    await processKiez();
    await processLinocuts();
    await optimizeHeroPhotos();
    console.log('\nAll visual assets processed, converted to WebP/SVG, and optimized!');
  } catch (err) {
    console.error('Error processing assets:', err);
    process.exit(1);
  }
}

main();
