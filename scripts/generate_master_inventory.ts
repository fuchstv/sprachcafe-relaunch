import ExcelJS from 'exceljs';
import path from 'node:path';

export async function generateMasterWorkbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SprachCafé Polnisch e.V. - Philipp Fuchs';
  wb.created = new Date();
  wb.modified = new Date();

  const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B263E' } };
  const LIGHT_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5EBE6' } };
  const ZEBRA_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAF6EE' } };

  // ==========================================================================
  // TAB 1: ARTIKELSTAMM & PREISE
  // ==========================================================================
  const s1 = wb.addWorksheet('Artikelstamm & Preise', { pageSetup: { orientation: 'landscape' } });
  s1.columns = [
    { header: 'ID', key: 'id', width: 6 },
    { header: 'Kategorie', key: 'category', width: 18 },
    { header: 'Produktname', key: 'name', width: 38 },
    { header: 'Einheit', key: 'unit', width: 10 },
    { header: 'Verkaufspreis (€)', key: 'price_vk', width: 18 },
    { header: 'Einkaufspreis (€)', key: 'price_ek', width: 18 },
    { header: 'Marge (€)', key: 'margin', width: 14 },
    { header: 'Steuersphäre', key: 'sphere', width: 26 },
    { header: 'Geringfügigkeits-Schwelle', key: 'threshold', width: 26 }
  ];

  s1.mergeCells('A1:I1');
  const title1 = s1.getCell('A1');
  title1.value = 'SPRACHCAFÉ POLNISCH e.V. – ARTIKELSTAMM, EINKAUFS- & VERKAUFSPREISE 2026';
  title1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title1.fill = HEADER_FILL;
  title1.alignment = { horizontal: 'center', vertical: 'middle' };
  s1.getRow(1).height = 30;

  const h1 = s1.getRow(2);
  h1.values = ['ID', 'Kategorie', 'Produktname', 'Einheit', 'Verkaufspreis (€)', 'Einkaufspreis (€)', 'Marge (€)', 'Steuersphäre', 'Geringfügigkeits-Schwelle'];
  h1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  h1.eachCell(c => { c.fill = HEADER_FILL; c.alignment = { horizontal: 'center', vertical: 'middle' }; });
  h1.height = 24;

  const products: [number, string, string, string, number, number, string, string][] = [
    [1, 'Kalte Getränke', 'Mate-Limo', 'Flasche', 3.00, 1.20, 'Wirtschaftlicher Geschäftsbetrieb', '< 3 Flaschen (angebrochen)'],
    [2, 'Kalte Getränke', 'Ostmost (div. Sorten)', 'Flasche', 3.00, 1.30, 'Wirtschaftlicher Geschäftsbetrieb', '< 3 Flaschen (angebrochen)'],
    [3, 'Kalte Getränke', 'Quetschie / Fruchtmus', 'Btl', 2.00, 0.80, 'Wirtschaftlicher Geschäftsbetrieb', '< 3 Packungen'],
    [4, 'Kalte Getränke', 'Saft (Apfel/Orange)', 'Glas/Fl', 2.50, 1.10, 'Wirtschaftlicher Geschäftsbetrieb', '< 2 Flaschen'],
    [5, 'Kalte Getränke', 'Wasser 0,5L', 'Flasche', 2.00, 0.50, 'Wirtschaftlicher Geschäftsbetrieb', '< 1 Kiste angebrochen'],
    [6, 'Warme Getränke', 'Kaffee klein (Espresso/Filter)', 'Tasse', 2.50, 0.40, 'Zweckbetrieb / Kiosk', '< 1 kg angebrochen'],
    [7, 'Warme Getränke', 'Kaffee groß / Cappuccino / Latte', 'Tasse/Glas', 3.50, 0.70, 'Zweckbetrieb / Kiosk', '< 1 kg angebrochen'],
    [8, 'Warme Getränke', 'Tee (div. Bio-Sorten)', 'Tasse/Kanne', 2.00, 0.30, 'Zweckbetrieb / Kiosk', '< 2 Packungen'],
    [9, 'Warme Getränke', 'Heisse Schokolade', 'Becher', 4.00, 0.90, 'Zweckbetrieb / Kiosk', '< 1 Dose Pulver'],
    [10, 'Snacks & Gebäck', 'Kuchen (frisch / Stück)', 'Stück', 2.50, 1.00, 'Zweckbetrieb / Kiosk', 'Tagesverzehr (Rest = 0 €)'],
    [11, 'Snacks & Gebäck', 'Krówki / Polnische Bonbons', 'Stk', 0.30, 0.10, 'Wirtschaftlicher Geschäftsbetrieb', '< 1 Beutel'],
    [12, 'Snacks & Gebäck', 'Lolly', 'Stk', 0.50, 0.15, 'Wirtschaftlicher Geschäftsbetrieb', '< 5 Stück'],
    [13, 'Snacks & Gebäck', 'Schokoriegel klein / Prinz Polo', 'Stk', 0.50, 0.20, 'Wirtschaftlicher Geschäftsbetrieb', '< 5 Riegel'],
    [14, 'Snacks & Gebäck', 'Schokoriegel groß', 'Stk', 1.00, 0.45, 'Wirtschaftlicher Geschäftsbetrieb', '< 3 Riegel'],
    [15, 'Kleiner Laden', 'T-Shirts (Vereins-Design S–XXL)', 'Stk', 20.00, 8.50, 'Wirtschaftlicher Geschäftsbetrieb', 'Keine Geringf. (alle zählen)'],
    [16, 'Kleiner Laden', 'Speak-Dating Kartenspiel (zweisprachig)', 'Set', 12.00, 4.20, 'Zweckbetrieb / Merch', 'Keine Geringf. (alle zählen)'],
    [17, 'Spenden & Sonstiges', 'Spende (Bücher, Bibliothek, Allgemein)', 'Vorgang', 0.00, 0.00, 'Ideeller Bereich / Spende', 'Keine Inventurware'],
    [18, 'Spenden & Sonstiges', 'Andere Einnahmen', 'Vorgang', 0.00, 0.00, 'Nach Zweck zuzuordnen', 'Keine Inventurware']
  ];

  products.forEach((p, idx) => {
    const rowNum = 3 + idx;
    const r = s1.addRow([
      p[0], p[1], p[2], p[3], p[4], p[5],
      { formula: `E${rowNum}-F${rowNum}` },
      p[6], p[7]
    ]);
    r.getCell(5).numFmt = '#,##0.00 €';
    r.getCell(6).numFmt = '#,##0.00 €';
    r.getCell(7).numFmt = '#,##0.00 €';
    if (idx % 2 === 1) {
      r.eachCell(c => c.fill = ZEBRA_FILL);
    }
  });

  // ==========================================================================
  // TAB 2: WOCHEN-VERKAUF & STRICHLISTE (CAFE-SCHICHTEN)
  // ==========================================================================
  const s2 = wb.addWorksheet('Wochen_Verkauf_Verbrauch', { pageSetup: { orientation: 'landscape' } });
  s2.columns = [
    { header: 'Produkt', key: 'prod', width: 36 },
    { header: 'Einzelpreis', key: 'price', width: 14 },
    { header: 'Mo', key: 'mo', width: 8 },
    { header: 'Di', key: 'di', width: 8 },
    { header: 'Mi', key: 'mi', width: 8 },
    { header: 'Do', key: 'do', width: 8 },
    { header: 'Fr', key: 'fr', width: 8 },
    { header: 'Sa', key: 'sa', width: 8 },
    { header: 'So', key: 'so', width: 8 },
    { header: 'Gesamt Menge', key: 'total_qty', width: 15 },
    { header: 'Wochensumme (€)', key: 'total_eur', width: 18 }
  ];

  s2.mergeCells('A1:K1');
  const title2 = s2.getCell('A1');
  title2.value = 'SPRACHCAFÉ POLNISCH e.V. – WÖCHENTLICHE VERKAUFS- & STRICHLISTE';
  title2.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title2.fill = HEADER_FILL;
  title2.alignment = { horizontal: 'center', vertical: 'middle' };
  s2.getRow(1).height = 30;

  s2.addRow([]);
  s2.getCell('A2').value = 'Woche vom: ____________________ bis: ____________________   |   Standort: Schulzestr. 1, Berlin-Pankow';
  s2.getCell('A2').font = { bold: true, italic: true, size: 11 };

  const h2 = s2.addRow(['Produktname', 'Preis (€)', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So', 'Gesamt Stk', 'Einnahmen (€)']);
  h2.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  h2.eachCell(c => { c.fill = HEADER_FILL; c.alignment = { horizontal: 'center', vertical: 'middle' }; });

  const saleItems = products.filter(p => p[4] > 0);
  saleItems.forEach((p, idx) => {
    const rNum = 4 + idx;
    const r = s2.addRow([
      p[2], p[4], '', '', '', '', '', '', '',
      { formula: `SUM(C${rNum}:I${rNum})` },
      { formula: `B${rNum}*J${rNum}` }
    ]);
    r.getCell(2).numFmt = '#,##0.00 €';
    r.getCell(10).numFmt = '#,##0';
    r.getCell(11).numFmt = '#,##0.00 €';
    if (idx % 2 === 1) r.eachCell(c => c.fill = ZEBRA_FILL);
  });

  const lastSaleRow = 3 + saleItems.length;
  const totalSaleRow = s2.addRow(['GESAMTEINNAHMEN WOCHE (SOLL):', '', '', '', '', '', '', '', '', '', { formula: `SUM(K4:K${lastSaleRow})` }]);
  totalSaleRow.font = { bold: true, size: 12 };
  totalSaleRow.getCell(11).numFmt = '#,##0.00 €';
  totalSaleRow.getCell(11).fill = LIGHT_FILL;

  // ==========================================================================
  // TAB 3: MINDERUNGSPROTOKOLL & HELFERVERPFLEGUNG (FINANZAMT-NACHWEIS)
  // ==========================================================================
  const s3 = wb.addWorksheet('Minderung_und_Schwund', { pageSetup: { orientation: 'portrait' } });
  s3.columns = [
    { header: 'Lfd. Nr.', key: 'nr', width: 8 },
    { header: 'Datum', key: 'date', width: 14 },
    { header: 'Artikel / Produkt', key: 'item', width: 30 },
    { header: 'Menge', key: 'qty', width: 10 },
    { header: 'Art des Abgangs', key: 'type', width: 28 },
    { header: 'Begründung / Anlass', key: 'reason', width: 35 },
    { header: 'EK-Stückpreis (€)', key: 'ek', width: 18 },
    { header: 'Gesamtwert (€)', key: 'total_val', width: 16 },
    { header: 'Erfasst durch', key: 'author', width: 18 }
  ];

  s3.mergeCells('A1:I1');
  const title3 = s3.getCell('A1');
  title3.value = 'MINDERUNGSPROTOKOLL: SCHWUND, MHD-ABLAUF & HELFERVERPFLEGUNG';
  title3.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title3.fill = HEADER_FILL;
  title3.alignment = { horizontal: 'center', vertical: 'middle' };
  s3.getRow(1).height = 30;

  s3.addRow([]);
  s3.getCell('A2').value = 'Rechtlicher Nachweis für das Finanzamt über Warenabgänge ohne Verkaufserlös (GoBD / Gemeinnützigkeit)';
  s3.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF595959' } };

  const h3 = s3.addRow(['Lfd. Nr.', 'Datum', 'Artikel / Produkt', 'Menge', 'Art des Abgangs', 'Begründung / Anlass', 'EK-Preis (€)', 'Gesamtwert (€)', 'Erfasst durch']);
  h3.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  h3.eachCell(c => { c.fill = HEADER_FILL; c.alignment = { horizontal: 'center', vertical: 'middle' }; });

  const sampleLoss: [number, string, string, number, string, string, number, string][] = [
    [1, '12.08.2026', 'Ostmost Apfel-Rhabarber', 3, 'MHD-Ablauf / Verderb', 'MHD 08/2026 überschritten, Trübung entsorgt', 1.30, 'Dorota Stasińska'],
    [2, '19.08.2026', 'Mate-Limo', 6, 'Helferverpflegung', 'Kostenlose Verpflegung Helfer Speak-Dating Schicht', 1.20, 'Schichtleitung'],
    [3, '26.08.2026', 'Kuchen', 4, 'Verderb / Rest', 'Tagesreste Sprachcafé nach 3 Tagen entsorgt', 1.00, 'Schichtleitung']
  ];

  sampleLoss.forEach((l, idx) => {
    const rNum = 4 + idx;
    const r = s3.addRow([
      l[0], l[1], l[2], l[3], l[4], l[5], l[6],
      { formula: `D${rNum}*G${rNum}` },
      l[7]
    ]);
    r.getCell(7).numFmt = '#,##0.00 €';
    r.getCell(8).numFmt = '#,##0.00 €';
  });

  for (let i = 0; i < 15; i++) {
    const rNum = 4 + sampleLoss.length + i;
    const r = s3.addRow([sampleLoss.length + 1 + i, '', '', '', '', '', '', { formula: `D${rNum}*G${rNum}` }, '']);
    r.getCell(7).numFmt = '#,##0.00 €';
    r.getCell(8).numFmt = '#,##0.00 €';
  }

  // ==========================================================================
  // TAB 4: STICHTAGSINVENTUR (31. DEZEMBER)
  // ==========================================================================
  const s4 = wb.addWorksheet('Stichtagsinventur_31_12', { pageSetup: { orientation: 'landscape' } });
  s4.columns = [
    { header: 'Pos.', key: 'pos', width: 6 },
    { header: 'Kategorie', key: 'cat', width: 16 },
    { header: 'Artikel', key: 'art', width: 32 },
    { header: 'Einheit', key: 'unit', width: 10 },
    { header: 'Anfangsbestand 01.01.', key: 'start', width: 20 },
    { header: 'Zugänge im Jahr', key: 'in', width: 16 },
    { header: 'Verkauf / Abgang', key: 'out_sale', width: 16 },
    { header: 'Schwund / Helfer', key: 'out_loss', width: 16 },
    { header: 'Soll-Endbestand', key: 'soll', width: 16 },
    { header: 'Ist-Zählung (31.12.)', key: 'ist', width: 18 },
    { header: 'Differenz', key: 'diff', width: 12 },
    { header: 'Geringfügig?', key: 'low_val', width: 18 },
    { header: 'EK-Preis Brutto', key: 'ek', width: 16 },
    { header: 'Bilanzwert 31.12. (€)', key: 'val', width: 22 }
  ];

  s4.mergeCells('A1:N1');
  const title4 = s4.getCell('A1');
  title4.value = 'SPRACHCAFÉ POLNISCH e.V. – STICHTAGSINVENTUR ZUM 31. DEZEMBER (UMLAUFVERMÖGEN)';
  title4.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title4.fill = HEADER_FILL;
  title4.alignment = { horizontal: 'center', vertical: 'middle' };
  s4.getRow(1).height = 30;

  s4.addRow([]);
  s4.getCell('A2').value = 'Bewertung nach Anschaffungskosten / Niederstwertprinzip gem. § 4 Abs. 3 EStG für MTH Vereinsprofi';
  s4.getCell('A2').font = { italic: true, size: 10 };

  const h4 = s4.addRow([
    'Pos.', 'Kategorie', 'Artikel', 'Einheit', 'Anfangsbestand 01.01.', 'Zugänge im Jahr',
    'Verkauf / Abgang', 'Schwund / Helfer', 'Soll-Endbestand', 'Ist-Zählung (31.12.)',
    'Differenz', 'Geringfügigkeit?', 'EK-Preis (€)', 'Inventurwert 31.12. (€)'
  ]);
  h4.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  h4.eachCell(c => { c.fill = HEADER_FILL; c.alignment = { horizontal: 'center', vertical: 'middle' }; });

  const inventurItems = products.filter(p => p[5] > 0);
  inventurItems.forEach((p, idx) => {
    const rNum = 4 + idx;
    const r = s4.addRow([
      idx + 1,
      p[1],
      p[2],
      p[3],
      0, // Anfangsbestand
      0, // Zugänge
      0, // Verkauf
      0, // Schwund
      { formula: `E${rNum}+F${rNum}-G${rNum}-H${rNum}` }, // Soll
      0, // Ist
      { formula: `J${rNum}-I${rNum}` }, // Diff
      { formula: `IF(J${rNum}*M${rNum}<10,"Geringfügig (0 €)","Erfassen")` }, // Geringfügigkeitsprüfung
      p[5], // EK
      { formula: `IF(L${rNum}="Geringfügig (0 €)",0,J${rNum}*M${rNum})` } // Inventurwert
    ]);
    r.getCell(13).numFmt = '#,##0.00 €';
    r.getCell(14).numFmt = '#,##0.00 €';
    if (idx % 2 === 1) r.eachCell(c => c.fill = ZEBRA_FILL);
  });

  const lastInvRow = 3 + inventurItems.length;
  const totalInvRow = s4.addRow([
    'GESAMT-INVENTURWERT ZUM 31.12.:', '', '', '', '', '', '', '', '', '', '', '', '',
    { formula: `SUM(N4:N${lastInvRow})` }
  ]);
  totalInvRow.font = { bold: true, size: 12 };
  totalInvRow.getCell(14).numFmt = '#,##0.00 €';
  totalInvRow.getCell(14).fill = LIGHT_FILL;

  // ==========================================================================
  // TAB 5: KASSENABGLEICH TAGESABSCHLUSS
  // ==========================================================================
  const s5 = wb.addWorksheet('Kassenabgleich_Tagesabschluss', { pageSetup: { orientation: 'portrait' } });
  s5.columns = [
    { header: 'Feld / Position', key: 'key', width: 38 },
    { header: 'Betrag (€)', key: 'val', width: 20 },
    { header: 'Erläuterung / Nachweis', key: 'notes', width: 45 }
  ];

  s5.mergeCells('A1:C1');
  const title5 = s5.getCell('A1');
  title5.value = 'SPRACHCAFÉ POLNISCH e.V. – KASSENSTURZ & TAGESABGLEICH';
  title5.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title5.fill = HEADER_FILL;
  title5.alignment = { horizontal: 'center', vertical: 'middle' };
  s5.getRow(1).height = 30;

  s5.addRow([]);
  s5.addRow(['Datum & Standort:', '28.08.2026', 'Schulzestr. 1, 13187 Berlin-Pankow']);
  s5.addRow(['Schichtleitung / Erfasser:in:', 'Mustername Helfer:in', 'Handzeichen / Unterschrift']);
  s5.addRow([]);

  const kassenRows: [string, any, string][] = [
    ['1. Kassenanfangsbestand (Wechselgeld):', 50.00, 'Soll-Wechselgeldbestand zu Schichtbeginn'],
    ['2. + Bareinnahmen (Kiosk & Getränke):', 45.00, 'Lt. Strichliste Wochen_Verkauf_Verbrauch'],
    ['3. + Barspenden (Speak-Dating / Bibliothek):', 30.00, 'Freiwillige Barspenden in die Kasse'],
    ['4. - Barausgaben / Einkäufe (mit Beleg):', 14.80, 'Netto Kassenbon (Milch, Kaffee) anbei'],
    ['---------------------------------------------', '', '---------------------------------------------'],
    ['= THEORETISCHER KASSEN-ENDSTAND (SOLL):', { formula: 'B6+B7+B8-B9' }, 'Formel: Anfang + Einnahmen - Ausgaben'],
    ['= TATSÄCHLICH GEZÄHLTER IST-STAND:', 110.20, 'Gezähltes Bargeld im Tresor am Abend'],
    ['---------------------------------------------', '', '---------------------------------------------'],
    ['DIFFERENZ (IST - SOLL):', { formula: 'B12-B11' }, 'Muss 0,00 € sein (Differenz prüfen!)']
  ];

  kassenRows.forEach(row => {
    const r = s5.addRow(row);
    if (typeof row[1] === 'number' || (row[1] && row[1].formula)) {
      r.getCell(2).numFmt = '#,##0.00 €';
    }
  });

  s5.getRow(11).font = { bold: true };
  s5.getRow(12).font = { bold: true };
  s5.getRow(14).font = { bold: true, size: 12 };
  s5.getCell('B14').fill = LIGHT_FILL;

  const outPath = path.resolve('/home/ubuntu/Inventur_und_Verkaufsliste_Vereinscafe_2026.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('✅ Master Workbook successfully written to ' + outPath);
}

generateMasterWorkbook().catch(console.error);
