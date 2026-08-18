#!/usr/bin/env bash
set -euo pipefail

PUB="/home/ubuntu/sprachcafe-relaunch/frontend/public/images"

# 1. Locations
cat << 'SVG' > "$PUB/locations/pankow.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="pankowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B263E"/>
      <stop offset="100%" stop-color="#4a121f"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#pankowGrad)"/>
  <circle cx="400" cy="220" r="140" fill="#ffffff" opacity="0.1"/>
  <path d="M320,320 L400,160 L480,320 Z" fill="#ffffff" opacity="0.2"/>
  <text x="400" y="240" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">☕ Pankow</text>
  <text x="400" y="290" font-family="system-ui, sans-serif" font-size="24" fill="#ffffff" opacity="0.9" text-anchor="middle">Schulzestraße 1 · S-Bhf Wollankstraße</text>
  <text x="400" y="340" font-family="system-ui, sans-serif" font-size="18" fill="#ff758f" text-anchor="middle">Hauptstandort · Hausbibliothek · Café</text>
</svg>
SVG

cat << 'SVG' > "$PUB/locations/schoeneberg.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="sbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2b4c7e"/>
      <stop offset="100%" stop-color="#152744"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sbGrad)"/>
  <circle cx="400" cy="220" r="140" fill="#ffffff" opacity="0.1"/>
  <text x="400" y="240" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">🏙️ Schöneberg</text>
  <text x="400" y="290" font-family="system-ui, sans-serif" font-size="24" fill="#ffffff" opacity="0.9" text-anchor="middle">Hauptstraße 121 A / Gotenstr. 45</text>
  <text x="400" y="340" font-family="system-ui, sans-serif" font-size="18" fill="#90caf9" text-anchor="middle">Stadtteilzentrum & KiezRaum</text>
</svg>
SVG

cat << 'SVG' > "$PUB/locations/koepenick.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="kpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2e7d32"/>
      <stop offset="100%" stop-color="#1b4d1e"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#kpGrad)"/>
  <circle cx="400" cy="220" r="140" fill="#ffffff" opacity="0.1"/>
  <text x="400" y="240" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">🌳 Köpenick</text>
  <text x="400" y="290" font-family="system-ui, sans-serif" font-size="24" fill="#ffffff" opacity="0.9" text-anchor="middle">Am Wiesengraben 7a</text>
  <text x="400" y="340" font-family="system-ui, sans-serif" font-size="18" fill="#a5d6a7" text-anchor="middle">Wiesentreff · Familien & Sprachangebote</text>
</svg>
SVG

# 2. Shop Items
cat << 'SVG' > "$PUB/shop/tshirt-adult.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#fdfaf9"/>
  <path d="M180,160 L240,120 L300,150 L360,120 L420,160 L380,240 L340,220 L340,480 L260,480 L260,220 L220,240 Z" fill="#8B263E"/>
  <circle cx="300" cy="280" r="40" fill="#ffffff" opacity="0.2"/>
  <text x="300" y="288" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">SCP</text>
  <text x="300" y="540" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#1d1b1a" text-anchor="middle">SprachCafé T-Shirt (Erwachsene)</text>
</svg>
SVG

cat << 'SVG' > "$PUB/shop/tshirt-kids.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#fdfaf9"/>
  <path d="M200,180 L250,140 L300,170 L350,140 L400,180 L370,240 L335,225 L335,450 L265,450 L265,225 L230,240 Z" fill="#e65100"/>
  <text x="300" y="295" font-family="system-ui, sans-serif" font-size="36" text-anchor="middle">🎈</text>
  <text x="300" y="530" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#1d1b1a" text-anchor="middle">SprachCafé Kinder-Shirt</text>
</svg>
SVG

cat << 'SVG' > "$PUB/shop/tote-bag.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#fdfaf9"/>
  <path d="M250,140 C250,90 350,90 350,140 L350,220 L250,220 Z" fill="none" stroke="#8B263E" stroke-width="12"/>
  <rect x="200" y="220" width="200" height="240" rx="16" fill="#f3e8e2" stroke="#8B263E" stroke-width="8"/>
  <text x="300" y="330" font-family="system-ui, sans-serif" font-size="44" text-anchor="middle">📚</text>
  <text x="300" y="375" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#8B263E" text-anchor="middle">SprachCafé Polnisch</text>
  <text x="300" y="530" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#1d1b1a" text-anchor="middle">Bio-Baumwolltasche</text>
