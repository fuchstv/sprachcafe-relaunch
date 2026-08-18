#!/usr/bin/env bash
set -euo pipefail

PUB="/home/ubuntu/sprachcafe-relaunch/frontend/public/images/events"
mkdir -p "$PUB"

cat << 'SVG' > "$PUB/pankow-event.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B263E"/>
      <stop offset="100%" stop-color="#4a121f"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#pGrad)"/>
  <circle cx="400" cy="190" r="120" fill="#ffffff" opacity="0.12"/>
  <text x="400" y="195" font-family="system-ui, sans-serif" font-size="56" font-weight="bold" fill="#ffffff" text-anchor="middle">☕ SprachCafé Pankow</text>
  <text x="400" y="250" font-family="system-ui, sans-serif" font-size="22" fill="#ff758f" text-anchor="middle">Schulzestraße 1 · S-Bhf Wollankstraße</text>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="16" fill="#ffffff" opacity="0.8" text-anchor="middle">Sprachrunden · Kultur · Begegnung</text>
</svg>
SVG

cat << 'SVG' > "$PUB/schoeneberg-event.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2b4c7e"/>
      <stop offset="100%" stop-color="#152744"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#sGrad)"/>
  <circle cx="400" cy="190" r="120" fill="#ffffff" opacity="0.12"/>
  <text x="400" y="195" font-family="system-ui, sans-serif" font-size="56" font-weight="bold" fill="#ffffff" text-anchor="middle">🏙️ SprachCafé Schöneberg</text>
  <text x="400" y="250" font-family="system-ui, sans-serif" font-size="22" fill="#90caf9" text-anchor="middle">Hauptstraße 121 A / Gotenstr. 45</text>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="16" fill="#ffffff" opacity="0.8" text-anchor="middle">Stadtteilzentrum &amp; KiezRaum</text>
</svg>
SVG

cat << 'SVG' > "$PUB/koepenick-event.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="kGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2e7d32"/>
      <stop offset="100%" stop-color="#1b4d1e"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#kGrad)"/>
  <circle cx="400" cy="190" r="120" fill="#ffffff" opacity="0.12"/>
  <text x="400" y="195" font-family="system-ui, sans-serif" font-size="56" font-weight="bold" fill="#ffffff" text-anchor="middle">🌳 SprachCafé Köpenick</text>
  <text x="400" y="250" font-family="system-ui, sans-serif" font-size="22" fill="#a5d6a7" text-anchor="middle">Am Wiesengraben 7a</text>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="16" fill="#ffffff" opacity="0.8" text-anchor="middle">Wiesentreff · Familien &amp; Sprachangebote</text>
</svg>
SVG

cat << 'SVG' > "$PUB/kinder-event.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="kdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e65100"/>
      <stop offset="100%" stop-color="#8c2500"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#kdGrad)"/>
  <circle cx="400" cy="190" r="120" fill="#ffffff" opacity="0.12"/>
  <text x="400" y="195" font-family="system-ui, sans-serif" font-size="54" font-weight="bold" fill="#ffffff" text-anchor="middle">🎈 SprachCafé für Kinder</text>
  <text x="400" y="250" font-family="system-ui, sans-serif" font-size="22" fill="#ffcc80" text-anchor="middle">Klub Malucha · Kreativwerkstatt · Vorlesen</text>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="16" fill="#ffffff" opacity="0.8" text-anchor="middle">Zweisprachige Frühförderung (PL/DE)</text>
</svg>
SVG

cat << 'SVG' > "$PUB/default-event.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B263E"/>
      <stop offset="100%" stop-color="#3d101a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#dGrad)"/>
  <circle cx="400" cy="190" r="120" fill="#ffffff" opacity="0.12"/>
  <text x="400" y="195" font-family="system-ui, sans-serif" font-size="54" font-weight="bold" fill="#ffffff" text-anchor="middle">✨ SprachCafé Polnisch</text>
  <text x="400" y="250" font-family="system-ui, sans-serif" font-size="22" fill="#ff758f" text-anchor="middle">Kultur · Sprache · Begegnung in Berlin</text>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="16" fill="#ffffff" opacity="0.8" text-anchor="middle">Offener Begegnungsort für Alle</text>
</svg>
SVG

echo "✓ Event SVG assets generated!"
