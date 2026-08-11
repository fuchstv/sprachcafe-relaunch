# Mehrsprachigkeit & Deep-Linking (Astro Frontend <-> Hausbibliothek App)

Dieses Dokument beschreibt das Verhalten der Sprachumschaltung und des Deep-Linkings zwischen dem Astro-Relaunch-Frontend und der bestehenden Hausbibliothek-Anwendung (`hausbibliothek.org`).

---

## 🌐 1. Sprachumschaltung & Parameter-Übergabe

### Astro Frontend (`sprachcafe-relaunch`)
- **Unterstützte Sprachen**: Deutsch (`de`), Polnisch (`pl`), Englisch (`en`).

### Hausbibliothek App (`hausbibliothek.org`)
- **Unterstützte Sprachen**: Deutsch (`de`), Polnisch (`pl`).

---

## 🔗 2. Deep-Linking mit Sprach-Parameter (`?lang=`)

Bei allen Verweisen und Deep-Links vom Astro-Frontend auf die Hausbibliothek-App wird die aktuell gewählte Sprache als URL-Query-Parameter übergeben:

1. **Deutsch (`/de/` oder `/`)**:
   `https://hausbibliothek.org/?lang=de`
2. **Polnisch (`/pl/`)**:
   `https://hausbibliothek.org/?lang=pl`
3. **Buch-Detailseite (z. B. Buch ID 401)**:
   `https://hausbibliothek.org/#/books/401?lang=pl`

### 🔄 Automatische Übernahme in der Hausbibliothek App
In `frontend/src/i18n.ts` liest die Hausbibliothek-App beim Start den Query-Parameter `?lang=...` aus und setzt `i18next` sowie `localStorage.language` automatisch auf die übergebene Sprache.

---

## 🌐 3. Transparenter Umgang mit der englischen Sprache (`en`)

Da die Hausbibliothek-App nativ aktuell zwei Sprachen (**Deutsch** und **Polnisch**) unterstützt, behandelt das Astro-Frontend englische Seitenaufrufe wie folgt:

1. **Parameter-Fallback**: Bei englischer Ansicht im Frontend übergeben Deep-Links den Parameter `?lang=de` als Standard.
2. **Transparenter UI-Hinweis**: Auf englischen Sektionen und Banners wird für Nutzer ein klarer, freundlicher Hinweis eingeblendet:
   > 🌐 **Note**: *The library account portal is currently available in German (DE) and Polish (PL).*

---

## 🧪 4. Verifikationstest

- Aufruf von `https://hausbibliothek.org/?lang=pl`: App startet sofort auf Polnisch.
- Aufruf von `https://hausbibliothek.org/?lang=de`: App startet sofort auf Deutsch.
- Deep-Link von Buch 401: Öffnet direkt die Buchansicht mit der passenden Spracheinstellung.
