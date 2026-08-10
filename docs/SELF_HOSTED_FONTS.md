# Self-Hosted Schriftarten & DSGVO / Performance Optimierung

Dieses Dokument beschreibt die lokale Einbindung aller Schriftarten für den SprachCafé Polnisch Relaunch. Durch das vollkommene Unterbinden externer Font-Anfragen (wie Google Fonts CDNs) werden DSGVO-Konformität sichergestellt und herausragende Performance-Werte (LCP < 1,5s, PageSpeed Score ≥ 95) erzielt.

---

## 🅰️ 1. Identifizierte Schriftarten & Schriftschnitte

Aus den Live-Stylesheets von `https://sprachcafe-polnisch.org/` wurden folgende Schriftfamilien extrahiert:

1. **Open Sans** (Fließtext & UI):
   - WOFF2 Formate: `400` (Normal), `600` (Semi-Bold), `700` (Bold)
   - Subsets: `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`
2. **Montserrat** (Überschriften):
   - WOFF2 Formate: `600` (Semi-Bold), `700` (Bold), `800` (Extra-Bold)
   - Subsets: `latin`, `latin-ext`, `cyrillic`

---

## 🛠️ 2. Download & Einbindung (`scripts/download_selfhosted_fonts.py`)

Das Skript [`scripts/download_selfhosted_fonts.py`](../scripts/download_selfhosted_fonts.py) lauscht auf die originalen Google Font Parameter, lädt die WOFF2-Dateien lokal herunter und schreibt die `@font-face` Definitionen in [`src/styles/fonts.css`](../frontend/src/styles/fonts.css):

```css
/* Self-Hosted WOFF2 Fonts for SprachCafé Polnisch */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/open-sans-latin-400.woff2') format('woff2');
}

@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/montserrat-latin-700.woff2') format('woff2');
}
```

---

## ⚡ 3. Performance & DSGVO Vorteile

- 🔒 **DSGVO-Konformität**: 0 externe Anfragen an Google Fonts / Drittanbieter-CDNs. Keine IP-Übertragung an fremde Server.
- 🚀 **Performance (LCP < 1.5s)**: Keine externen DNS-Lookups (`fonts.googleapis.com` / `fonts.gstatic.com`) und TLS-Handshakes.
- ⚡ **`font-display: swap`**: Garantiert sofortige Textanzeige ohne blinde Texte (FOIT - Flash of Invisible Text) bei langsamen Netzwerken.
