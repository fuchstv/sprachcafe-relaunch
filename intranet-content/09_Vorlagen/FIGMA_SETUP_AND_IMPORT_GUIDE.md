# 🚀 Figma Projekt-Setup & Import-Anleitung

Diese Anleitung zeigt dir und der UX-Designerin, wie das Figma-Projekt in unter **2 Minuten** mit allen Tokens, Farben und bestehenden Komponenten aufgesetzt wird.

---

## ⚡ Methode 1: 1-Klick Token-Import (Empfohlen)

Wir haben alle Design-Tokens (Farben, Typo, Spacing, Radius) im standardisierten W3C DTCG-Format bereitgestellt:
👉 [`docs/figma-starter/figma-tokens.json`](figma-tokens.json)

### Schritte für die Designerin:
1. In Figma ein **neues Design-File** anlegen (z.B. *„SprachCafé Web Portal Relaunch“*).
2. Das kostenlose Figma-Plugin **[Tokens Studio for Figma](https://tokens.studio/)** starten (unter *Plugins & Integrations* nach „Tokens Studio“ suchen).
3. Auf **Settings** / **Load from file / URL** klicken und [`figma-tokens.json`](figma-tokens.json) auswählen (oder den JSON-Text hineinkopieren).
4. Auf **"Apply to document"** klicken.
   - ✅ Alle Farben (`brand/primary`, `surface/paper`, `brand/secondary` etc.)
   - ✅ Alle Schriften (`Literata`, `Plus Jakarta Sans`)
   - ✅ Alle Radien & Abstände
   werden sofort als native **Figma Variables & Styles** im Projekt angelegt!

---

## 🌐 Methode 2: Bestehende Live-Website als editierbare Vektoren importieren

Um nicht bei Null anfangen zu müssen, kann die bestehende Struktur der Website direkt als editierbare Figma-Frames importiert werden:

1. In Figma das Plugin **[html.to.design](https://www.html.to.design/)** öffnen.
2. Folgende URLs eingeben:
   - Startseite: `https://sprachcafé.org` (oder `https://beta.sprachcafe-polnisch.org`)
   - Polnische Version: `https://sprachcafé.org/pl/`
   - Hausbibliothek: `https://hausbibliothek.org`
3. Viewports wählen: **Desktop (1440px)** und **Mobile (375px)**.
4. Auf **Import** klicken.
   - ✅ Alle Sektionen (Header, Hero, KiezHub, Event Cards, Footer) landen als voll editierbare Auto-Layout Frames in Figma!

---

## 🤖 Methode 3: Figma REST API & KI-Anbindung (Dev-Mode Handoff)

Damit die **Antigravity AI** Entwürfe direkt aus Figma auslesen kann:

1. **Figma Access Token generieren:**
   - In Figma oben links auf dein Profil -> **Settings** -> **Security** -> **Personal access tokens** -> *Generate new token*.
2. **Figma File-URL kopieren:**
   - z.B. `https://www.figma.com/design/ABC123XYZ/SprachCafe-Relaunch?node-id=0-1`
3. **An die KI übergeben:**
   - Gib mir einfach den Link und Token, und ich kann Nodes, Abstände, SVGs und Farbwerte direkt programmgesteuert auslesen und in Astro/Tailwind umsetzen!
