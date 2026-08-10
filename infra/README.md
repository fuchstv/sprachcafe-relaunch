# Phase 1: Infrastructure Setup (`/infra`)

Dieses Verzeichnis enthält sämtliche Konfigurationen und Skripte für die Infrastruktur des SprachCafé Relaunchs.

## Inhalte

- `Caddyfile`: Dual Reverse-Proxy & SSL Configuration (`sprachcafe-polnisch.org` & `beta.sprachcafe-polnisch.org`).
- `docker-compose.yml`: Multi-Container Docker-Setup bestehend aus:
  - **Caddy**: Webserver & SSL Proxy
  - **CMS**: Headless CMS (Node.js App mit eingebetteter SQLite-Datenbank)
  - **Frontend**: Astro Frontend Web-Application
- `mysql-tuning.cnf`: Memory-Tuning Konfigurationsdatei für den Hausbibliothek MySQL 8.0 Container (`innodb_buffer_pool_size = 128M`).
- `setup-lightsail.sh`: Automatisierungsskript zur Erstellung der Pfadstruktur unter `/opt/sprachcafe/` und Berechtigungen.
- `terraform/`: Terraform-Skripte zur Bereitstellung der AWS-Ressourcen (S3 Media Buckets, Backup Storage).

---

## 💾 Swap-Speicher Konfiguration (2 GB Lightsail Host)

Zur Vermeidung von Out-of-Memory (OOM) Situationen auf der 2-GB-Instanz wurde eine **2 GB Swap-Datei** unter `/swapfile` angelegt und in `/etc/fstab` verankert.

### 1. Ausgeführte Befehle zur Swap-Einrichtung

```bash
# 1. 2 GB große Swap-Datei unter /swapfile erstellen
sudo fallocate -l 2G /swapfile

# 2. Strikte Dateirechte setzen (nur root darf lesen/schreiben)
sudo chmod 600 /swapfile

# 3. Datei als Swap-Bereich formatieren
sudo mkswap /swapfile

# 4. Swap-Datei sofort aktivieren
sudo swapon /swapfile

# 5. Dauerhafte Aktivierung bei Systemneustart via /etc/fstab eintragen
echo "/swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab
```

### 2. Verifikation des aktiven Swap-Speichers

```bash
# Befehl 1: Speicherauslastung prüfen
free -h

# Ausgabe:
#               total        used        free      shared  buff/cache   available
# Mem:           1.9Gi       1.2Gi       144Mi        17Mi       775Mi       707Mi
# Swap:          2.0Gi          0B       2.0Gi

# Befehl 2: Aktiven Swap-Bereich anzeigen
swapon --show

# Ausgabe:
# NAME      TYPE SIZE USED PRIO
# /swapfile file   2G   0B   -1
```

---

## 🛠️ Schnellstart Docker Setup

1. Kopieren Sie `.env.example` im Root-Verzeichnis zu `.env` und tragen Sie die Werte ein.
2. Starten Sie die Docker-Container:
   ```bash
   cd infra
   docker-compose up -d
   ```
3. Prüfen Sie den Status:
   ```bash
   docker-compose ps
   ```

## Terraform AWS Deployment

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

