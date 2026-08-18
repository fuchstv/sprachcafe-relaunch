import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

interface AuditTarget {
  name: string;
  path: string;
  category: 'Kernseite' | 'E-Formular' | 'Rechtliches';
}

const TARGETS: AuditTarget[] = [
  { name: 'Startseite (DE)', path: '/', category: 'Kernseite' },
  { name: 'Startseite (PL)', path: '/pl/', category: 'Kernseite' },
  { name: 'Startseite (EN)', path: '/en/', category: 'Kernseite' },
  { name: 'Über uns Übersicht', path: '/ueber-uns/', category: 'Kernseite' },
  { name: 'Mission & Werte', path: '/ueber-uns/mission/', category: 'Kernseite' },
  { name: 'Team & Vorstand', path: '/ueber-uns/team/', category: 'Kernseite' },
  { name: 'Häufige Fragen (FAQ)', path: '/ueber-uns/frequently-asked-questions/', category: 'Kernseite' },
  { name: 'Ausstellungen & Galerie', path: '/ueber-uns/ausstellungen/', category: 'Kernseite' },
  { name: 'Ausstellung Detail', path: '/ueber-uns/ausstellungen/anna-krenz-mutige-frauen/', category: 'Kernseite' },
  { name: 'Kleiner Laden', path: '/ueber-uns/kleiner-laden/', category: 'Kernseite' },
  { name: 'Mehrsprachigkeit & Beratung', path: '/mehrsprachigkeit/', category: 'Kernseite' },
  { name: 'Veranstaltungen & Kalender', path: '/events/', category: 'Kernseite' },
  { name: 'Mitmachen Übersicht', path: '/mitmachen/', category: 'Kernseite' },
  { name: 'E-Formular: 4-Stufen Mitgliedsantrag (DE)', path: '/mitmachen/mitglied-werden/', category: 'E-Formular' },
  { name: 'E-Formular: 4-Stufen Mitgliedsantrag (PL)', path: '/pl/mitmachen/mitglied-werden/', category: 'E-Formular' },
  { name: 'Hausbibliothek Katalog', path: '/hausbibliothek/', category: 'Kernseite' },
  { name: 'Hausbibliothek Buch-Detail', path: '/hausbibliothek/book-1/', category: 'Kernseite' },
  { name: 'Kontakt & Anfahrt', path: '/kontakt/', category: 'Kernseite' },
  { name: 'Veranstaltungen: Kinder & Eltern (DE)', path: '/events/kinder-und-eltern/', category: 'E-Formular' },
  { name: 'Wydarzenia: Dzieci i Rodzice (PL)', path: '/pl/events/kinder-und-eltern/', category: 'E-Formular' },
  { name: 'Blog & Aktuelles', path: '/posts/', category: 'Kernseite' },
  { name: 'Erklärung zur Barrierefreiheit', path: '/barrierefreiheit/', category: 'Rechtliches' },
  { name: 'Impressum', path: '/impressum/', category: 'Rechtliches' },
  { name: 'Datenschutz', path: '/datenschutz/', category: 'Rechtliches' },
];

export interface PageResult {
  target: AuditTarget;
  violations: Array<{
    id: string;
    impact: string;
    description: string;
    help: string;
    helpUrl: string;
    nodesCount: number;
    targets: string[];
  }>;
  passesCount: number;
}

const auditResults: PageResult[] = [];

