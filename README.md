# SprachCafé Relaunch - Monorepo

Willkommen im zentralen Repository für den Relaunch der SprachCafé Webplattform. Dieses Repository vereint das Frontend, das Headless CMS, die Infrastruktur-Skripte sowie sämtliche Dokumentationen und CI/CD-Pipelines in einer übersichtlichen Monorepo-Struktur.

---

## 📁 Ordnerstruktur & Phasenübersicht

Die Ordnerstruktur ist gemäß den Projektphasen aufgeteilt:

```
sprachcafe-relaunch/
├── frontend/             # [Phase 2] Astro-Projekt (Modernes, performantes Frontend)
├── cms/                  # [Phase 4] Headless-CMS-Konfiguration, Collections & Docker-Setup
├── infra/                # [Phase 1] Caddyfile, docker-compose.yml, Terraform/AWS-Skripte
├── scripts/              # [Phase 6] Migrationsskripte für WordPress & Hausbibliothek
├── .github/              # [Phase 7] CI/CD-Pipelines & Repository-Konfiguration
│   ├── workflows/        # GitHub Actions Automation Pipelines (Build, Test, Deploy)
│   └── CODEOWNERS        # Codeowners-Zuordnungen für Teams & Komponenten
├── docs/                 # Zentrale Dokumentation
│   ├── README.md         # Übersicht der Dokumentation & Phasen
│   ├── ROLLBACK.md       # Notfallprozedur & Rollback-Strategien
│   ├── architecture/     # Architekturdiagramme & Systemflüsse
│   └── decisions/        # Architecture Decision Records (ADRs)
├── .gitignore            # Git Ignore Regeln (Node, Docker, Secrets, Build Artifacts)
├── .env.example          # Beispiel-Umgebungsvariablen (AWS, CMS, DB, Power Automate)
└── README.md             # Projekt-Dokumentation (diese Datei)
```

---

## 🛠️ Schnellstart & Lokale Entwicklung

### 1. Repository klonen & vorbereiten
```bash
git clone https://github.com/sprachcafe/sprachcafe-relaunch.git
cd sprachcafe-relaunch
```

### 2. Umgebungs-Variablen einrichten
Erstellen Sie eine lokale `.env` Datei auf Basis der Vorlage:
```bash
cp .env.example .env
```
Bearbeiten Sie `.env` und tragen Sie die erforderlichen Zugangsdaten ein (z. B. Datenbankpasswörter, Power Automate Webhook URLs, AWS Keys).

