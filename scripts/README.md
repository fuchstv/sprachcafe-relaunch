# Skripte & Automatisierung (`/scripts`)

Dieses Verzeichnis enthält Automatisierungs-, Synchronisations- und Deployment-Skripte für die Plattform SprachCafé Polnisch e.V.

---

## ⚡ Power Automate & M365 Integrationen

- **`deploy_all_form_flows.ps1`**: Provisioniert und aktualisiert alle 5 Web-Formular-Flows im M365-Mandanten (`Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d`).
  - Sendet MS Teams Benachrichtigung an Agata Koch (`a.koch@sprachcafe-polnisch.org`).
  - Sendet E-Mail Benachrichtigung an `kontakt@sprachcafe-polnisch.org`.
  - Aktualisiert `frontend/.env.production` mit den Live-Callback-URLs.
- **`test_all_form_webhooks.py`**: Automatisierte Test-Suite zur Verifikation aller 5 Live-Webhooks (`HTTP 200 OK`).
- **`flows/`**: Versionierte Workflow-Definitionen im Logic-Apps / Power-Automate-JSON-Format:
  - `flow-mitgliedsantrag.json`
  - `flow-kinder-anmeldung.json`
  - `flow-kontakt.json`
  - `flow-ehrenamt-praktikum.json`
  - `flow-barrierefreiheit.json`
  - `flow-redaktion-webhook.json`

---

## 📅 Synchronisation & Datenpflege

- **`sync_google_calendars.ts`**: Synchronisiert alle 8 Google Kalender (iCal) mit den Event-Markdown-Dateien in `frontend/src/content/events/`.
- **`sync_hausbibliothek_catalog.ts`**: Synchronisiert den Bibliothekskatalog mit `frontend/src/data/books.json`.
- **`manage_redaktion_flows.ps1`**: Verwaltet Redaktions-Workflows für Team-, Ausstellungs- und Shop-Inhalte.

---

## 🛠️ Ausführung & Tests

### 1. Alle Formular-Flows bereitstellen:
```bash
pwsh scripts/deploy_all_form_flows.ps1
```

### 2. Alle Formular-Webhooks testen:
```bash
python3 scripts/test_all_form_webhooks.py
```

### 3. Google Kalender synchronisieren:
```bash
npx tsx scripts/sync_google_calendars.ts
```
