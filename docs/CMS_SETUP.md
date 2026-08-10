# Headless CMS Docker Setup & SQLite Database Configuration

Dieses Dokument beschreibt die Einrichtung und den Betrieb des Node.js Headless CMS für den SprachCafé Polnisch Relaunch.

---

## ⚡ 1. Architektur & RAM-Optimierung (2 GB Lightsail Host)

- **Engine**: Node.js 20 Container (`sprachcafe_cms`)
- **Port**: `3000` (wird via Caddy Proxy für `admin.sprachcafe-polnisch.org` geroutet)
- **Datenbank**: **Embedded SQLite 3** (Persistiert im SSD-Volume `/opt/sprachcafe/cms-data/cms.db`)
- **Begründung**: Auf der 2 GB Instanz läuft für die Hausbibliothek bereits ein eigenen MySQL 8.0 Container. Die Nutzung von SQLite verhindert einen zweiten RDBMS-Serverprozess (PostgreSQL) und spart ~250 MB RAM ein.

---

## 🔒 2. Authentifizierung & Token-Sicherheit

- **Token-Auth**: Admin-Anfragen nutzen JWT-Token (JSON Web Token), ausgestellt über `/api/auth/login`.
- **Secret**: Konfiguriert über `CMS_ADMIN_SECRET` in der Server-`.env` Datei.
- **Admin Endpunkte**:
  - `POST /api/auth/login`: Authentifizierung mit Benutzername & Passwort.
  - `GET /api/auth/me`: Validierung des Bearer-Tokens.
  - `GET/POST /api/events`, `/api/posts`, `/api/books`: Collections APIs.

---

## 💾 3. Automatisierte SQLite-Datenbank-Backups

Das Backup-Skript [`scripts/backup_cms_db.sh`](../scripts/backup_cms_db.sh) führt atomare Sicherungen der SQLite-Datenbank durch.

### Cronjob Konfiguration (Täglich um 02:00 Uhr):
```bash
0 2 * * * /home/ubuntu/sprachcafe-relaunch/scripts/backup_cms_db.sh >> /var/log/cms-backup.log 2>&1
```

- **Zielverzeichnis**: `/opt/sprachcafe/backups/`
- **Komprimierung**: `gzip` (Kompaktierte Aufbewahrung)
- **Retention Policy**: Automatische Bereinigung von Sicherungen, die älter als 30 Tage sind.
