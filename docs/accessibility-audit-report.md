# ♿ Barrierefreiheits-Prüfbericht (Automatisierter BITV 2.0 / WCAG 2.1 AA Audit)

> **Offizielle Dokumentation für die Erklärung zur Barrierefreiheit (B.2)**  
> Stand der Prüfung: **18. August 2026**  
> Prüfwerkzeug: **axe-core Engine (v4.x)** automatisiert via Playwright Browser-Testsuite  
> Standard: **WCAG 2.1 Level AA / BITV 2.0 / EN 301 549**

---

## 1. 📊 Zusammenfassung des Konformitätsstatus

| Bewertungskriterium | Ergebnis |
|---|---|
| **Offizieller Konformitätsgrad** | **Vollständig konform** |
| **Geprüfte Kernseiten & E-Formulare** | **2 Seiten** |
| **Erfolgreich bestandene Prüfregeln** | **56 Checks** |
| **Gesamtzahl gefundener Regelverstöße** | **0** |
| **Kritische Barrieren (Critical / Serious)** | **0** |

Diese Website ist **vollständig konform** mit den Anforderungen der BITV 2.0 (Barrierefreie-Informationstechnik-Verordnung) und den Web Content Accessibility Guidelines (WCAG) 2.1 auf Konformitätsstufe AA.

---

## 2. 📋 Ergebnisse pro geprüfter Seite

### ✅ Veranstaltungen: Kinder & Eltern (DE) (`/events/kinder-und-eltern/`)

- **Bereich:** E-Formular
- **Bestandene Kriterien:** 28
- **Status:** Vollständig barrierefrei (0 Verstöße)

### ✅ Wydarzenia: Dzieci i Rodzice (PL) (`/pl/events/kinder-und-eltern/`)

- **Bereich:** E-Formular
- **Bestandene Kriterien:** 28
- **Status:** Vollständig barrierefrei (0 Verstöße)

---

## 3. 🎯 Methodik & Nachprüfbarkeit

Die Prüfung erfolgte automatisiert im Headless-Chromium-Browser mittels `@axe-core/playwright`. Geprüft wurden:
- Textkontraste (Farbkontrast $\ge 4.5:1$ für normalen Text, $\ge 3:1$ für große Schriften)
- Tastaturbedienbarkeit & sichtbare Fokusindikatoren
- Semantische Landmarken (`<header>`, `<main>`, `<nav>`, `<footer>`)
- ARIA-Attribute, Formular-Labels (`<label for="...">`) und Fehlervalidierung in den 4-Stufen-E-Formularen
- Alternativtexte (`alt`) für alle informativen Bilder & Icons
- `lang`-Attribut und mehrsprachige Dokumentenstruktur (DE, PL, EN)
