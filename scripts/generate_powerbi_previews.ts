#!/usr/bin/env npx tsx
/**
 * SprachCafé Polnisch e.V. - Power BI Web Dashboard & PDF Export Generator
 * 
 * Generates standalone, pixel-perfect 16:9 interactive reports:
 * 1. Sponsoren & Förderer Wirkungsbericht (External Presentation & PDF/PPT Export)
 * 2. Internes Monitoring & Detail-Analyse (Internal Management Dashboard)
 */

import fs from 'fs';
import path from 'path';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const REPORTS_OUTPUT_DIR = path.resolve(scriptDir, '../frontend/public/reports');
const KPI_CSV_PATH = path.resolve(scriptDir, 'kpi_exports/Veranstaltungs_Kennzahlen.csv');

if (!fs.existsSync(REPORTS_OUTPUT_DIR)) {
  fs.mkdirSync(REPORTS_OUTPUT_DIR, { recursive: true });
}

// Read CSV data
const csvRaw = fs.readFileSync(KPI_CSV_PATH, 'utf-8').replace(/^\uFEFF/, '');
const lines = csvRaw.split('\n').filter(Boolean);
const header = lines[0].split(',');
const rows = lines.slice(1).map(l => {
  const parts = l.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
  return {
    jahrMonat: (parts[0] || '').replace(/"/g, ''),
    jahr: parseInt(parts[1] || '2026', 10),
    monatNum: parseInt(parts[2] || '1', 10),
    monatName: (parts[3] || '').replace(/"/g, ''),
    standortCode: (parts[4] || '').replace(/"/g, ''),
    standortName: (parts[5] || '').replace(/"/g, ''),
    sprache: (parts[6] || '').replace(/"/g, ''),
    zielgruppe: (parts[7] || '').replace(/"/g, ''),
    kategorie: (parts[8] || '').replace(/"/g, ''),
    projekt: (parts[9] || '').replace(/"/g, ''),
    anzahl: parseInt(parts[10] || '0', 10)
  };
});

// Calculate Key Metrics
const totalEvents = rows.reduce((sum, r) => sum + r.anzahl, 0);
const kinderEvents = rows.filter(r => r.kategorie === 'Kinder & Familie').reduce((sum, r) => sum + r.anzahl, 0);
const sprachpraxisEvents = rows.filter(r => r.kategorie === 'Sprachpraxis & Tandem').reduce((sum, r) => sum + r.anzahl, 0);
const kulturEvents = rows.filter(r => r.kategorie === 'Kunst, Kultur & Literatur').reduce((sum, r) => sum + r.anzahl, 0);
const uniqueLocations = new Set(rows.map(r => r.standortCode)).size;
const uniqueMonths = new Set(rows.map(r => r.jahrMonat)).size;
const avgPerMonth = (totalEvents / (uniqueMonths || 1)).toFixed(1);

// Aggregations by Location
const byLocation: Record<string, number> = {};
rows.forEach(r => {
  byLocation[r.standortName] = (byLocation[r.standortName] || 0) + r.anzahl;
});

// Aggregations by Category
const byCategory: Record<string, number> = {};
rows.forEach(r => {
  byCategory[r.kategorie] = (byCategory[r.kategorie] || 0) + r.anzahl;
});

// Aggregations by Target Audience
const byAudience: Record<string, number> = {};
rows.forEach(r => {
  byAudience[r.zielgruppe] = (byAudience[r.zielgruppe] || 0) + r.anzahl;
});

// ==============================================================================
// 1. SPONSOREN & FÖRDERER WIRKUNGSBERICHT (Schlank, für externe Weitergabe)
// ==============================================================================
const sponsorHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SprachCafé Polnisch e.V. — Sponsoren & Förderer Wirkungsbericht</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: landscape; margin: 8mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-[#f5f0ee] text-[#1d1b1a] p-4 md:p-8 font-sans antialiased">
  <div class="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-[#e7e1df] p-8 md:p-12 space-y-8">
    
    <!-- Top Action Bar (Print / Export) -->
    <div class="flex justify-between items-center no-print pb-4 border-b border-[#e7e1df]">
      <div class="flex items-center gap-2 text-sm text-[#5b403d]">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#8B263E]"></span>
        <strong>Power BI Export-Ansicht:</strong> Speziell aufbereitet für Sponsoren & Förderanträge
      </div>
      <div class="flex gap-3">
        <a href="/reports/internes-monitoring.html" class="px-4 py-2 text-xs font-bold rounded-xl border border-[#8B263E] text-[#8B263E] hover:bg-[#8B263E]/10 transition-colors">
          🔍 Zur Internen Detailansicht
        </a>
        <button onclick="window.print()" class="px-5 py-2 text-xs font-bold text-white bg-[#8B263E] hover:bg-[#721f32] rounded-xl shadow-md transition-colors flex items-center gap-2">
          🖨️ Als PDF / Druck exportieren
        </button>
      </div>
    </div>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8B263E]/10 text-[#8B263E] mb-2">
          Offizieller Wirkungsbericht • Berichtsperiode 2026
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-[#1d1b1a] tracking-tight">
          Polska Kafejka Językowa – SprachCafé Polnisch e.V.
        </h1>
        <p class="text-sm text-[#5b403d] mt-1">
          Zweisprachige Bildungs-, Kultur- und Integrationsangebote in Berlin
        </p>
      </div>
      <div class="text-right text-xs text-[#5b403d] hidden md:block">
        <p class="font-bold text-[#1d1b1a]">SprachCafé Polnisch e.V.</p>
        <p>Schulzestraße 1, 13187 Berlin</p>
        <p class="text-[#8B263E] font-semibold">www.sprachcafe-polnisch.org</p>
      </div>
    </div>

    <!-- 4 Big Impact KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-6 rounded-2xl bg-[#fdfaf9] border border-[#e7e1df] shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-[#5b403d]">Veranstaltungen</p>
        <p class="text-3xl md:text-4xl font-extrabold text-[#8B263E] mt-2">${totalEvents}</p>
        <p class="text-xs text-[#5b403d] mt-1">geplante & durchgeführte Termine</p>
      </div>
      <div class="p-6 rounded-2xl bg-[#fdfaf9] border border-[#e7e1df] shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-[#5b403d]">Zweisprachigkeit</p>
        <p class="text-3xl md:text-4xl font-extrabold text-[#2B7A78] mt-2">100 %</p>
        <p class="text-xs text-[#5b403d] mt-1">bilinguale Angebote (PL / DE)</p>
      </div>
      <div class="p-6 rounded-2xl bg-[#fdfaf9] border border-[#e7e1df] shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-[#5b403d]">Regionale Standorte</p>
        <p class="text-3xl md:text-4xl font-extrabold text-[#D4A373] mt-2">${uniqueLocations}</p>
        <p class="text-xs text-[#5b403d] mt-1">Bezirke & Partnerorte</p>
      </div>
      <div class="p-6 rounded-2xl bg-[#fdfaf9] border border-[#e7e1df] shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-[#5b403d]">Monatliche Reichweite</p>
        <p class="text-3xl md:text-4xl font-extrabold text-[#8B263E] mt-2">&gt; 2.500</p>
        <p class="text-xs text-[#5b403d] mt-1">Website- & Community-Kontakte</p>
      </div>
    </div>

    <!-- Charts & Breakdown Grids -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <!-- Standorte Breakdown -->
      <div class="p-6 rounded-2xl bg-white border border-[#e7e1df] shadow-sm space-y-4">
        <h3 class="font-bold text-base text-[#1d1b1a] flex items-center gap-2">
          📍 Veranstaltungsdichte nach Standort
        </h3>
        <div class="space-y-3">
          ${Object.entries(byLocation).map(([loc, count]) => {
            const pct = Math.round((count / totalEvents) * 100);
            return `
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span>${loc}</span>
                  <span class="text-[#8B263E]">${count} Events (${pct}%)</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-[#f0e8e6] overflow-hidden">
                  <div class="h-full bg-[#8B263E] rounded-full" style="width: ${pct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Zielgruppen & Themen Breakdown -->
      <div class="p-6 rounded-2xl bg-white border border-[#e7e1df] shadow-sm space-y-4">
        <h3 class="font-bold text-base text-[#1d1b1a] flex items-center gap-2">
          🎯 Programmschwerpunkte & Zielgruppen
        </h3>
        <div class="space-y-3">
          ${Object.entries(byCategory).map(([cat, count]) => {
            const pct = Math.round((count / totalEvents) * 100);
            let color = '#8B263E';
            if (cat.includes('Kinder')) color = '#D4A373';
            if (cat.includes('Sprachpraxis')) color = '#2B7A78';
            if (cat.includes('Kultur')) color = '#E76F51';
            return `
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span>${cat}</span>
                  <span class="font-bold" style="color: ${color}">${count} Events (${pct}%)</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-[#f0e8e6] overflow-hidden">
                  <div class="h-full rounded-full" style="width: ${pct}%; background-color: ${color};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>

    <!-- Sponsor Info & Governance Card -->
    <div class="p-6 rounded-2xl bg-[#fdfaf9] border border-[#e7e1df] text-xs text-[#5b403d] leading-relaxed space-y-2">
      <p class="font-bold text-[#1d1b1a] text-sm">💡 Über den SprachCafé Polnisch e.V.</p>
      <p>
        Der Verein engagiert sich seit 2012 als anerkannter gemeinnütziger Träger für interkulturellen Austausch, Mehrsprachigkeit und Teilhabe in Berlin. Alle Angebote sind niedrigschwellig, barrierearm und familienfreundlich konzipiert.
      </p>
      <div class="pt-2 flex flex-wrap justify-between items-center gap-2 border-t border-[#e7e1df] text-[11px]">
        <span>Transparenz & Datenschutz: 100% DSGVO-konform • Zero-Tracking Webportal</span>
        <span>Auskunft & Projektkoordination: <strong>kontakt@sprachcafe-polnisch.org</strong></span>
      </div>
    </div>

  </div>
</body>
</html>
`;

// ==============================================================================
// 2. INTERNES MONITORING & DETAIL-ANALYSE (Für Vorstand & Projektleiter)
// ==============================================================================
const internalHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SprachCafé Polnisch e.V. — Internes Monitoring & Detail-Analyse</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: landscape; margin: 8mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-[#f5f0ee] text-[#1d1b1a] p-4 md:p-8 font-sans antialiased">
  <div class="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-[#e7e1df] p-6 md:p-10 space-y-6">
    
    <!-- Top Action Bar -->
    <div class="flex justify-between items-center no-print pb-4 border-b border-[#e7e1df]">
      <div class="flex items-center gap-2 text-sm text-[#5b403d]">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#2B7A78]"></span>
        <strong>Internes Vorstands- & Controlling-Dashboard</strong> (Power BI Modell)
      </div>
      <div class="flex gap-3">
        <a href="/reports/sponsoren-wirkungsbericht.html" class="px-4 py-2 text-xs font-bold rounded-xl border border-[#8B263E] text-[#8B263E] hover:bg-[#8B263E]/10 transition-colors">
          🌟 Zum Sponsoren-Wirkungsbericht
        </a>
        <button onclick="window.print()" class="px-5 py-2 text-xs font-bold text-white bg-[#8B263E] hover:bg-[#721f32] rounded-xl shadow-md transition-colors flex items-center gap-2">
          🖨️ Drucken / PDF Export
        </button>
      </div>
    </div>

    <!-- Header Section -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-extrabold text-[#1d1b1a]">
          📊 Internes Monitoring: Veranstaltungs- & Steuerungsdaten
        </h1>
        <p class="text-xs text-[#5b403d] mt-1">
          Datenbasis: Google Calendar Sync Engine • Stand: ${new Date().toLocaleDateString('de-DE')}
        </p>
      </div>
      <div class="text-right">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#2B7A78]/10 text-[#2B7A78]">
          ${totalEvents} Events / ${uniqueMonths} Monate erfasst
        </span>
      </div>
    </div>

    <!-- 6 Detailed KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
      <div class="p-4 rounded-xl bg-[#fdfaf9] border border-[#e7e1df]">
        <p class="text-[11px] font-bold text-[#5b403d] uppercase">Gesamt Events</p>
        <p class="text-2xl font-black text-[#8B263E] mt-1">${totalEvents}</p>
      </div>
      <div class="p-4 rounded-xl bg-[#fdfaf9] border border-[#e7e1df]">
        <p class="text-[11px] font-bold text-[#5b403d] uppercase">Kinder & Familie</p>
        <p class="text-2xl font-black text-[#D4A373] mt-1">${kinderEvents}</p>
      </div>
      <div class="p-4 rounded-xl bg-[#fdfaf9] border border-[#e7e1df]">
        <p class="text-[11px] font-bold text-[#5b403d] uppercase">Sprachpraxis</p>
        <p class="text-2xl font-black text-[#2B7A78] mt-1">${sprachpraxisEvents}</p>
      </div>
      <div class="p-4 rounded-xl bg-[#fdfaf9] border border-[#e7e1df]">
        <p class="text-[11px] font-bold text-[#5b403d] uppercase">Kultur & Literatur</p>
        <p class="text-2xl font-black text-[#E76F51] mt-1">${kulturEvents}</p>
      </div>
      <div class="p-4 rounded-xl bg-[#fdfaf9] border border-[#e7e1df]">
        <p class="text-[11px] font-bold text-[#5b403d] uppercase">Aktive Standorte</p>
        <p class="text-2xl font-black text-[#1d1b1a] mt-1">${uniqueLocations}</p>
      </div>
      <div class="p-4 rounded-xl bg-[#fdfaf9] border border-[#e7e1df]">
        <p class="text-[11px] font-bold text-[#5b403d] uppercase">Ø Events / Monat</p>
        <p class="text-2xl font-black text-[#8B263E] mt-1">${avgPerMonth}</p>
      </div>
    </div>

    <!-- Aggregation Table -->
    <div class="rounded-2xl border border-[#e7e1df] overflow-hidden">
      <div class="bg-[#f8f2f0] px-4 py-3 border-b border-[#e7e1df] flex justify-between items-center">
        <h3 class="font-bold text-sm text-[#1d1b1a]">📋 Aggregierte Kennzahlen-Matrix</h3>
        <span class="text-xs text-[#5b403d]">${rows.length} Aggregationszeilen</span>
      </div>
      <div class="overflow-x-auto max-h-96">
        <table class="w-full text-xs text-left border-collapse">
          <thead class="bg-[#f0e8e6] text-[#5b403d] font-bold sticky top-0">
            <tr>
              <th class="p-2.5">Monat</th>
              <th class="p-2.5">Standort</th>
              <th class="p-2.5">Zielgruppe</th>
              <th class="p-2.5">Kategorie</th>
              <th class="p-2.5">Projekt</th>
              <th class="p-2.5 text-right">Anzahl Events</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e7e1df]">
            ${rows.map((r, i) => `
              <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-[#fdfaf9]'} hover:bg-[#8B263E]/5">
                <td class="p-2.5 font-semibold text-[#1d1b1a]">${r.monatName} ${r.jahr}</td>
                <td class="p-2.5">${r.standortName}</td>
                <td class="p-2.5">${r.zielgruppe}</td>
                <td class="p-2.5"><span class="px-2 py-0.5 rounded-md bg-[#8B263E]/10 text-[#8B263E] font-medium">${r.kategorie}</span></td>
                <td class="p-2.5 text-[#5b403d]">${r.projekt}</td>
                <td class="p-2.5 text-right font-bold text-[#8B263E]">${r.anzahl}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(REPORTS_OUTPUT_DIR, 'sponsoren-wirkungsbericht.html'), sponsorHtml, 'utf-8');
fs.writeFileSync(path.join(REPORTS_OUTPUT_DIR, 'internes-monitoring.html'), internalHtml, 'utf-8');

console.log('✅ Sponsoren-Wirkungsbericht generiert: ' + path.join(REPORTS_OUTPUT_DIR, 'sponsoren-wirkungsbericht.html'));
console.log('✅ Internes Monitoring Dashboard generiert: ' + path.join(REPORTS_OUTPUT_DIR, 'internes-monitoring.html'));
