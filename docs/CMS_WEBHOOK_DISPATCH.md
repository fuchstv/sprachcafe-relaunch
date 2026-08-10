# Headless CMS GitHub Actions Webhook Dispatch (`repository_dispatch`)

Dieses Dokument beschreibt die Konfiguration des Webhooks im Headless CMS. Bei jeder Veröffentlichung oder Änderung von Inhalten (Veranstaltungen, Blogbeiträge, Buchkatalog, Statische Seiten) sendet das CMS einen HTTP-POST-Request an GitHub Actions (`repository_dispatch`), um den automatischen Astro-Rebuild auszulösen.

---

## 📡 1. Webhook Konfiguration ([`cms/server.js`](../cms/server.js))

- **Trigger-Endpunkt**: `POST https://api.github.com/repos/:owner/:repo/dispatches`
- **Event Type**: `cms_publish`
- **Authentifizierung**: `Authorization: token ${GITHUB_PAT_TOKEN}`
- **Automatische Trigger**:
  - `POST /api/events` (Neue Veranstaltung veröffentlicht)
  - `POST /api/posts` (Neuer Blogbeitrag veröffentlicht)
  - `POST /api/books` (Neuer Katalogeintrag hinzugefügt)
  - `POST /api/webhook/trigger` (Manuelle Auslösung)

### Umgebungsvariablen (`.env` auf Server):
```env
GITHUB_REPO_OWNER=sprachcafe
GITHUB_REPO_NAME=sprachcafe-relaunch
GITHUB_PAT_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📦 2. GitHub Actions Workflow Trigger ([`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml))

Die GitHub Actions Workflow-Datei lauscht auf das `repository_dispatch` Event:

```yaml
on:
  push:
    branches: [ main, beta ]
  repository_dispatch:
    types: [ cms_publish ]
```

Wenn ein Redakteur im CMS einen Eintrag speichert, startet GitHub Actions automatisch den Build- und Deployment-Job:
1. `npx astro build`
2. `npx pagefind --site dist`
3. `rsync` Deployment auf den Server (`/var/www/production` bzw. `/var/www/beta`)

---

## 🧪 3. Verifikationstest (`scripts/test_cms_webhook.py`)

```bash
python3 scripts/test_cms_webhook.py
```

**Testergebnis**:
- HTTP Post an API: ✅ Event erstellt
- Payload Construction: ✅ `event_type: "cms_publish"` mit `client_payload: { collection, action, slug }`
- GitHub Dispatch URL: ✅ `https://api.github.com/repos/sprachcafe/sprachcafe-relaunch/dispatches`
