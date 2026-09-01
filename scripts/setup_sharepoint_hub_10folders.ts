/**
 * SprachCafé Polnisch e.V. - SharePoint Hub Home Page & 10-Folder Webpart Configurator
 * 
 * Generates the configuration and instructions for the SharePoint Hub Home Page:
 * - Quick Links Grid with 10 Tiles (01_Vorstand to 10_Archiv)
 * - Embedded Document Library Webpart showing the root directory
 * - Top Navigation bar links
 */

const SITE_URL = "https://sprachcafepolnisch.sharepoint.com/sites/intranet";

const FOLDERS = [
  { num: "01", name: "01_Vorstand", title: "Vorstand", icon: "🔒", desc: "Satzung, Protokolle, Vereinsregister", path: "/Freigegebene%20Dokumente/01_Vorstand" },
  { num: "02", name: "02_Finanzen", title: "Finanzen", icon: "🔒", desc: "Buchhaltung, Belege, Steuer, SEPA", path: "/Freigegebene%20Dokumente/02_Finanzen" },
  { num: "03", name: "03_Mitgliederverwaltung", title: "Mitgliederverwaltung", icon: "🔒", desc: "Mitgliederlisten, Anträge, DSGVO", path: "/Freigegebene%20Dokumente/03_Mitgliederverwaltung" },
  { num: "04", name: "04_Veranstaltungen", title: "Veranstaltungen", icon: "🎭", desc: "Kulturprogramm, Lesungen, Speak-Dating", path: "/Freigegebene%20Dokumente/04_Veranstaltungen" },
  { num: "05", name: "05_Cafébetrieb", title: "Cafébetrieb", icon: "☕", desc: "Schichtpläne, Kassenbuch, Checklisten", path: "/Freigegebene%20Dokumente/05_Cafébetrieb" },
  { num: "06", name: "06_Öffentlichkeitsarbeit", title: "Öffentlichkeitsarbeit", icon: "📢", desc: "Pressemitteilungen, Flyer, Social Media", path: "/Freigegebene%20Dokumente/06_Öffentlichkeitsarbeit" },
  { num: "07", name: "07_IT", title: "IT & Infrastruktur", icon: "💻", desc: "Server, Backups, M365, Runbooks", path: "/Freigegebene%20Dokumente/07_IT" },
  { num: "08", name: "08_Personal", title: "Personal", icon: "🔒", desc: "Dozenten- & Honorarverträge, Ehrenamt", path: "/Freigegebene%20Dokumente/08_Personal" },
  { num: "09", name: "09_Vorlagen", title: "Vorlagencenter", icon: "📦", desc: "Briefbögen, Honorarabrechnung, CI-Logos", path: "/Freigegebene%20Dokumente/09_Vorlagen" },
  { num: "10", name: "10_Archiv", title: "Archiv", icon: "🗄️", desc: "Abgeschlossene Projekte, Historie", path: "/Freigegebene%20Dokumente/10_Archiv" }
];

console.log("==========================================================================");
console.log(" 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT HUB 10-ORDNER INTEGRATION");
console.log("==========================================================================");
console.log(`🏠 Hub Site URL: ${SITE_URL}\n`);

console.log("📋 1. Quick-Links Kacheln für die Startseite (Home.aspx):");
FOLDERS.forEach(f => {
  console.log(`  ${f.icon} [${f.num}] ${f.name} -> ${SITE_URL}${f.path}`);
  console.log(`     Kurzbeschreibung: ${f.desc}`);
});

console.log("\n📋 2. Dokumenten-Webpart auf der Startseite:");
console.log("  • Webpart: 'Dokumentbibliothek' (Freigegebene Dokumente / Shared Documents)");
console.log("  • Ansicht: 'Kacheln' (Grid) oder 'Liste'");
console.log("  • Startordner: Stammverzeichnis (Root) -> Zeigt alle 10 Ordner direkt beim Laden der Seite.");

console.log("\n📋 3. Top-Navigationsleiste:");
console.log(`  • 🏠 Startseite -> ${SITE_URL}`);
console.log(`  • 📁 Alle Dokumente -> ${SITE_URL}/Freigegebene%20Dokumente`);
console.log(`  • 💻 IT & Server -> ${SITE_URL}/Freigegebene%20Dokumente/07_IT`);
console.log(`  • 📦 Vorlagencenter -> ${SITE_URL}/Freigegebene%20Dokumente/09_Vorlagen`);
console.log(`  • 📅 Dienstplan -> https://team.sprachcafé.org`);
console.log(`  • 📚 Hausbibliothek -> https://hausbibliothek.org`);
console.log("==========================================================================\n");
