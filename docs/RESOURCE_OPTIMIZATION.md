# Ressourcen- & Speicher-Optimierung (2 GB AWS Lightsail)

Dieses Dokument analysiert die Datenbank-Engines, Speicherverbrauch und die Optimierungsstrategie für den parallelen Betrieb des SprachCafé Relaunchs und der bestehenden Hausbibliothek auf einer **2 GB RAM AWS Lightsail-Instanz**.

---

## 1. Analyse der bestehenden Datenbank-Engine

Eine Überprüfung des bestehenden Hausbibliothek-Setups ([`minimalist_home_library/docker-compose.prod.yml`](file:///home/ubuntu/minimalist_home_library/docker-compose.prod.yml)) zeigt:
- **Datenbank-Engine**: **MySQL 8.0** (Docker Container `library_db`)
- **Standard-Verhalten**: Ohne explizite Drosselung allokiert MySQL 8.0 standardmäßig `innodb_buffer_pool_size` > 512 MB sowie ~150 MB für das `performance_schema`.

---

## 2. Architektur-Entscheidung: SQLite für das neue Headless CMS

Das parallele Ausführen zweier vollwertiger RDBMS-Serverprozesse (MySQL 8.0 für die Hausbibliothek + PostgreSQL 15 für das CMS) auf einer 2-GB-Instanz würde über 800 MB RAM allein für Datenbank-Daemons beanspruchen. Dies führt bei Lastspitzen zu Out-of-Memory (OOM) Kills.

### ✅ Entscheidung: SQLite für das Headless CMS
- **Kein zweiter DB-Serverprozess**: SQLite läuft eingebettet (in-process) innerhalb des CMS Node.js-Prozesses.
- **Speicher-Ersparnis**: Spart ca. **200 MB bis 350 MB RAM** gegenüber einem separaten PostgreSQL-Container.
- **Perfekt für Vereinsseiten**: Reicht für Lese- und Schreib-Traffic der SprachCafé-Plattform vollkommen aus.
- **Persistenz**: Die SQLite-Datenbankdatei wird im persistenten Host-Pfad `/opt/sprachcafe/cms-data/cms.db` gespeichert.

---

## 3. Drosselung des Hausbibliothek MySQL-Servers (`innodb_buffer_pool_size`)

Um den RAM-Verbrauch des bestehenden MySQL-Containers zu begrenzen, wird die Konfigurationsdatei [`infra/mysql-tuning.cnf`](../infra/mysql-tuning.cnf) bereitgestellt:

```ini
[mysqld]
# Drosselung des InnoDB Buffer Pools auf 128 MB (ausreichend für Bibliothekskatalog)
innodb_buffer_pool_size = 128M
innodb_log_buffer_size = 8M

# Performance Schema deaktivieren (spart ~100MB+ RAM)
performance_schema = OFF

# Verbindungen begrenzen (Standard 151 -> 30)
max_connections = 30
table_open_cache = 400
```

### Einbindung in den Hausbibliothek MySQL-Container:
Im `docker-compose.yml` der Hausbibliothek wird die Datei als Read-Only Mount eingebunden:
```yaml
  database:
    image: mysql:8.0
    volumes:
      - db_data:/var/lib/mysql
      - ../infra/mysql-tuning.cnf:/etc/mysql/conf.d/tuning.cnf:ro
```

---

## 4. Speicher-Budgetierung (2 GB RAM Host)

Durch den Einsatz von **SQLite** für das CMS und die **MySQL-Drosselung** bleibt die Gesamtauslastung der 2-GB-Instanz im grünen Bereich:

| Komponente | Ohne Optimierung | Mit Optimierung (SQLite & MySQL Drosselung) | Ersparnis |
|------------|------------------|--------------------------------------------|-----------|
| **Hausbibliothek MySQL** | ~550 MB | **192 MB** (Limit: 256 MB) | ~358 MB |
| **Hausbibliothek Backend & Proxy** | ~180 MB | **128 MB** | ~52 MB |
| **Neues Headless CMS DB** | PostgreSQL (~220 MB) | **SQLite (0 MB Daemon)** | **220 MB** |
| **Neues Headless CMS App** | ~250 MB | **192 MB** | ~58 MB |
| **Astro Frontend & Caddy** | ~150 MB | **96 MB** | ~54 MB |
| **OS & Buffer Cache** | ~350 MB | **350 MB** | 0 MB |
| **GESAMT RAM-BEDARF** | **~1.700 MB (Kritisch)** | **~958 MB (Optimal)** | **~742 MB frei!** |
