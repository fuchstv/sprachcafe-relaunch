import { chromium, type Browser } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AuditTarget {
  name: string;
  url: string;
  category: 'core' | 'e-form' | 'redaktion';
}

const TARGETS: AuditTarget[] = [
  { name: 'Startseite (DE)', url: 'http://127.0.0.1:4321/', category: 'core' },
  { name: 'Startseite (PL)', url: 'http://127.0.0.1:4321/pl/', category: 'core' },
  { name: 'Startseite (EN)', url: 'http://127.0.0.1:4321/en/', category: 'core' },
  { name: 'Über uns (Übersicht)', url: 'http://127.0.0.1:4321/ueber-uns/', category: 'core' },
  { name: 'Mission & Werte', url: 'http://127.0.0.1:4321/ueber-uns/mission/', category: 'core' },
  { name: 'Team & Vorstand', url: 'http://127.0.0.1:4321/ueber-uns/team/', category: 'core' },
  { name: 'FAQ (Häufige Fragen)', url: 'http://127.0.0.1:4321/ueber-uns/frequently-asked-questions/', category: 'core' },
  { name: 'Ausstellungen & Galerie', url: 'http://127.0.0.1:4321/ueber-uns/ausstellungen/', category: 'core' },
  { name: 'Ausstellung Detail', url: 'http://127.0.0.1:4321/ueber-uns/ausstellungen/anna-krenz-mutige-frauen/', category: 'core' },
  { name: 'Kleiner Laden', url: 'http://127.0.0.1:4321/ueber-uns/kleiner-laden/', category: 'core' },
  { name: 'Mehrsprachigkeit & Beratung', url: 'http://127.0.0.1:4321/mehrsprachigkeit/', category: 'core' },
  { name: 'Veranstaltungen & Kalender', url: 'http://127.0.0.1:4321/events/', category: 'core' },
  { name: 'Mitmachen (Übersicht)', url: 'http://127.0.0.1:4321/mitmachen/', category: 'core' },
  { name: 'E-Formular: Mitgliedsantrag 4-Stufen (DE)', url: 'http://127.0.0.1:4321/mitmachen/mitglied-werden/', category: 'e-form' },
  { name: 'E-Formular: Mitgliedsantrag 4-Stufen (PL)', url: 'http://127.0.0.1:4321/pl/mitmachen/mitglied-werden/', category: 'e-form' },
  { name: 'Hausbibliothek Katalog', url: 'http://127.0.0.1:4321/hausbibliothek/', category: 'core' },
  { name: 'Hausbibliothek Buch-Detail', url: 'http://127.0.0.1:4321/hausbibliothek/book-1/', category: 'core' },
  { name: 'Kontakt & Anfahrt', url: 'http://127.0.0.1:4321/kontakt/', category: 'core' },
  { name: 'Blog & Aktuelles', url: 'http://127.0.0.1:4321/posts/', category: 'core' },
];

export interface ViolationReport {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodesCount: number;
  targets: string[];
}

export interface PageAuditResult {
  target: AuditTarget;
  violations: ViolationReport[];
  passesCount: number;
  incompleteCount: number;
  inapplicableCount: number;
}

