const fs = require('fs');
const path = require('path');

const stampsDir = path.join(__dirname, 'public/images/stamps');
const texturesDir = path.join(__dirname, 'public/images/textures');

if (!fs.existsSync(stampsDir)) fs.mkdirSync(stampsDir, { recursive: true });
if (!fs.existsSync(texturesDir)) fs.mkdirSync(texturesDir, { recursive: true });

// 1. stamp-verfuegbar.svg (Vintage green library ink stamp)
const stampVerfuegbarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90" width="240" height="90">
  <defs>
    <filter id="grunge-green" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <g transform="rotate(-4 120 45)" filter="url(#grunge-green)">
    <!-- Outer thick distressed border -->
    <rect x="6" y="6" width="228" height="78" rx="8" fill="none" stroke="#2D5A27" stroke-width="4.5" stroke-dasharray="32,2,18,1,40,3,15,2" opacity="0.9" />
    <!-- Inner thin border -->
    <rect x="12" y="12" width="216" height="66" rx="5" fill="none" stroke="#2D5A27" stroke-width="1.8" opacity="0.85" />
    
    <!-- Top label -->
    <text x="120" y="28" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="9" font-weight="800" fill="#2D5A27" text-anchor="middle" letter-spacing="3" opacity="0.9">
      HAUSBIBLIOTHEK • BERLIN
    </text>
    
    <!-- Main text -->
    <text x="120" y="56" font-family="'Literata', Georgia, serif" font-size="23" font-weight="900" fill="#2D5A27" text-anchor="middle" letter-spacing="3.5" opacity="0.95">
      ✓ VERFÜGBAR
    </text>
    
    <!-- Bottom Polish subtitle -->
    <text x="120" y="71" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="9" font-weight="800" fill="#2D5A27" text-anchor="middle" letter-spacing="2.5" opacity="0.9">
      DOSTĘPNE W ZBIORACH
    </text>
    
    <!-- Ink speckles -->
    <circle cx="24" cy="24" r="1.5" fill="#2D5A27" opacity="0.7" />
    <circle cx="218" cy="68" r="1.2" fill="#2D5A27" opacity="0.6" />
    <circle cx="35" cy="70" r="1" fill="#2D5A27" opacity="0.5" />
    <circle cx="205" cy="22" r="1.6" fill="#2D5A27" opacity="0.65" />
  </g>
</svg>`;

// 2. stamp-ausgeliehen.svg (Vintage rose/carmine library ink stamp)
const stampAusgeliehenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90" width="240" height="90">
  <defs>
    <filter id="grunge-carmine" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <g transform="rotate(3 120 45)" filter="url(#grunge-carmine)">
    <!-- Outer thick distressed border -->
    <rect x="6" y="6" width="228" height="78" rx="8" fill="none" stroke="#8B1E2D" stroke-width="4.5" stroke-dasharray="28,2,22,3,35,1,16,2" opacity="0.9" />
    <!-- Inner thin border -->
    <rect x="12" y="12" width="216" height="66" rx="5" fill="none" stroke="#8B1E2D" stroke-width="1.8" opacity="0.85" />
    
    <!-- Top label -->
    <text x="120" y="28" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="9" font-weight="800" fill="#8B1E2D" text-anchor="middle" letter-spacing="3" opacity="0.9">
      HAUSBIBLIOTHEK • BERLIN
    </text>
    
    <!-- Main text -->
    <text x="120" y="56" font-family="'Literata', Georgia, serif" font-size="21" font-weight="900" fill="#8B1E2D" text-anchor="middle" letter-spacing="3" opacity="0.95">
      AUSGELIEHEN
    </text>
    
    <!-- Bottom Polish subtitle -->
    <text x="120" y="71" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="9" font-weight="800" fill="#8B1E2D" text-anchor="middle" letter-spacing="2.5" opacity="0.9">
      WYPOŻYCZONE • VORMERKEN
    </text>
    
    <!-- Ink speckles -->
    <circle cx="28" cy="65" r="1.5" fill="#8B1E2D" opacity="0.7" />
    <circle cx="212" cy="25" r="1.3" fill="#8B1E2D" opacity="0.6" />
    <circle cx="45" cy="20" r="1" fill="#8B1E2D" opacity="0.5" />
    <circle cx="195" cy="68" r="1.6" fill="#8B1E2D" opacity="0.65" />
  </g>
</svg>`;

