# AWS Lightsail Server-Struktur & Rechte-Dokumentation

Dieses Dokument beschreibt die physische Ordnerstruktur, Verzeichnisrechte und die Abgrenzung zur bestehenden Hausbibliothek-Installation auf der AWS Lightsail-Instanz für den SprachCafé Relaunch.

---

## 1. Physische Ordnerstruktur unter `/opt/sprachcafe/`

Auf der AWS Lightsail-Instanz ist sämtliche Infrastruktur, Anwendungscode, Datenbank-Persistenz und Backup-Verwaltung unter dem zentralen Stammverzeichnis **`/opt/sprachcafe/`** organisiert:

```
/opt/sprachcafe/
├── infra/                  # Docker Compose, Caddyfile, Shell-Skripte & Systemd-Services
├── production/             # Production Web-Root (Astro Dist Output für sprachcafe-polnisch.org)
├── beta/                   # Beta/Staging Web-Root (Astro Dist Output für beta.sprachcafe-polnisch.org)
├── cms-data/               # Persistiertes PostgreSQL/CMS Datenverzeichnis (Docker Volume Mount)
└── backups/                # Tägliche automatisierte Backups
    ├── cms/                # PostgreSQL Dumps des Headless CMS
    └── hausbibliothek/     # Daten-Backups der Hausbibliothek
```

### Symlink-Kompatibilität (`/var/www`)

Zur Abwärtskompatibilität mit Standard-Webserver-Konfigurationen und Deployment-Skripten sind Symlinks in `/var/www/` eingerichtet:
- `/var/www/production` ➔ `/opt/sprachcafe/production`
- `/var/www/beta` ➔ `/opt/sprachcafe/beta`

---

## 2. Rechte-Matrix & Berechtigungs-Konzept

Um höchste Sicherheit und Stabilität zu gewährleisten, gelten strikte User-, Group- und Dateirechte:

| Pfad | Besitzer (`User`) | Gruppe (`Group`) | Berechtigung (`Octal`) | Zweck & Schreibrechte |
|------|-------------------|------------------|------------------------|-----------------------|
| `/opt/sprachcafe/infra` | `ubuntu` | `www-data` | `755` (`rwxr-xr-x`) | `ubuntu` darf Deployments & Compose ausführen, `www-data` liest Caddyfile. |
| `/opt/sprachcafe/production` | `ubuntu` | `www-data` | `775` (`rwxrwxr-x`) | Zielort für `rsync` Deployment via CI/CD. `www-data` (Caddy) liest Web-Assets. |
| `/opt/sprachcafe/beta` | `ubuntu` | `www-data` | `775` (`rwxrwxr-x`) | Zielort für Staging `rsync` Deployments. |
| `/opt/sprachcafe/cms-data` | `999` (`postgres`) | `999` (`postgres`) | `700` (`rwx------`) | Ausschließlich vom PostgreSQL Docker Container schreibbar. Für Host-User geschützt. |
| `/opt/sprachcafe/backups` | `ubuntu` | `ubuntu` | `750` (`rwxr-x---`) | Ausführungsziel für Cronjobs/Cron-Skripte (`pg_dump`). |

---

## 3. Abgrenzung zur bestehenden Hausbibliothek-Installation

Das SprachCafé Monorepo und die bestehende Hausbibliothek-Installation laufen im **isolierten Parallelbetrieb**:

```mermaid
graph TD
    subgraph Host System (AWS Lightsail)
        subgraph SprachCafé Relaunch (/opt/sprachcafe)
            SC_Infra["/opt/sprachcafe/infra"]
            SC_Prod["/opt/sprachcafe/production"]
            SC_Beta["/opt/sprachcafe/beta"]
            SC_CMSDB[("PostgreSQL DB (/opt/sprachcafe/cms-data)")]
            SC_Backup["/opt/sprachcafe/backups/cms"]
        end
        
        subgraph Hausbibliothek Installation (/opt/hausbibliothek)
            HB_Code["/opt/hausbibliothek/app"]
            HB_DB[("Hausbibliothek DB (/opt/hausbibliothek/data)")]
            HB_Backup["/opt/sprachcafe/backups/hausbibliothek"]
        end
    end
```

### Isolations-Garantien:
1. **Kein Pfad-Überschneiden**: Die Hausbibliothek ist unter `/opt/hausbibliothek/` installiert. Das Verzeichnis `/opt/sprachcafe/` berührt zu keinem Zeitpunkt Dateien der Hausbibliothek.
2. **Eigenständige Datenbank-Instanzen**: Der PostgreSQL-Container für das CMS nutzt `/opt/sprachcafe/cms-data` als Dedicated Mount point.
3. **Getrennte Backup-Verzeichnisse**: Backup-Dateien der Hausbibliothek werden isoliert in `/opt/sprachcafe/backups/hausbibliothek/` abgelegt, ohne den CMS-Backup-Prozess unter `/opt/sprachcafe/backups/cms/` zu beeinflussen.

---

## 4. Automatisierte Einrichtung (`infra/setup-lightsail.sh`)

Das Skript [`infra/setup-lightsail.sh`](../infra/setup-lightsail.sh) richtet die komplette Struktur und Berechtigungen auf einer frischen Lightsail-Instanz ein:

```bash
cd /opt/sprachcafe/infra
sudo bash setup-lightsail.sh
```
