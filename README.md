# SprachCafé Relaunch - Monorepo

Willkommen im zentralen Repository für den Relaunch der SprachCafé Webplattform ([sprachcafé.org](https://xn--sprachcaf-j4a.org/) / [sprachcafe-polnisch.org](https://sprachcafe-polnisch.org/)). Dieses Repository vereint das performante Astro-Frontend, die Infrastruktur-Konfiguration, M365 Power Automate Automationen sowie sämtliche Dokumentationen und CI/CD-Pipelines.

---

## 📁 Ordnerstruktur & Komponenten

```
sprachcafe-relaunch/
├── frontend/             # Astro-Webapplikation (570+ Seiten, Pagefind Suche, i18n DE/PL)
│   ├── src/
│   │   ├── components/   # UI-Komponenten & Web-Formulare (DSGVO-konform)
│   │   ├── content/      # Markdown-Inhalte (Events, Team, Ausstellungen, Shop)
│   │   ├── data/         # Statische Datensätze (Hausbibliothek Bücherkatalog)
│   │   └── pages/        # Routen & Landingpages (inkl. /pl/ Pfade)
│   └── public/           # Authentische Medien-Assets (Fotos, Icons, Logos, Fonts)
├── infra/                # Caddyfile (Reverse Proxy, HTTPS), docker-compose.yml
├── scripts/              # Automationen, Sync-Skripte & Power Automate Deployment
│   ├── flows/            # Exportierte Power Automate Flow-Definitionen (JSON)
│   ├── deploy_all_form_flows.ps1 # Provisioniert alle 5 Formular-Flows im M365 Tenant
│   └── test_all_form_webhooks.py # Verifikationstest aller Live-Webhooks
├── .github/              # CI/CD-Pipelines & Branch Protection
└── docs/                 # Zentrale technische Dokumentation & Architekturentscheidungen
```

---

## 📖 Ausführliche System- & Synchronisations-Dokumentation

👉 **[Gesamtdokumentation: Synchronisationen, Zeitpläne, Nachtlauf & PowerShell Automationen](docs/SYSTEM_AUTOMATION_AND_SYNC_GUIDE.md)**  
*Erklärt alle Teilsysteme, den nächtlichen 02:00 Uhr Lauf, Kalender- und Bibliotheks-Syncs, Power Automate Webhooks, das Vorstands-Dashboard und die PowerShell-Synchronisation nach SharePoint.*

---

## ⚡ Power Automate Formular-Integrationen (M365)

Alle Formulare der Website übertragen Eingaben direkt via HTTP-Webhook an Microsoft Power Automate Flows im Vereins-Mandanten (`Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d`).

**Einheitliche Benachrichtigungsregel für alle Flows:**
1. **MS Teams-Nachricht** an **Agata Koch** (`a.koch@sprachcafe-polnisch.org` / User-ID: `c723e96c-19e9-4b42-b13a-2aa57e35143d`).
2. **E-Mail-Benachrichtigung** an **`kontakt@sprachcafe-polnisch.org`**.
3. **HTTP 200 JSON Response** an das Frontend mit Eingangsbestätigung.

| Formular | Frontend-Route | Flow Name & ID im M365 Tenant |
|---|---|---|
| **Mitgliedsantrag** | [`/mitmachen/mitglied-werden/`](https://xn--sprachcaf-j4a.org/mitmachen/mitglied-werden/) | `SprachCafé - Mitgliedsantrag (Teams an Agata Koch & Mail an kontakt@)` (`9debf567-7b15-4357-b9b8-fdee299cb008`) |
| **Kinder- & Elternanmeldung** | [`/events/kinder-und-eltern/`](https://xn--sprachcaf-j4a.org/events/kinder-und-eltern/) | `SprachCafé - Anmeldung Kinder & Eltern (Teams an Agata Koch & Mail an kontakt@)` (`abf220a8-f754-48e1-affb-953b9f22add3`) |
| **Kontaktformular** | [`/kontakt/`](https://xn--sprachcaf-j4a.org/kontakt/) | `SprachCafé - Kontaktanfrage (Teams an Agata Koch & Mail an kontakt@)` (`b63d0a2a-488b-41ca-a644-350254367840`) |
| **Ehrenamt & Praktikum** | [`/mitmachen/#ehrenamt`](https://xn--sprachcaf-j4a.org/mitmachen/#ehrenamt) | `SprachCafé - Ehrenamt & Praktikum (Teams an Agata Koch & Mail an kontakt@)` (`60637cba-a7a7-49e1-a798-6492094896e5`) |
| **Barriere melden** | [`/barrierefreiheit/`](https://xn--sprachcaf-j4a.org/barrierefreiheit/) | `SprachCafé - Barriere melden (Teams an Agata Koch & Mail an kontakt@)` (`6a671e20-63c7-4743-961a-91045c0b72cc`) |

---

## 📸 Authentische Medien & Bildmaterial

Sämtliche generischen Platzhalter und Stockfotos wurden vollständig durch authentische Fotos von der Vereinswebsite (`sprachcafe-polnisch.org`), Veranstaltungen, Bibliotheksbeständen und Teammitgliedern ersetzt:
- **Hero-Collage & Banner:** Realistische Aufnahmen aus den SprachCafé-Treffen in Pankow und Schöneberg.
- **Hausbibliothek:** Originalfoto des Bibliotheksraums in Schulzestr. 1 für Katalog und Detailansichten.
- **Team & Vorstand:** Echte Porträts aller Mitarbeiterinnen und ehrenamtlichen Helfer.
- **Ausstellungen & Galerie:** Dokumentierte Kunstwerke (z. B. Anna Krenz, Marta Wilk, Olga Basole, Tibor Jagielski).
- **Kleiner Laden & Shop:** Echte Fotos des Ladensortiments, Fairtrade-Kaffee, Speak-Dating-Karten und Taschen.

---

## 🛠️ Schnellstart & Lokale Entwicklung

### 1. Repository klonen & vorbereiten
```bash
git clone https://github.com/sprachcafe/sprachcafe-relaunch.git
cd sprachcafe-relaunch
```

### 2. Umgebungsvariablen einrichten
```bash
cp .env.example frontend/.env.production
```

### 3. Frontend lokal starten
```bash
cd frontend
npm install
npm run dev
```
Das Webportal ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

### 4. Formular-Flows & Webhooks testen
```bash
python3 scripts/test_all_form_webhooks.py
```

### 5. Production Build & Deployment
```bash
cd frontend
npm run build
# Synchronisation nach Web-Root
rsync -av --delete dist/ /var/www/production/
```

---

## 🌿 Branch-Strategie & Caddy-Routing

- **`main`** ➔ **`sprachcafé.org` & `sprachcafe-polnisch.org`** (Deployment nach `/var/www/production`)
- **`beta`** ➔ **`beta.sprachcafe-polnisch.org`** (Deployment nach `/var/www/beta`)
- **`feature/*` / `fix/*`**: Entwicklungs-Branches mit Pull Requests gegen `beta`.

---

## 📚 Wichtige Dokumentationen

- ⚡ [Power Automate Flows Dokumentation](docs/POWER_AUTOMATE_FLOW.md)
- 🔒 [DSGVO-Konzept & Datenschutz-by-Design](docs/DSGVO_KONZEPT.md)
- ♿ [Erklärung zur Barrierefreiheit](docs/ERKLAERUNG_BARRIEREFREIHEIT.md)
- 📋 [M365 Redaktions-Workflows](docs/M365_EDITORIAL_WORKFLOWS.md)
- 📅 [Google Kalender Audit & iCal Sync](docs/calendar-audit.md)
- 📖 [Architektur-Übersicht & Diagramme](docs/architecture/architecture-overview.md)
- 🚨 [Rollback-Prozedur (ROLLBACK.md)](docs/ROLLBACK.md)