// 3. stamp-sprachcafe-seal.svg (Circular Polish Poster School seal watermark)
const stampSprachcafeSealSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <filter id="seal-grunge" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <path id="circle-top" d="M 30,100 A 70,70 0 1,1 170,100" />
    <path id="circle-bottom" d="M 170,100 A 70,70 0 0,1 30,100" />
    <path id="circle-inner-top" d="M 45,100 A 55,55 0 1,1 155,100" />
  </defs>
  
  <g filter="url(#seal-grunge)">
    <!-- Outer dashed circular ring -->
    <circle cx="100" cy="100" r="92" fill="none" stroke="#8B1E2D" stroke-width="3" stroke-dasharray="8,4" opacity="0.85" />
    <!-- Middle solid ring -->
    <circle cx="100" cy="100" r="84" fill="none" stroke="#8B1E2D" stroke-width="1.5" opacity="0.8" />
    <!-- Inner solid ring -->
    <circle cx="100" cy="100" r="58" fill="none" stroke="#8B1E2D" stroke-width="1.8" opacity="0.85" />
    
    <!-- Top Arc Text: SPRACHCAFÉ POLNISCH • BERLIN -->
    <text font-family="'Literata', Georgia, serif" font-size="10.5" font-weight="900" fill="#8B1E2D" letter-spacing="3" opacity="0.9">
      <textPath href="#circle-top" startOffset="50%" text-anchor="middle">
        SPRACHCAFÉ POLNISCH • BERLIN
      </textPath>
    </text>
    
    <!-- Bottom Arc Text: BIBLIOTEKA DOMOWA • 2013 -->
    <text font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="800" fill="#8B1E2D" letter-spacing="2.8" opacity="0.85">
      <textPath href="#circle-bottom" startOffset="50%" text-anchor="middle">
        ★ BIBLIOTEKA DOMOWA ★
      </textPath>
    </text>
    
    <!-- Center Icon: Coffee Cup & Open Book & Star -->
    <g transform="translate(100 96) scale(0.9)" fill="#8B1E2D" opacity="0.9">
      <!-- Steam lines -->
      <path d="M -8,-24 Q -12,-32 -7,-38 M 0,-26 Q 4,-34 0,-40 M 8,-24 Q 12,-32 7,-38" fill="none" stroke="#8B1E2D" stroke-width="2" stroke-linecap="round" />
      <!-- Coffee Cup -->
      <path d="M -16,-18 L 16,-18 C 15,-4 12,2 0,2 C -12,2 -15,-4 -16,-18 Z" />
      <path d="M 16,-14 Q 24,-14 24,-8 Q 24,-2 14,-2" fill="none" stroke="#8B1E2D" stroke-width="2.5" />
      <!-- Saucer / Open Book base -->
      <path d="M -24,5 Q 0,1 24,5 Q 16,10 0,9 Q -16,10 -24,5 Z" />
      <!-- Book pages below -->
      <path d="M -22,12 Q -11,8 0,11 Q 11,8 22,12 L 20,18 Q 10,14 0,17 Q -10,14 -20,18 Z" />
    </g>
    
    <!-- Date established -->
    <text x="100" y="142" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="800" fill="#8B1E2D" text-anchor="middle" letter-spacing="2" opacity="0.85">
      SEIT 2013 • E.V.
    </text>
    
    <!-- Stars -->
    <text x="32" y="103" font-size="10" fill="#8B1E2D" opacity="0.8">★</text>
    <text x="160" y="103" font-size="10" fill="#8B1E2D" opacity="0.8">★</text>
  </g>
</svg>`;

// 4. texture-torn-paper.svg (Torn paper edge mask/pattern)
const textureTornPaperSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 80" width="1200" height="80" preserveAspectRatio="none">
  <defs>
    <!-- Paper shadow -->
    <filter id="torn-shadow" x="-5%" y="-10%" width="110%" height="150%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2A2421" flood-opacity="0.15" />
    </filter>
  </defs>
  
  <!-- Subtle fiber underlayer -->
  <path d="M 0,0 L 1200,0 L 1200,45
    Q 1180,48 1160,43 T 1120,47 T 1080,42 T 1040,48 T 1000,43 T 960,47 T 920,42
    T 880,48 T 840,43 T 800,47 T 760,42 T 720,48 T 680,43 T 640,47 T 600,42
    T 560,48 T 520,43 T 480,47 T 440,42 T 400,48 T 360,43 T 320,47 T 280,42
    T 240,48 T 200,43 T 160,47 T 120,42 T 80,48 T 40,43 T 0,46 Z"
    fill="#E8DFC8" opacity="0.7" />
    
  <!-- Main torn paper body -->
  <path d="M 0,0 L 1200,0 L 1200,38
    C 1190,41 1185,35 1175,39 C 1165,43 1158,36 1148,40 C 1138,44 1130,37 1120,41
    C 1110,45 1102,38 1092,42 C 1082,46 1075,39 1065,43 C 1055,47 1048,40 1038,44
    C 1028,48 1020,41 1010,45 C 1000,49 992,42 982,46 C 972,50 965,43 955,47
    C 945,51 938,44 928,48 C 918,52 910,45 900,49 C 890,53 882,46 872,50
    C 862,54 855,47 845,51 C 835,55 828,48 818,52 C 808,56 800,49 790,53
    C 780,57 772,50 762,54 C 752,58 745,51 735,55 C 725,59 718,52 708,56
    C 698,60 690,53 680,57 C 670,61 662,54 652,58 C 642,62 635,55 625,59
    C 615,63 608,56 598,60 C 588,64 580,57 570,61 C 560,65 552,58 542,62
    C 532,66 525,59 515,63 C 505,67 498,60 488,64 C 478,68 470,61 460,65
    C 450,69 442,62 432,66 C 422,70 415,63 405,67 C 395,71 388,64 378,68
    C 368,72 360,65 350,69 C 340,73 332,66 322,70 C 312,74 305,67 295,71
    C 285,75 278,68 268,72 C 258,76 250,69 240,73 C 230,77 222,70 212,74
    C 202,78 195,71 185,75 C 175,79 168,72 158,76 C 148,80 140,73 130,77
    C 120,81 112,74 102,78 C 92,82 85,75 75,79 C 65,83 58,76 48,80
    C 38,84 30,77 20,81 C 10,85 5,78 0,80 Z"
    fill="#FAF6EE" filter="url(#torn-shadow)" />
</svg>`;

