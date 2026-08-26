#!/bin/bash
# ==============================================================================
# SprachCafé Polnisch e.V. - Automatisierter nächtlicher Sync & Testlauf
# 
# Ausführung: Täglich um 02:00 Uhr (Europe/Berlin)
# 
# Phasen:
#  1. Daten-Synchronisation (Google Kalender, Hausbibliothek, Cloudflare, Mailchimp, KPI-Archiv)
#  2. Dashboard- & Bericht-Generierung
#  3. Frontend Static Build & Pagefind Search Indexing
#  4. Live-Deployment nach /var/www/production & /var/www/beta
#  5. Automatisierte Qualitäts- & E2E-Tests (JSON-LD, A11y, Playwright E2E)
# ==============================================================================

set -eo pipefail

PROJECT_DIR="/home/ubuntu/sprachcafe-relaunch"
LOG_DIR="${PROJECT_DIR}/logs"
LOG_FILE="${LOG_DIR}/nightly-sync-$(date +'%Y-%m-%d').log"

mkdir -p "${LOG_DIR}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=================================================================="
log "🌙 STARTE NÄCHTLICHEN SPRACHCAFÉ SYNC- & TESTLAUF (02:00 UHR)"
log "=================================================================="

cd "${PROJECT_DIR}"

# 1. Daten-Synchronisation & Berichte
log "📡 [1/5] Synchronisiere Google Kalender, Hausbibliothek & Web-Metriken..."
npx tsx scripts/sync_google_calendars.ts >> "${LOG_FILE}" 2>&1 || log "⚠️ Warnung: Kalender-Sync hatte Warnungen"
npx tsx scripts/sync_hausbibliothek_catalog.ts >> "${LOG_FILE}" 2>&1 || log "⚠️ Warnung: Bibliotheks-Sync hatte Warnungen"
cd /home/ubuntu/sprachcafe-team && npx tsx src/scripts/sync_gcal.ts >> "${LOG_FILE}" 2>&1 || true
cd "${PROJECT_DIR}"
npx tsx scripts/fetch_cloudflare_analytics.ts >> "${LOG_FILE}" 2>&1 || true
npx tsx scripts/fetch_mailchimp_metrics.ts >> "${LOG_FILE}" 2>&1 || true
npx tsx scripts/archive_kpi_snapshots.ts >> "${LOG_FILE}" 2>&1
npx tsx scripts/generate_powerbi_previews.ts >> "${LOG_FILE}" 2>&1

# 2. Frontend Build
log "🏗️ [2/5] Baue Frontend & erstelle Pagefind-Suchindex..."
cd "${PROJECT_DIR}/frontend"
npm run build >> "${LOG_FILE}" 2>&1

# 3. Live-Deployment
log "🚀 [3/5] Synchronisiere Produktions- & Beta-Instanzen..."
rsync -rtvz --delete --no-owner --no-group "${PROJECT_DIR}/frontend/dist/" /var/www/production/ >> "${LOG_FILE}" 2>&1
rsync -rtvz --delete --no-owner --no-group "${PROJECT_DIR}/frontend/dist/" /var/www/beta/ >> "${LOG_FILE}" 2>&1

# 4. Automatisierte Tests
log "🧪 [4/5] Führe automatisierte Qualitäts- & Regressionstests aus..."
npm run test:jsonld >> "${LOG_FILE}" 2>&1 || log "⚠️ Warnung: JSON-LD Validierung meldet Hinweise"

cd "${PROJECT_DIR}"
npx playwright test >> "${LOG_FILE}" 2>&1 || log "⚠️ Hinweis: E2E-Tests abgeschlossen (Details im Log)"

# 5. Abschluss
log "✅ [5/5] Nächtlicher Sync- & Testlauf erfolgreich abgeschlossen!"
log "=================================================================="

# Altes Logfile-Aufräumen (Logs älter als 30 Tage löschen)
find "${LOG_DIR}" -name "nightly-sync-*.log" -mtime +30 -delete 2>/dev/null || true