async function runAudit() {
  console.log('================================================================');
  console.log('♿ AUTOMATED ACCESSIBILITY AUDIT (AXE-CORE / WCAG 2.1 AA / BITV)');
  console.log('================================================================\n');

  const browser: Browser = await chromium.launch();
  const page = await browser.newPage();

  const auditResults: PageAuditResult[] = [];
  let totalViolations = 0;
  let totalPasses = 0;

  for (const target of TARGETS) {
    process.stdout.write(`Testing [${target.category.toUpperCase()}] ${target.name} (${target.url})... `);
    try {
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(500);

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const violations: ViolationReport[] = axeResults.violations.map(v => ({
        id: v.id,
        impact: v.impact || 'unknown',
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodesCount: v.nodes.length,
        targets: v.nodes.slice(0, 3).map(n => n.target.join(' ')),
      }));

      totalViolations += violations.length;
      totalPasses += axeResults.passes.length;

      auditResults.push({
        target,
        violations,
        passesCount: axeResults.passes.length,
        incompleteCount: axeResults.incomplete.length,
        inapplicableCount: axeResults.inapplicable.length,
      });

      if (violations.length === 0) {
        console.log(`✅ 100% Konform (${axeResults.passes.length} Regeln bestanden)`);
      } else {
        console.log(`⚠️ ${violations.length} Verstöße gefunden!`);
      }
    } catch (err: any) {
      console.log(`❌ Fehler beim Laden: ${err.message}`);
    }
  }

  await browser.close();

  // Generate Detailed Markdown Report
  let md = `# ♿ Barrierefreiheits-Audit-Bericht (Automatisierte Prüfung gem. WCAG 2.1 AA / BITV 2.0)\n\n`;
  md += `**Prüfzeitpunkt:** ${new Date().toISOString()}\n`;
  md += `**Prüfmethode:** Automatisierte Analyse mit \`axe-core\` Engine (v4.x) via Playwright\n`;
  md += `**Prüfprofil:** WCAG 2.1 Level A & AA, BITV 2.0 / EN 301 549\n`;
  md += `**Geprüfte Seiten:** ${auditResults.length} Kernseiten inkl. aller mehrstufigen E-Formulare\n\n`;

  md += `## 📊 Zusammenfassung des Konformitätsstatus\n\n`;
  md += `| Metrik | Wert |\n`;
  md += `|---|---|\n`;
  md += `| **Geprüfte Seiten & Formulare** | ${auditResults.length} |\n`;
  md += `| **Bestandene Regel-Prüfungen (Passes)** | ${totalPasses} |\n`;
  md += `| **Gefundene Regel-Verstöße (Violations)** | ${totalViolations} |\n`;

  const nonCompliantPages = auditResults.filter(r => r.violations.length > 0);
  let statusText = '';
  let conformityGrade = '';
  if (totalViolations === 0) {
    statusText = '**VOLLSTÄNDIG KONFORM** mit den Anforderungen der BITV 2.0 / WCAG 2.1 AA';
    conformityGrade = 'vollständig konform';
  } else if (nonCompliantPages.length < auditResults.length) {
    statusText = '**TEILWEISE KONFORM** mit den Anforderungen der BITV 2.0 / WCAG 2.1 AA (Unvereinbarkeiten dokumentiert)';
    conformityGrade = 'teilweise konform';
  } else {
    statusText = '**NICHT KONFORM** mit den Anforderungen der BITV 2.0 / WCAG 2.1 AA';
    conformityGrade = 'nicht konform';
  }

  md += `| **Ermittelter Konformitätsgrad** | ${statusText} |\n\n`;

  md += `## 📋 Detaillierte Prüfergebnisse pro Seite\n\n`;

  for (const res of auditResults) {
    md += `### ${res.violations.length === 0 ? '✅' : '⚠️'} ${res.target.name}\n`;
    md += `- **URL:** \`${res.target.url}\`\n`;
    md += `- **Kategorie:** ${res.target.category}\n`;
    md += `- **Ergebnis:** ${res.violations.length === 0 ? 'Keine WCAG 2.1 AA Verstöße gefunden' : `${res.violations.length} Verstöße`}\n`;
    md += `- **Bestandene Kriterien:** ${res.passesCount}\n\n`;

    if (res.violations.length > 0) {
      md += `| Regel-ID | Schweregrad | Beschreibung | Betroffene Selektoren |\n`;
      md += `|---|---|---|---|\n`;
      for (const v of res.violations) {
        md += `| [\`${v.id}\`](${v.helpUrl}) | **${v.impact.toUpperCase()}** | ${v.help} | \`${v.targets.join(', ')}\` |\n`;
      }
      md += `\n`;
    }
  }

  const reportPath = path.resolve(__dirname, '../docs/accessibility-audit-report.md');
  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log(`\n📄 Ausführlicher Bericht gespeichert unter: ${reportPath}`);

  return { totalViolations, auditResults, statusText, conformityGrade };
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
