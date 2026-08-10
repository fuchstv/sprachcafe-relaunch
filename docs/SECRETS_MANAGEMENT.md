# Secrets Management & Sicherheitshandbuch

Dieses Dokument beschreibt die Klassifizierung, Speicherung und Absicherung aller Zugangsdaten, API-Tokens und Keys für den SprachCafé Relaunch.

---

## 🔒 Grundregel: Kein Secret im Repository!

> [!CAUTION]
> **Es dürfen NIEMALS vertrauliche Passwörter, AWS-Keys, SSH-Schlüssel oder Webhook-URLs im Git-Repository eingecheckt werden!**
> Alle sensiblen Werte sind strikt auf **GitHub Actions Secrets** (CI/CD) und die **lokale `.env` Datei auf dem Lightsail-Server** (`/opt/sprachcafe/infra/.env`) aufgeteilt.

---

## 📋 Übersicht der Secrets & Speicherorte

| Secret Name | Typ / Zweck | Speicherort | Zugriff scope |
|-------------|-------------|-------------|---------------|
| `LIGHTSAIL_SSH_KEY` | Private SSH-Schlüssel für Server-Deployments | **GitHub Actions Secrets** | CI/CD Pipeline (Deployment via rsync/SSH) |
| `LIGHTSAIL_HOST` | Öffentliche IP/Host der Lightsail-Instanz | **GitHub Actions Secrets** | CI/CD Pipeline |
| `LIGHTSAIL_USER` | SSH-Benutzer (`ubuntu`) | **GitHub Actions Secrets** | CI/CD Pipeline |
| `AWS_ACCESS_KEY_ID` | AWS IAM Key für S3 & Terraform CI | **GitHub Actions Secrets** | CI/CD & AWS Deployment Jobs |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Key | **GitHub Actions Secrets** | CI/CD & AWS Deployment Jobs |
| `AWS_REGION` | AWS Region (`eu-central-1`) | **GitHub Actions Secrets** / Server `.env` | CI/CD & Runtime |
| `CMS_SECRET` | Secret Key für JWT/Session-Verschlüsselung | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | Headless CMS Runtime Container |
| `CMS_ADMIN_EMAIL` | Administrator E-Mail für CMS | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | Headless CMS Initialisierung |
| `CMS_ADMIN_PASSWORD` | Administrator Passwort für CMS | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | Headless CMS Initialisierung |
| `DB_USER` | PostgreSQL Datenbanknutzer | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | CMS & Postgres Container |
| `DB_PASSWORD` | PostgreSQL Datenbankpasswort | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | CMS & Postgres Container |
| `DB_DATABASE` | PostgreSQL Datenbankname | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | CMS & Postgres Container |
| `POWER_AUTOMATE_MEMBER_WEBHOOK_URL` | Azure Logic Apps Webhook (Mitgliedsantrag) | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | CMS Formular-Handling Runtime |
| `POWER_AUTOMATE_EVENT_WEBHOOK_URL` | Azure Logic Apps Webhook (Veranstaltungen) | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | CMS Formular-Handling Runtime |
| `POWER_AUTOMATE_CONTACT_WEBHOOK_URL` | Azure Logic Apps Webhook (Kontaktformular) | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | CMS Formular-Handling Runtime |
| `POWER_AUTOMATE_LIBRARY_WEBHOOK_URL` | Azure Logic Apps Webhook (Hausbibliothek) | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | CMS Formular-Handling Runtime |
| `CMS_API_TOKEN` | Bearer Token für Astro Frontend ➔ CMS | **Server `.env` (`/opt/sprachcafe/infra/.env`)** | Astro Frontend SSR Runtime |

---

## 🛠️ Schutz- & Präventions-Mechanismen

Um versehentliche Commits von Zugangsdaten zu 100% zu verhindern, kommen **zwei automatisierte Schutzschichten** zum Einsatz:

### 1. Lokaler Git Pre-Commit Hook (`.githooks/pre-commit`)

Vor jedem `git commit` prüft ein lokaler Hook die gestageten Dateien auf charakteristische Secret-Muster (z.B. AWS Access Keys `AKIA...`, SSH Keys, Power Automate Signatures):

```bash
# Git Hooks im Repository installieren:
bash scripts/install-hooks.sh
```

Wird ein Secret entdeckt, bricht der Commit mit einer Fehlermeldung ab:
```
❌ ERROR: AWS Access Key ID detected in staged file: config/settings.py
🚨 COMMIT REJECTED: Hardcoded secrets found!
```

### 2. Automatisiertes Gitleaks CI Check (`.github/workflows/ci-cd.yml`)

Jeder Pull Request und Push auf `main` und `beta` durchläuft in der GitHub Actions Pipeline den Job `secret-scan` mit **Gitleaks**:

- Konfigurationsdatei: [`.gitleaks.toml`](../.gitleaks.toml)
- Bei Entdeckung eines Secrets schlägt die Pipeline sofort fehl, und ein Merge in `main` oder `beta` wird durch die Branch Protection Regeln blockiert.

---

## 📋 Best Practices für Entwickler

1. **Vorlage verwenden**: Nutze stets `.env.example` als Vorlage und trage echte Secrets nur in `.env` (lokal) oder `/opt/sprachcafe/infra/.env` (Server) ein.
2. **AWS Secrets Manager Integration**: In AWS-Umgebungen können Secrets zur Laufzeit sicher aufgelöst werden via:
   `{{resolve:secretsmanager:secret-id:SecretString:json-key}}`
3. **Emergency Rotation bei Secret Leak**:
   - AWS Keys in AWS IAM sofort deaktivieren & löschen.
   - Database Passwörter in `/opt/sprachcafe/infra/.env` und PostgreSQL ändern (`ALTER USER ... WITH PASSWORD ...`).
   - Webhook URLs in Azure Logic Apps neu generieren.
