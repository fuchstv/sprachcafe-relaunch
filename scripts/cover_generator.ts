import fs from 'fs';
import path from 'path';

export interface RawBook {
  id: string;
  category: string;
  author: string;
  title: string;
  publication_year: string;
  publisher: string;
  isbn: string;
  signature: string;
  location: string;
  availability_status: string;
}

export function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateSvgCover(book: RawBook): string {
  const category = (book.category || '').toLowerCase();
  
  let bgGradient = ['#8B1E2D', '#54101B']; // Default Deep Burgundy
  let accentColor = '#D4AF37'; // Gold
  let tagColor = 'rgba(255, 255, 255, 0.15)';
  let categoryLabel = 'Literatura Polska';

  if (category.includes('deutsch') || category.includes('de')) {
    bgGradient = ['#2F4428', '#1A2916']; // Forest green
    accentColor = '#C8D6AF';
    categoryLabel = 'Auf Deutsch';
  } else if (category.includes('dzieci') || category.includes('mlodz')) {
    bgGradient = ['#026C8F', '#013D52']; // Warm Teal / Sky
    accentColor = '#90E0EF';
    categoryLabel = 'Dla Dzieci & Młodzieży';
  } else if (category.includes('biograf') || category.includes('fakt')) {
    bgGradient = ['#8B5A2B', '#523417']; // Warm Amber / Bronze
    accentColor = '#E9C46A';
    categoryLabel = 'Biografie & Wspomnienia';
  } else if (category.includes('kryminal') || category.includes('sensac')) {
    bgGradient = ['#2C3539', '#15191B']; // Charcoal / Noir
    accentColor = '#E63946';
    categoryLabel = 'Kryminał & Sensacja';
  } else if (category.includes('poezja')) {
    bgGradient = ['#6A3870', '#3D1C42']; // Violet / Poetry
    accentColor = '#E0AAFF';
    categoryLabel = 'Poezja & Dramat';
  } else if (category.includes('report') || category.includes('historia')) {
    bgGradient = ['#5C4033', '#32231B']; // Deep Sepia
    accentColor = '#DDA15E';
    categoryLabel = 'Historia & Reportaż';
  }

  // Word wrap title for SVG
  const words = (book.title || 'Książka').split(' ');
  const titleLines: string[] = [];
  let currentLine = '';
  for (const w of words) {
    if ((currentLine + ' ' + w).trim().length > 20) {
      if (currentLine) titleLines.push(currentLine.trim());
      currentLine = w;
    } else {
      currentLine += (currentLine ? ' ' : '') + w;
    }
  }
  if (currentLine) titleLines.push(currentLine.trim());
  const maxTitleLines = titleLines.slice(0, 4);

  const titleSvgElements = maxTitleLines.map((line, idx) => {
    const yPos = 380 + (idx * 44);
    return `<text x="300" y="${yPos}" text-anchor="middle" fill="#FAF5EB" font-family="'Georgia', 'Literata', serif" font-size="30" font-weight="700" letter-spacing="-0.3">${escapeHtml(line)}</text>`;
  }).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850" width="600" height="850">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}"/>
      <stop offset="100%" stop-color="${bgGradient[1]}"/>
    </linearGradient>
    <pattern id="linen" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.03)" />
      <circle cx="12" cy="12" r="1" fill="rgba(255,255,255,0.03)" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="600" height="850" fill="url(#bg)"/>
  <rect width="600" height="850" fill="url(#linen)"/>

  <!-- Outer Frame -->
  <rect x="30" y="30" width="540" height="790" rx="12" fill="none" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.4"/>
  <rect x="42" y="42" width="516" height="766" rx="8" fill="none" stroke="${accentColor}" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="6,4"/>

  <!-- Top Emblem / Library Brand -->
  <g transform="translate(300, 110)">
    <circle cx="0" cy="0" r="32" fill="${tagColor}" stroke="${accentColor}" stroke-width="1.5" stroke-opacity="0.6"/>
    <text x="0" y="9" text-anchor="middle" font-size="28">📖</text>
  </g>
  <text x="300" y="175" text-anchor="middle" fill="${accentColor}" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="3">HAUSBIBLIOTHEK SPRACHCAFÉ</text>
  <text x="300" y="195" text-anchor="middle" fill="#FAF5EB" fill-opacity="0.7" font-family="sans-serif" font-size="11" letter-spacing="1.5">BERLIN-PANKOW</text>

  <!-- Category Tag -->
  <rect x="180" y="235" width="240" height="32" rx="16" fill="${tagColor}" stroke="${accentColor}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="300" y="256" text-anchor="middle" fill="#FAF5EB" font-family="sans-serif" font-size="12" font-weight="600" letter-spacing="0.5">${escapeHtml(categoryLabel)}</text>

  <!-- Author Section -->
  <text x="300" y="325" text-anchor="middle" fill="${accentColor}" font-family="sans-serif" font-size="18" font-weight="600" letter-spacing="1">${escapeHtml(book.author || 'Autor')}</text>

  <!-- Title Section -->
  <g>
    ${titleSvgElements}
  </g>

  <!-- Divider Line -->
  <line x1="200" y1="580" x2="400" y2="580" stroke="${accentColor}" stroke-width="1.5" stroke-opacity="0.5"/>
  <polygon points="300,576 304,580 300,584 296,580" fill="${accentColor}"/>

  <!-- Publication Details Bottom -->
  <g transform="translate(300, 680)">
    <text x="0" y="0" text-anchor="middle" fill="#FAF5EB" fill-opacity="0.9" font-family="sans-serif" font-size="14" font-weight="500">${escapeHtml(book.publisher || 'SprachCafé Polnisch')}${book.publication_year ? ` (${escapeHtml(book.publication_year)})` : ''}</text>
    ${book.signature ? `<text x="0" y="28" text-anchor="middle" fill="${accentColor}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1">Sygnatura: ${escapeHtml(book.signature)}</text>` : ''}
    ${book.isbn ? `<text x="0" y="52" text-anchor="middle" fill="#FAF5EB" fill-opacity="0.6" font-family="monospace" font-size="11">ISBN: ${escapeHtml(book.isbn)}</text>` : ''}
  </g>

</svg>`;
}