</svg>
SVG

cat << 'SVG' > "$PUB/shop/speak-dating-cards.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#fdfaf9"/>
  <rect x="180" y="160" width="180" height="260" rx="16" fill="#8B263E" transform="rotate(-10 270 290)"/>
  <rect x="240" y="160" width="180" height="260" rx="16" fill="#ffffff" stroke="#8B263E" stroke-width="6" transform="rotate(8 330 290)"/>
  <text x="330" y="270" font-family="system-ui, sans-serif" font-size="36" text-anchor="middle">💬</text>
  <text x="330" y="320" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#8B263E" text-anchor="middle">Speak Dating</text>
  <text x="330" y="345" font-family="system-ui, sans-serif" font-size="12" fill="#5b403d" text-anchor="middle">Konversationskarten</text>
  <text x="300" y="530" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#1d1b1a" text-anchor="middle">Speak-Dating Kartenset (DE/PL)</text>
</svg>
SVG

# 3. Exhibitions
cat << 'SVG' > "$PUB/exhibitions/mutige-frauen.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="ex1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a154b"/>
      <stop offset="100%" stop-color="#1f0720"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#ex1Grad)"/>
  <circle cx="400" cy="240" r="160" fill="#ff758f" opacity="0.15"/>
  <text x="400" y="240" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle">Mutige Frauen</text>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="24" fill="#ff758f" text-anchor="middle">Anna Krenz &amp; Ewa Maria Slaska</text>
  <text x="400" y="350" font-family="system-ui, sans-serif" font-size="18" fill="#ffffff" opacity="0.8" text-anchor="middle">Porträts &amp; Lebenswege außergewöhnlicher Frauen</text>
</svg>
SVG

cat << 'SVG' > "$PUB/exhibitions/stillen-in-berlin.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="ex2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2d3748"/>
      <stop offset="100%" stop-color="#1a202c"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#ex2Grad)"/>
  <circle cx="400" cy="240" r="160" fill="#63b3ed" opacity="0.15"/>
  <text x="400" y="240" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle">#Stilleninberlin</text>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="24" fill="#90cdf4" text-anchor="middle">Marta Wilk Photography</text>
  <text x="400" y="350" font-family="system-ui, sans-serif" font-size="18" fill="#ffffff" opacity="0.8" text-anchor="middle">Fotokunst über Mutterschaft und Stadtleben</text>
</svg>
SVG

cat << 'SVG' > "$PUB/exhibitions/sciezki.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="ex3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#744210"/>
      <stop offset="100%" stop-color="#442408"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#ex3Grad)"/>
  <circle cx="400" cy="240" r="160" fill="#f6e05e" opacity="0.15"/>
  <text x="400" y="240" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle">Ścieżki / Pfade</text>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="24" fill="#faf089" text-anchor="middle">Olga Basole</text>
  <text x="400" y="350" font-family="system-ui, sans-serif" font-size="18" fill="#ffffff" opacity="0.8" text-anchor="middle">Abstrakte Malerei und Farblandschaften</text>
</svg>
SVG

# 4. Default Team Avatar
cat << 'SVG' > "$PUB/team/avatar-default.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="100" fill="#f2e7e4"/>
  <circle cx="100" cy="75" r="40" fill="#8B263E" opacity="0.8"/>
  <path d="M30,180 C30,130 70,120 100,120 C130,120 170,130 170,180 Z" fill="#8B263E" opacity="0.8"/>
</svg>
SVG

# 5. Default Event
cat << 'SVG' > "$PUB/events/default-event.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="evGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B263E"/>
      <stop offset="100%" stop-color="#551221"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#evGrad)"/>
  <circle cx="400" cy="220" r="130" fill="#ffffff" opacity="0.1"/>
  <text x="400" y="230" font-family="system-ui, sans-serif" font-size="54" font-weight="bold" fill="#ffffff" text-anchor="middle">SprachCafé Polnisch</text>
  <text x="400" y="290" font-family="system-ui, sans-serif" font-size="24" fill="#ff758f" text-anchor="middle">Kultur · Sprache · Begegnung</text>
</svg>
SVG

echo "✓ Vector assets successfully generated!"