// 5. texture-ticket-perforation.svg (Ticket perforation stub mask)
const textureTicketPerforationSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 400" width="60" height="400">
  <defs>
    <pattern id="notch-dots" x="0" y="0" width="10" height="16" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="8" r="2" fill="#FAF6EE" opacity="0.9" />
    </pattern>
  </defs>
  
  <!-- Left ticket notch (Top cutout) -->
  <path d="M 0,0 C 18,0 30,12 30,30 C 30,48 18,60 0,60 Z" fill="#181615" opacity="0.95" />
  
  <!-- Vertical perforated dashed line -->
  <line x1="30" y1="65" x2="30" y2="335" stroke="#C8BEB2" stroke-width="2.5" stroke-dasharray="6,6" opacity="0.8" />
  
  <!-- Left ticket notch (Bottom cutout) -->
  <path d="M 0,340 C 18,340 30,352 30,370 C 30,388 18,400 0,400 Z" fill="#181615" opacity="0.95" />
</svg>`;

// Decorative Polish Poster badges & cutouts
const polskaSzkolaBadgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 70" width="280" height="70">
  <rect x="4" y="4" width="272" height="62" rx="14" fill="#8B1E2D" stroke="#FAF6EE" stroke-width="2.5" />
  <rect x="8" y="8" width="264" height="54" rx="10" fill="none" stroke="#FAF6EE" stroke-width="1" stroke-dasharray="4,3" opacity="0.7" />
  <text x="140" y="32" font-family="'Literata', Georgia, serif" font-size="13" font-weight="900" fill="#FAF6EE" text-anchor="middle" letter-spacing="2">
    POLSKA SZKOŁA PLAKATU
  </text>
  <text x="140" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="800" fill="#FDE047" text-anchor="middle" letter-spacing="2">
    KULTUR • SPRACHE • BERLIN
  </text>
</svg>`;

// Write all files
const filesToWrite = [
  { dir: stampsDir, name: 'stamp-verfuegbar.svg', content: stampVerfuegbarSvg },
  { dir: stampsDir, name: 'stamp-ausgeliehen.svg', content: stampAusgeliehenSvg },
  { dir: stampsDir, name: 'stamp-sprachcafe-seal.svg', content: stampSprachcafeSealSvg },
  { dir: stampsDir, name: 'texture-torn-paper.svg', content: textureTornPaperSvg },
  { dir: stampsDir, name: 'texture-ticket-perforation.svg', content: textureTicketPerforationSvg },
  
  // Mirror to textures dir
  { dir: texturesDir, name: 'stamp-verfuegbar.svg', content: stampVerfuegbarSvg },
  { dir: texturesDir, name: 'stamp-ausgeliehen.svg', content: stampAusgeliehenSvg },
  { dir: texturesDir, name: 'stamp-sprachcafe-seal.svg', content: stampSprachcafeSealSvg },
  { dir: texturesDir, name: 'stamp-sprachcafe.svg', content: stampSprachcafeSealSvg },
  { dir: texturesDir, name: 'texture-torn-paper.svg', content: textureTornPaperSvg },
  { dir: texturesDir, name: 'torn-edge-bottom.svg', content: textureTornPaperSvg },
  { dir: texturesDir, name: 'texture-ticket-perforation.svg', content: textureTicketPerforationSvg },
  { dir: texturesDir, name: 'ticket-cutout.svg', content: textureTicketPerforationSvg },
  { dir: texturesDir, name: 'polska-szkola-badge.svg', content: polskaSzkolaBadgeSvg },
];

for (const item of filesToWrite) {
  const filePath = path.join(item.dir, item.name);
  fs.writeFileSync(filePath, item.content.trim(), 'utf8');
  console.log(`Generated: ${filePath} (${fs.statSync(filePath).size} bytes)`);
}

console.log('All stamp and texture SVGs generated successfully!');