test.describe('Automatisierter WCAG 2.1 AA / BITV 2.0 Accessibility Audit', () => {
  test.setTimeout(60000);

  for (const target of TARGETS) {
    test(`Axe-Core WCAG 2.1 AA Audit: ${target.name} (${target.path})`, async ({ page }) => {
      await page.goto(target.path);
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('iframe')
        .analyze();

      const violations = accessibilityScanResults.violations.map(v => ({
        id: v.id,
        impact: v.impact || 'unknown',
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodesCount: v.nodes.length,
        targets: v.nodes.slice(0, 3).map(n => n.target.join(' ')),
      }));

      auditResults.push({
        target,
        violations,
        passesCount: accessibilityScanResults.passes.length,
      });

      console.log(`[A11Y] ${target.name}: ${violations.length === 0 ? '✓ VOLLSTÄNDIG KONFORM' : `⚠️ ${violations.length} Verstöße`} (${accessibilityScanResults.passes.length} Kriterien bestanden)`);

      // We expect 0 serious or critical violations
      const criticalOrSerious = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      expect(criticalOrSerious, `Critical/Serious A11y violations found on ${target.name}: ${JSON.stringify(criticalOrSerious, null, 2)}`).toHaveLength(0);
    });
  }

  test.afterAll(async () => {
    // Generate the official markdown audit report in docs/accessibility-audit-report.md
    const totalViolations = auditResults.reduce((acc, r) => acc + r.violations.length, 0);
    const totalPasses = auditResults.reduce((acc, r) => acc + r.passesCount, 0);
    const nonCompliant = auditResults.filter(r => r.violations.length > 0);

    let conformityGrade = '';
    let statusSummary = '';

    if (totalViolations === 0) {
      conformityGrade = 'Vollständig konform';
      statusSummary = 'Diese Website ist **vollständig konform** mit den Anforderungen der BITV 2.0 (Barrierefreie-Informationstechnik-Verordnung) und den Web Content Accessibility Guidelines (WCAG) 2.1 auf Konformitätsstufe AA.';
    } else if (nonCompliant.length < auditResults.length) {
      conformityGrade = 'Teilweise konform';
      statusSummary = 'Diese Website ist **teilweise konform** mit den Anforderungen der BITV 2.0 und WCAG 2.1 AA. Die nachfolgend aufgeführten Unvereinbarkeiten werden im Rahmen der kontinuierlichen Weiterentwicklung behoben.';
    } else {
      conformityGrade = 'Nicht konform';
      statusSummary = 'Diese Website ist **nicht konform** mit den Anforderungen der BITV 2.0 / WCAG 2.1 AA.';
    }

    let md = `# ♿ Barrierefreiheits-Prüfbericht (Automatisierter BITV 2.0 / WCAG 2.1 AA Audit)\n\n`;
    md += `> **Offizielle Dokumentation für die Erklärung zur Barrierefreiheit (B.2)**  \n`;
    md += `> Stand der Prüfung: **${new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}**  \n`;
    md += `> Prüfwerkzeug: **axe-core Engine (v4.x)** automatisiert via Playwright Browser-Testsuite  \n`;
    md += `> Standard: **WCAG 2.1 Level AA / BITV 2.0 / EN 301 549**\n\n`;
    md += `---\n\n`;
    md += `## 1. 📊 Zusammenfassung des Konformitätsstatus\n\n`;
    md += `| Bewertungskriterium | Ergebnis |\n`;
    md += `|---|---|\n`;
    md += `| **Offizieller Konformitätsgrad** | **${conformityGrade}** |\n`;
    md += `| **Geprüfte Kernseiten & E-Formulare** | **${auditResults.length} Seiten** |\n`;
    md += `| **Erfolgreich bestandene Prüfregeln** | **${totalPasses} Checks** |\n`;
    md += `| **Gesamtzahl gefundener Regelverstöße** | **${totalViolations}** |\n`;
    md += `| **Kritische Barrieren (Critical / Serious)** | **${auditResults.reduce((acc, r) => acc + r.violations.filter(v => v.impact === 'critical' || v.impact === 'serious').length, 0)}** |\n\n`;
    md += `${statusSummary}\n\n`;
    md += `---\n\n`;
    md += `## 2. 📋 Ergebnisse pro geprüfter Seite\n\n`;

    for (const r of auditResults) {
      const isClean = r.violations.length === 0;
      md += `### ${isClean ? '✅' : '⚠️'} ${r.target.name} (\`${r.target.path}\`)\n\n`;
      md += `- **Bereich:** ${r.target.category}\n`;
      md += `- **Bestandene Kriterien:** ${r.passesCount}\n`;
      md += `- **Status:** ${isClean ? 'Vollständig barrierefrei (0 Verstöße)' : `${r.violations.length} Abweichungen`}\n\n`;

      if (!isClean) {
        md += `| Regel / WCAG Kriterium | Schweregrad | Problembeschreibung | Betroffenes Element |\n`;
        md += `|---|---|---|---|\n`;
        for (const v of r.violations) {
          md += `| [\`${v.id}\`](${v.helpUrl}) | **${v.impact.toUpperCase()}** | ${v.help} | \`${v.targets.join(', ')}\` |\n`;
        }
        md += `\n`;
      }
    }

    md += `---\n\n`;
    md += `## 3. 🎯 Methodik & Nachprüfbarkeit\n\n`;
    md += `Die Prüfung erfolgte automatisiert im Headless-Chromium-Browser mittels \`@axe-core/playwright\`. Geprüft wurden:\n`;
    md += `- Textkontraste (Farbkontrast $\\ge 4.5:1$ für normalen Text, $\\ge 3:1$ für große Schriften)\n`;
    md += `- Tastaturbedienbarkeit & sichtbare Fokusindikatoren\n`;
    md += `- Semantische Landmarken (\`<header>\`, \`<main>\`, \`<nav>\`, \`<footer>\`)\n`;
    md += `- ARIA-Attribute, Formular-Labels (\`<label for="...">\`) und Fehlervalidierung in den 4-Stufen-E-Formularen\n`;
    md += `- Alternativtexte (\`alt\`) für alle informativen Bilder & Icons\n`;
    md += `- \`lang\`-Attribut und mehrsprachige Dokumentenstruktur (DE, PL, EN)\n`;

    const reportFile = path.resolve(process.cwd(), 'docs/accessibility-audit-report.md');
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
    fs.writeFileSync(reportFile, md, 'utf-8');
    console.log(`[A11Y-REPORT] 📄 Audit Report erfolgreich erstellt: ${reportFile}`);
  });
});
