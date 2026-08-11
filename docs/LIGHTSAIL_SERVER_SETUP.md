# AWS Lightsail Server-Struktur & Rechte-Dokumentation

Dieses Dokument beschreibt die physische Ordnerstruktur, Verzeichnisrechte, den dedizierten Deploy-User und die Abgrenzung zur bestehenden Hausbibliothek-Installation auf der AWS Lightsail-Instanz für den SprachCafé Relaunch.

---

## 1. Physische Ordnerstruktur unter `/opt/sprachcafe/` & `/var/www/`

Auf der AWS Lightsail-Instanz ist sämtliche Infrastruktur, Anwendungscode, Datenbank-Persistenz und Backup-Verwaltung unter dem zentralen Stammverzeichnis **`/opt/sprachcafe/`** (bzw. `/var/www/`) organisiert:

```
/var/www/ (bzw. /opt/sprachcafe/)
├── production/             # Production Web-Root (Astro Dist Output für sprachcafe-polnisch.org)
├── beta/                   # Beta/Staging Web-Root (Astro Dist Output für beta.sprachcafe-polnisch.org)
├── infra/                  # Docker Compose, Caddyfile, Shell-Skripte & Systemd-Services
├── cms-data/               # Persistiertes PostgreSQL/CMS Datenverzeichnis (Docker Volume Mount)
└── backups/                # Tägliche automatisierte Backups
```

---

## 2. Dedizierter Deploy-User & Rechte-Matrix

Für automatische CI/CD-Deployments (via GitHub Actions) ist ein **dedizierter Systemnutzer `deploy`** eingerichtet.

### 🛡️ Sicherheits-Garantien des Deploy-Users:
1. **Keine Sudo-Rechte (`NO SUDO`)**: Der Benutzer `deploy` hat **keinerlei Sudo-Berechtigungen** und kann keine Systemkonfigurationen verändern.
2. **Isolierte Schreibrechte**: `deploy` besitzt exklusive Schreibrechte auf `/var/www/production` und `/var/www/beta`.
3. **Kein Zugriff auf sensible System- und DB-Pfade**: `deploy` hat keinen Lese- oder Schreibzugriff auf `/etc/shadow`, `/opt/sprachcafe/cms-data` oder private SSH-Keys anderer Benutzer.

### 📊 Rechte-Matrix:

| Pfad / Ressource | Besitzer (`User`) | Gruppe (`Group`) | Berechtigung (`Octal`) | Zweck & Schreibrechte |
|---|---|---|---|---|
| `/var/www/production` | **`deploy`** | `www-data` | `775` (`rwxrwxr-x`) | Zielort für `rsync` Production Deployment via CI/CD. |
| `/var/www/beta` | **`deploy`** | `www-data` | `775` (`rwxrwxr-x`) | Zielort für `rsync` Staging Deployment via CI/CD. |
| `/home/deploy/.ssh/authorized_keys` | `deploy` | `deploy` | `600` (`rw-------`) | Hinterlegter Public Key für GitHub Actions SSH-Zugriff. |
| `/opt/sprachcafe/infra` | `ubuntu` | `www-data` | `755` (`rwxr-xr-x`) | `ubuntu` führt Docker Compose aus, `www-data` liest Caddyfile. |
| `/opt/sprachcafe/cms-data` | `ubuntu` | `ubuntu` | `700` (`rwx------`) | *(Verworfenes Headless-CMS; Ordner/Volume kann auf dem Server mit `sudo rm -rf /opt/sprachcafe/cms-data` gelöscht werden)* |

---

## 🔑 3. SSH Public Key des Deploy-Users

Der öffentliche Schlüssel des `deploy`-Users ist in `/home/deploy/.ssh/authorized_keys` hinterlegt:

```ssh-ed25519
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPoRUg/fETFqYPLl21NRgwjAmcAFKrL0H5RKNRVdt+v1 deploy-user-github-actions
```

### Einrichtung des Private Keys in GitHub Actions Secrets:
1. Den privaten Schlüssel (`/home/deploy/.ssh/id_ed25519_deploy`) auf dem Server kopieren.
2. Auf GitHub im Repository unter **Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret** eintragen:
   - **Secret Name**: `LIGHTSAIL_SSH_KEY`
   - **Secret Value**: Den vollständigen Inhalt von `id_ed25519_deploy` (inkl. `-----BEGIN OPENSSH PRIVATE KEY-----`).
   - **Secret Name**: `LIGHTSAIL_USER` ➔ `deploy`
   - **Secret Name**: `LIGHTSAIL_HOST` ➔ `3.66.205.213` (bzw. `beta.sprachcafe-polnisch.org`)

---

## 🧪 4. Test des rsync-Zugriffs (Verifiziert)

Der `rsync`-Zugriff über den dedizierten SSH-Key des `deploy`-Users wurde empirisch getestet:

```bash
# Test-Datei übertragen nach Staging:
rsync -avz -e "ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no" /tmp/test-file.txt deploy@localhost:/var/www/beta/

# Test-Datei übertragen nach Production:
rsync -avz -e "ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no" /tmp/test-file.txt deploy@localhost:/var/www/production/
```

**Ergebnis**: `sent 194 bytes received 35 bytes` (Exit Code 0). Beide Verzeichnisse lassen sich ohne Sudo-Rechte über den Deploy-User beschreiben.

---

## 5. Abgrenzung zur bestehenden Hausbibliothek-Installation

Das SprachCafé Monorepo und die bestehende Hausbibliothek-Installation laufen im **isolierten Parallelbetrieb**:

```mermaid
graph TD
    subgraph Host System (AWS Lightsail)
        subgraph SprachCafé Relaunch (/var/www)
            SC_Prod["/var/www/production (User: deploy)"]
            SC_Beta["/var/www/beta (User: deploy)"]
            SC_CMSDB[("PostgreSQL DB (/opt/sprachcafe/cms-data)")]
        end
        
        subgraph Hausbibliothek Installation (/opt/hausbibliothek)
            HB_Code["/opt/hausbibliothek/app"]
            HB_DB[("Hausbibliothek DB (/opt/hausbibliothek/data)")]
        end
    end
```
