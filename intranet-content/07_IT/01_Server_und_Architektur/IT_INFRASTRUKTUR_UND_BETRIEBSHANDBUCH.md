# 🏛️ SprachCafé Polnisch e.V. – IT-Infrastruktur & Betriebshandbuch

> **Status:** Gültig & Geprüft (Stand: 2026)  
> **Mandant / Tenant:** `b745a80a-f682-45e4-ba2e-d48bbd9e703d` (`sprachcafepolnisch.onmicrosoft.com`)  
> **Server-Infrastruktur:** AWS EC2 Ubuntu 24.04 LTS (`eu-central-1`, IP: `3.66.205.213`)  
> **Zweck:** Single Source of Truth für alle Systemadministratoren, Entwickler und den Vereinsvorstand.

---

## 📑 Inhaltsverzeichnis
1. [Gesamtarchitektur & Systemübersicht](#1-gesamtarchitektur--systemübersicht)
2. [Server- & Reverse-Proxy-Infrastruktur (AWS EC2 & Caddy)](#2-server--reverse-proxy-infrastruktur-aws-ec2--caddy)
3. [Applikations- & Datenbank-Landschaft](#3-applikations--datenbank-landschaft)
4. [Backup-Strategie & Offsite S3-Synchronisation](#4-backup-strategie--offsite-s3-synchronisation)
5. [Microsoft 365, SharePoint Intranet & Power Automate](#5-microsoft-365-sharepoint-intranet--power-automate)
6. [Domain-, DNS- & SSL-Zertifikatsverwaltung](#6-domain--dns--ssl-zertifikatsverwaltung)
7. [Sicherheit, Port-Hardening & DSGVO-Compliance](#7-sicherheit-port-hardening--dsgvo-compliance)
8. [Disaster Recovery & Notfall-Runbooks](#8-disaster-recovery--notfall-runbooks)
9. [CLI-Bereitstellung der SharePoint-Struktur](#9-cli-bereitstellung-der-sharepoint-struktur)

---

## 1. Gesamtarchitektur & Systemübersicht

```mermaid
flowchart TD
    subgraph Clients [🌐 Externe & Interne Nutzer]
        PublicUser["Öffentliche Besucher"]
        TeamUser["Team & Ehrenamtliche"]
        AdminUser["Vorstand & IT-Admin"]
    end

    subgraph DNS [🌍 DNS & Routing]
        Cloudflare["Cloudflare / Strato DNS"]
    end

    subgraph AWS [☁️ AWS Cloud (eu-central-1)]
        subgraph EC2 ["🖥️ EC2 Server (3.66.205.213)"]
            Caddy["🔒 Caddy 2 Reverse Proxy<br>(Port 80/443, Auto-TLS)"]
            
            Caddy -->|/| AstroProd["🏠 Haupt-Website (Astro 5 SSG)<br>/var/www/production"]
            Caddy -->|beta.| AstroBeta["🧪 Staging (Astro SSG)<br>/var/www/beta"]
            Caddy -->|hausbibliothek.org| PHPBackend["📚 Hausbibliothek (PHP 8.4)<br>SQLite WAL Database"]
            Caddy -->|team.| TeamApp["📅 Dienstplan (Node.js Express :3200)<br>SQLite WAL Database"]
            Caddy -->|kurse.| KurseApp["🎓 Kurse (Node.js Fastify :3300)<br>SQLite Database"]
            Caddy -->|newsletter.| Listmonk["✉️ Newsletter (Listmonk Go :9000)<br>PostgreSQL 17 Database"]
            
            Cron["⏱️ Systemd Backup Cron<br>backup_db.sh"] -->|Atomic Backup| S3Bucket
        end
        
        S3Bucket["🗄️ AWS S3 (sprachcafe-backups-secure)<br>Verschlüsselt, 30 Tage Retention"]
    end

    subgraph M365 ["🏢 Microsoft 365 Tenant (sprachcafepolnisch)"]
        Caddy -->|intranet.sprachcafé.org (302)| SPIntranet["🏠 SharePoint Intranet Hub<br>/sites/intranet"]
        SPIntranet --> SPVorstand["🔒 Vorstand & Finanzen"]
        SPIntranet --> SPStandorte["📍 Standorte & Betrieb"]
        SPIntranet --> SPKurse["🎓 Dozierende & Kurse"]
        SPIntranet --> SPKultur["🎨 Kultur & Events"]
        
        Forms["✍️ MS Forms"] --> Flow["⚡ Power Automate"]
        Flow -->|Webhooks| Caddy
    end

    PublicUser --> DNS --> Caddy
    TeamUser --> DNS --> Caddy
    AdminUser --> DNS --> Caddy
```

---

## 2. Server- & Reverse-Proxy-Infrastruktur (AWS EC2 & Caddy)

### 2.1 Host-Spezifikationen
- **Instanz:** AWS EC2 `t3.small` / `t4g.small` (Ubuntu 24.04 LTS)
- **Öffentliche IPv4:** `3.66.205.213`
- **Region:** `eu-central-1` (Frankfurt am Main, DSGVO-konform)
- **Arbeitsspeicher (RAM):** 1.9 GB (Peak RSS < 1.1 GB durch schlanke SQLite-Architektur)
- **Webserver / Reverse Proxy:** Dockerized Caddy 2 (`caddy`) im Bridge-Netzwerk

### 2.2 Domain-Routing-Tabelle in Caddy

| Domain / Subdomain | Ziel-Pfad / Upstream | Auth / Schutz | Funktion |
| :--- | :--- | :--- | :--- |
| `sprachcafé.org` (`xn--sprachcaf-j4a.org`) | `/var/www/production` | Öffentlich | Offizielle Vereinswebsite (Astro SSG) |
| `beta.sprachcafe-polnisch.org` | `/var/www/beta` | `noindex, nofollow` | Staging & Review für Designer & Team |
| `hausbibliothek.org` | `backend:80` (PHP 8.4 Apache) | Öffentlich / API-Token | Buchkatalog & Ausleihverwaltung |
| `team.sprachcafé.org` | `172.18.0.1:3200` | Intern / SSO | Schicht- & Dienstplanverwaltung |
| `kurse.sprachcafé.org` | `172.18.0.1:3300` | Intern / JWT | Sprachkurs-Verwaltung |
| `newsletter.sprachcafé.org` | `172.18.0.1:9000` | Admin Basic Auth | Listmonk Newsletter-Verwaltung |
| `intranet.sprachcafé.org` | 302 Redirect auf SharePoint | Entra ID / M365 SSO | Vanity-URL für das Mitarbeiter-Intranet |

---

## 3. Applikations- & Datenbank-Landschaft

### 3.1 Übersicht der Datenspeicher

```text
📁 /home/ubuntu/
├── 📚 minimalist_home_library/backend/data/database.sqlite  ➔ Hausbibliothek (Bücher, Ausleihen, Nutzer)
├── 📅 sprachcafe-team/data/dienstplan.db                   ➔ Dienstplan & Schichten (SQLite WAL)
├── 🎓 sprachcafe-kurse/data/kurse.db                       ➔ Kursangebote & Teilnahmen (SQLite)
├── ✉️ listmonk/ (PostgreSQL 17 Container: listmonk_db)      ➔ Newsletter-Abonnenten & Kampagnen
└── 🌐 sprachcafe-relaunch/                                 ➔ Astro SSG Quellcode & Build-Pipeline
```

### 3.2 Datenbank-Konfigurations-Standards
- **SQLite WAL-Modus (Write-Ahead Logging):**
  ```sql
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
  ```
- **Vorteil:** Ermöglicht parallele Lesezugriffe ohne Locks, extrem geringer RAM-Footprint (<15 MB vs. >400 MB bei MySQL).

---

## 4. Backup-Strategie & Offsite S3-Synchronisation

### 4.1 Backup-Architektur ([`/home/ubuntu/backups/backup_db.sh`](file:///home/ubuntu/PROJECT.md#L21-L24))
Das automatisierte Backup-Skript läuft täglich per Cronjob und führt folgende Schritte atomar aus:

1. **Hausbibliothek SQLite:** Online Backup API (`sqlite3 ".backup '...'"`), kein Sperren der Datenbank.
2. **Dienstplan SQLite:** Online Backup API mit WAL-Konsolidierung.
3. **Listmonk PostgreSQL:** `pg_dump -U listmonk listmonk | gzip`.
4. **Kompression & Archivierung:** GZIP-Archive in `/home/ubuntu/backups/archives/` mit Zeitstempel.
5. **30-Tage Retention:** Automatische Bereinigung lokaler Archive älter als 30 Tage.
6. **Offsite S3 Sync:** Verschlüsselte Synchronisation nach `s3://sprachcafe-backups-secure/` via IAM Role.

---

## 5. Microsoft 365, SharePoint Intranet & Power Automate

### 5.1 Mandant & Hub-Architektur
- **M365 Tenant ID:** `b745a80a-f682-45e4-ba2e-d48bbd9e703d`
- **Hub Site:** `https://sprachcafepolnisch.sharepoint.com/sites/intranet`
- **Corporate Color:** `#8B263E` (SprachCafé Weinrot)

```text
🏠 SharePoint Intranet Hub (/sites/intranet)
├── 🔒 Vorstand & Finanzen (/sites/vorstand-finanzen) [Streng Vertraulich]
├── 📍 Standorte & Betrieb (/sites/standorte-betrieb) [Pankow, Schöneberg, Köpenick]
├── 🎓 Dozierende & Kurse (/sites/dozierende-kurse)
├── 🎨 Kultur & Galerie (/sites/kultur-events)
└── 📦 Vorlagencenter & Formulare (/sites/intranet/Vorlagencenter)
```

### 5.2 Rollen- & Berechtigungsmatrix (Entra ID Sicherheitsgruppen)

| Sicherheitsgruppe | Hub Site | Vorstand & Finanzen | Standorte & Betrieb | Dozierende & Kurse | Kultur & Events |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SG-SprachCafe-Vorstand` | Vollzugriff | Vollzugriff | Vollzugriff | Vollzugriff | Vollzugriff |
| `SG-SprachCafe-Standortleitung` | Lesen/Schreiben | Kein Zugriff | Vollzugriff | Lesen/Schreiben | Lesen/Schreiben |
| `SG-SprachCafe-Dozierende` | Lesen | Kein Zugriff | Lesen | Vollzugriff | Lesen |
| `SG-SprachCafe-Ehrenamtliche` | Lesen | Kein Zugriff | Schichtplan-Schreiben | Lesen | Lesen/Schreiben |

---

## 6. Domain-, DNS- & SSL-Zertifikatsverwaltung

### 6.1 DNS-Einträge
- **A-Record `@` / `www`:** `3.66.205.213` (Gepointet auf EC2 Server)
- **CNAME `beta`:** `3.66.205.213` (Staging-Subdomain)
- **CNAME `intranet`:** `3.66.205.213` (Wird von Caddy auf SharePoint 302-weitergeleitet)
- **CNAME `hausbibliothek`:** `3.66.205.213`
- **MX Records:** Microsoft 365 Exchange (`sprachcafepolnisch-org.mail.protection.outlook.com`)

### 6.2 SSL/TLS-Zertifikate
- Caddy verwaltet TLS-Zertifikate vollautomatisch via **ACME (Let's Encrypt / ZeroSSL)**.
- Automatische Erneuerung alle 60 Tage ohne manuellen Eingriff.

---

## 7. Sicherheit, Port-Hardening & DSGVO-Compliance

1. **Port-Hardening:**
   - Nur Ports `80` (HTTP -> HTTPS Redirect) und `443` (HTTPS) sind öffentlich erreichbar.
   - Datenbankports (`3306`, `5432`) sind **nicht** an `0.0.0.0` gebunden, sondern nur über interne Docker-Netzwerke erreichbar.
   - CUPS Druckerdienste (`631`) und alte Admin-Ports (`8080`) sind dauerhaft deaktiviert.
2. **DSGVO & Datenschutz:**
   - Automatische Löschung/Anonymisierung abgelaufener Formular- und Reservierungsdaten über nächtliche Cronjobs (`dsgvo_cleanup.php`).
   - Keine Speicherung sensibler Passwörter im Klartext (Bcrypt `$2a$14$` Hash).

---

## 8. Disaster Recovery & Notfall-Runbooks

### 🚨 Runbook 1: Server-Neustart / Reboot Recovery
Falls der EC2-Server neu gestartet wurde:
```bash
# 1. Status prüfen
docker ps -a
sudo systemctl status caddy

# 2. Docker-Container neu starten
cd /home/ubuntu/minimalist_home_library && docker compose -f docker-compose.prod.yml up -d
cd /home/ubuntu/listmonk && docker compose up -d

# 3. Node.js Backend-Services prüfen
pm2 status || systemctl status sprachcafe-team sprachcafe-kurse
```

---

### 🚨 Runbook 2: Datenbank-Wiederherstellung aus S3
Falls eine Datenbank beschädigt wurde oder Daten versehentlich gelöscht wurden:
```bash
# 1. Letzten Snapshot aus S3 herunterladen
aws s3 sync s3://sprachcafe-backups-secure/ /home/ubuntu/backups/restore/

# 2. Hausbibliothek wiederherstellen (Dienst kurz stoppen)
docker stop library_backend
cp /home/ubuntu/backups/restore/hausbibliothek_latest.sqlite /home/ubuntu/minimalist_home_library/backend/data/database.sqlite
sudo chown www-data:www-data /home/ubuntu/minimalist_home_library/backend/data/database.sqlite
docker start library_backend

# 3. Datenintegrität prüfen
sqlite3 /home/ubuntu/minimalist_home_library/backend/data/database.sqlite "PRAGMA integrity_check;"
```

---

### 🚨 Runbook 3: Caddy SSL-Erneuerung & Zertifikats-Reset
Falls ein Zertifikat abgelaufen ist oder Caddy blockiert:
```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
# Bei hartem Fehler: Container neu starten
docker restart caddy
```

---

### 🚨 Runbook 4: Frontend Rollback auf vorherigen Stand
Falls ein fehlerhaftes Release auf Produktion (`sprachcafé.org`) gelandet ist:
```bash
cd /home/ubuntu/sprachcafe-relaunch
git log -n 5 --oneline
# Rollback auf Commit-Hash
git checkout <COMMIT_HASH>
npm run build --prefix frontend
rsync -rtv --delete frontend/dist/ /var/www/production/
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## 9. CLI-Bereitstellung der SharePoint-Struktur

Zur automatisierten Bereitstellung der Bibliotheken, Ordner und Metadaten im Microsoft 365 Tenant stehen zwei Skripte zur Verfügung:

1. **TypeScript CLI Skript (Plattformunabhängig):**  
   [`scripts/provision_sharepoint_it_structure.ts`](file:///home/ubuntu/sprachcafe-relaunch/scripts/provision_sharepoint_it_structure.ts)
   ```bash
   npx ts-node scripts/provision_sharepoint_it_structure.ts --dry-run
   ```

2. **PowerShell Core Skript (PnP / Graph):**  
   [`scripts/provision_sharepoint_it_structure.ps1`](file:///home/ubuntu/sprachcafe-relaunch/scripts/provision_sharepoint_it_structure.ps1)
   ```powershell
   pwsh scripts/provision_sharepoint_it_structure.ps1 -DryRun
   ```
