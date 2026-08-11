# Design-Token Übertragung & Visual-Identity Alignment (Hausbibliothek App)

Dieses Dokument beschreibt die Übertragung der in **Phase D** erarbeiteten Design-Tokens (Farben, Typografie, Radien, Logoeinbindung) auf die bestehende Hausbibliothek-Anwendung (`minimalist_home_library/frontend`).

---

## 🎨 1. Ziel & Ausführung

Um zu verhindern, dass die Haupt-Website (`beta.sprachcafe-polnisch.org`) und das Bibliotheksportal (`hausbibliothek.org`) wie zwei fremde Produkte wirken, wurden die zentralen Design-Tokens in der React/Tailwind-Codebasis der Hausbibliothek-App synchronisiert.

### 🖌️ Übertragene Tokens

| Design-Token | Hauptseite (Astro) | Hausbibliothek App (React CSS Variables) |
|---|---|---|
| **Hintergrund (Surface)** | Dark Slate (`#0f172a` / `#020617`) | `--surface: #0f172a`, `--background: #0f172a` |
| **Primärfarbe (Sky Accent)** | Sky Blue (`#0284c7` / `#38bdf8`) | `primary: #0284c7`, `primary-fixed-dim: #38bdf8` |
| **Sekundärfarbe (Rose Accent)** | Rose (`#f43f5e`) | `secondary: #f43f5e`, `error: #f43f5e` |
| **Textfarben** | Slate Light (`#f8fafc` / `#cbd5e1`) | `--on-surface: #f8fafc`, `--on-surface-variant: #cbd5e1` |
| **Typografie (Headings)** | Outfit / Montserrat | `fontFamily.headline: ["Outfit", "Inter", "sans-serif"]` |
| **Typografie (Body)** | Inter / Open Sans | `fontFamily.body: ["Inter", "sans-serif"]` |
| **Eckenradien (Border Radius)** | Modern rounded (`1rem` / `1.5rem`) | `borderRadius.xl: 1rem`, `borderRadius.2xl: 1.5rem` |

---

## 🔒 2. Dokumentierte Einschränkungen (Legacy App Architecture)

Die folgenden architekturellen Eigenschaften der Legacy-React-App bleiben bewusst erhalten, um das Ausleihsystem nicht zu gefährden:

1. **Material Symbols Outlined Icons**: Die Hausbibliothek nutzt Google Material Symbols für Ausleihstatus, Benutzer-Navigation und Benachrichtigungen. Diese wurden beibehalten, jedoch farblich auf das Sky/Rose-Farbschema angepasst.
2. **Eigenständiges Single Page Application (SPA) Routing**: Die App nutzt `react-router-dom` für die Routen `/profil`, `/ausleihen` und `/admin`.

---

## 🧪 3. Verifikation

- **Vite Production Build**: `npm run build` in `minimalist_home_library/frontend` wurde erfolgreich ohne Fehler ausgeführt (`dist/assets/index-*.css`).
- Das visuelle Erscheinungsbild ist nun nahtlos an das SprachCafé Polnisch Design System angepasst.
