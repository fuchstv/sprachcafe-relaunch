#!/usr/bin/env bash
# Automated SQLite Database Backup Script for SprachCafé Headless CMS
# Target Source: /opt/sprachcafe/cms-data/cms.db
# Backup Destination: /opt/sprachcafe/backups/

set -euo pipefail

DB_SOURCE="/opt/sprachcafe/cms-data/cms.db"
BACKUP_DIR="/opt/sprachcafe/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cms-db-backup-${TIMESTAMP}.sqlite"

echo "[$(date)] 📦 Starting Headless CMS SQLite Backup..."

# Ensure target directories exist
mkdir -p "${BACKUP_DIR}"

if [ ! -f "${DB_SOURCE}" ]; then
  echo "⚠️ Warning: Database file ${DB_SOURCE} does not exist yet. Staging empty backup directory."
  exit 0
fi

# Perform atomic SQLite backup if sqlite3 is installed, otherwise safe copy
if command -v sqlite3 >/dev/null 2>&1; then
  echo "Executing atomic sqlite3 backup..."
  sqlite3 "${DB_SOURCE}" ".backup '${BACKUP_FILE}'"
else
  echo "sqlite3 CLI not found, executing copy..."
  cp "${DB_SOURCE}" "${BACKUP_FILE}"
fi

# Gzip compress the backup to save disk space
gzip -f "${BACKUP_FILE}"
echo "✓ Backup created: ${BACKUP_FILE}.gz ($(du -h "${BACKUP_FILE}.gz" | cut -f1))"

# Prune backups older than 30 days
echo "Cleaning up backups older than 30 days..."
find "${BACKUP_DIR}" -type f -name "cms-db-backup-*.sqlite.gz" -mtime +30 -delete

echo "[$(date)] ✅ Headless CMS Backup Completed Successfully."