### 3. Gesamtes System via Docker starten (Empfohlen)
Um Frontend, Headless CMS, PostgreSQL und den Caddy Reverse Proxy lokal zu starten:
```bash
cd infra
docker-compose up -d
```
Anwendungen sind erreichbar unter:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Headless CMS Admin**: [http://localhost:8055](http://localhost:8055)
- **Reverse Proxy**: [http://localhost](http://localhost)

---

## 🔑 Umgebungsvariablen (`.env.example`)

Die Konfiguration erfolgt zentral über Umgebungsvariablen. Wichtige Kategorien:

- **Headless CMS & DB**: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `CMS_SECRET`
- **AWS Cloud Storage**: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_MEDIA`
- **Power Automate Webhooks**:
  - `POWER_AUTOMATE_MEMBER_WEBHOOK_URL` (Mitgliedsanträge)
  - `POWER_AUTOMATE_EVENT_WEBHOOK_URL` (Veranstaltungsanmeldungen)
  - `POWER_AUTOMATE_CONTACT_WEBHOOK_URL` (Kontaktformular)
  - `POWER_AUTOMATE_LIBRARY_WEBHOOK_URL` (Hausbibliothek Buchreservierung)
- **Frontend**: `PUBLIC_ASTRO_SITE_URL`, `PUBLIC_CMS_API_URL`, `CMS_API_TOKEN`

---

## 🌿 Branch-Strategie & Caddy-Routing

Das Repository nutzt eine strikte Branching-Strategie, die direkt mit den Server-Verzeichnissen und dem Caddy Reverse Proxy gekoppelt ist:

- **`main`** ➔ **`sprachcafe-polnisch.org`** (Deployment nach `/var/www/production`)
  - **Branch Protection**: Geschützt! Direkte Pushes sind blockiert. Änderungen sind nur via Pull Request mit mindestens 1 approving Review und bestandenen CI-Status-Checks erlaubt.
- **`beta`** ➔ **`beta.sprachcafe-polnisch.org`** (Deployment nach `/var/www/beta`)
  - Integration und Testung neuer Funktionen vor dem Release auf `main`.
- **`feature/*` / `fix/*`**: Entwicklungs-Branches, die über Pull Requests in `beta` und anschließend via PR in `main` gemergt werden.

Details und Konfigurationen finden Sie in der [Branch-Strategie Dokumentation](docs/BRANCHING_STRATEGY.md) und der JSON-Konfigurationsdatei [`.github/branch-protection.json`](.github/branch-protection.json).

---

## 🖥️ Lightsail Server-Struktur (`/opt/sprachcafe/`)

Auf der AWS Lightsail-Instanz ist die Anwendung unter **`/opt/sprachcafe/`** strukturiert:

- **`/opt/sprachcafe/infra`**: Docker Compose, Caddyfile, Shell-Skripte (`setup-lightsail.sh`)
- **`/opt/sprachcafe/production`**: Web-Root für Production (Symlink: `/var/www/production`)
- **`/opt/sprachcafe/beta`**: Web-Root für Beta/Staging (Symlink: `/var/www/beta`)
- **`/opt/sprachcafe/cms-data`**: Persistiertes PostgreSQL Datenverzeichnis (`700`, `999:999`)
- **`/opt/sprachcafe/backups`**: Täglicher Backup-Speicherort (`cms/` & `hausbibliothek/`)

Vollständige Details zu Verzeichnisrechten und Isolierung finden Sie in [docs/LIGHTSAIL_SERVER_SETUP.md](docs/LIGHTSAIL_SERVER_SETUP.md).

---

## 👥 CODEOWNERS & Verantwortlichkeiten

Die Datei [`.github/CODEOWNERS`](.github/CODEOWNERS) regelt die Zuständigkeiten im Monorepo:

- **`/infra/`**: `@sprachcafe/devops-team`, `@sprachcafe/lead-dev`
- **`/frontend/`**: `@sprachcafe/frontend-team`
- **`/cms/`**: `@sprachcafe/backend-team`, `@sprachcafe/cms-admin`
- **`/scripts/`**: `@sprachcafe/backend-team`
- **`/.github/workflows/`**: `@sprachcafe/devops-team`, `@sprachcafe/lead-dev`
- **`/docs/`**: `@sprachcafe/lead-dev`, `@sprachcafe/dev-team`

---

## 📚 Dokumentation & Notfall-Prozeduren

- 🔒 [Secrets Management & Sicherheitshandbuch](docs/SECRETS_MANAGEMENT.md)
- 🖥️ [Lightsail Server-Struktur & Rechte-Matrix](docs/LIGHTSAIL_SERVER_SETUP.md)
- 🌿 [Branch-Strategie & Deployment-Pipeline](docs/BRANCHING_STRATEGY.md)
- 📖 [Architektur-Übersicht & Diagramme](docs/architecture/architecture-overview.md)
- 🚨 [Rollback-Prozedur (ROLLBACK.md)](docs/ROLLBACK.md)
- 📝 [Entscheidungsprotokoll Monorepo (ADR 0001)](docs/decisions/0001-monorepo-structure.md)

---

## 🚀 CI/CD & Deployment (Phase 7)

Mit jedem Push oder Pull Request auf **`main`** oder **`beta`** werden automatische Checks ausgeführt ([`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)):

1. **Lint & Build**: Astro Frontend Build & Typecheck
2. **Infrastructure Validation**: Terraform & Caddyfile Syntax-Prüfung
3. **Automated Deployments**:
   - Push auf `beta` ➔ Automatisiertes Deployment nach `/var/www/beta` (`beta.sprachcafe-polnisch.org`)
   - Push auf `main` (via PR) ➔ Automatisiertes Deployment nach `/var/www/production` (`sprachcafe-polnisch.org`)

