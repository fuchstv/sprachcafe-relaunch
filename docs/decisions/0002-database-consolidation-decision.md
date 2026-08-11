# ADR 0002: Dauerhafte Datenbank-Erhaltung der Hausbibliothek (Keine Konsolidierung)

- **Status**: Akzeptiert & Beschlossen
- **Datum**: 10. August 2026
- **Entscheidungsträger**: Lead Architecture & System Operations Team
- **Relevanz**: Phasen 0.1, 0.1b, L.1, L.3

---

## 1. Kontext & Problemstellung

Im Rahmen der Architekturplanung (Phasen 0.1 und 0.1b) wurde untersucht, ob die Datenbank der Hausbibliothek (`library_db`) mit der neuen Headless-CMS-Datenbank (SQLite, Phase 4.1) konsolidiert werden soll oder ob die Hausbibliothek ihre eigene Datenbank behält.

Zusätzlich wurden in Phase L.1 die **konkreten, tatsächlichen Ressourcenwerte** des laufenden Hausbibliothek-Stacks auf dem 2 GB RAM AWS Lightsail Host gemessen. 

---

## 2. Empirische Messwerte aus L.1 (Dauerbetrieb)

Der Hausbibliothek-Stack läuft **nicht nur als Übergangslösung, sondern dauerhaft als isolierter Service** unter `hausbibliothek.org`. Die Messung via `docker stats --no-stream` ergab folgende Grundlast:

| Container Name | Funktion / Engine | CPU-Last | RAM Nutzung | RAM Limit |
|---|---|---|---|---|
| `library_db` | MySQL 8.0 RDBMS | 0.73% | **78.39 MiB** | 512.00 MiB |
| `library_backend` | PHP 8.4 Apache REST API | 0.01% | **21.69 MiB** | 128.00 MiB |
| `library_proxy` | Caddy 2 Reverse Proxy | 0.01% | **33.18 MiB** | 64.00 MiB |
| `library_admin` | phpMyAdmin Database Manager | 0.01% | **46.39 MiB** | 96.00 MiB |
| **GESAMT-STACK** | **4 Container** | **~0.76%** | **~179.65 MiB** | **—** |

### Auswertung des Ressourcenbudgets:
Der gesamte Hausbibliothek-Stack verbraucht im Leerlauf **weniger als 180 MB RAM**. Zusammen mit dem Headless CMS (~192 MB), dem Astro Frontend (~96 MB) und dem Host-Betriebssystem (~350 MB) liegt die Gesamtauslastung bei **ca. 800 MB RAM**. Es verbleiben **über 1,2 GB RAM frei**, weshalb kein Ressourcen-Druck zur Datenbank-Konsolidierung zwingt.

---

## 3. Bewertung der DB-Konsolidierungs-Optionen

### Option A: Konsolidierung der Hausbibliothek in die CMS-SQLite-Datenbank (Verworfen)
- **Technischer Aufwand**: Extreme Refactoring-Notwendigkeit des PHP 8.4 Backends (`loans.php`, `auth.php`, `admin_users.php`). MySQL-spezifische SQL-Konstrukte (`FOR UPDATE` Transaktions-Sperren, `CURDATE()`, PDO MySQL DSNs) müssten auf SQLite-Dialekt umgeschrieben werden.
- **Risiko**: **Hohes Migrations- & Ausfallrisiko** für die Login-Daten (`password_hash`), aktiven Ausleihen und Vormerkungen der bestehenden Leserinnen und Leser.
- **Nebenläufigkeit**: SQLite unterstützt keine zeilenbasierte Sperrung (`FOR UPDATE`), was bei parallelen Ausleih- und Rückgabevorgängen zu `database is locked`-Fehlern führen kann.

### Option B (Beschlossen): Dauerhafte Trennung & Eigenständige MySQL 8.0 DB für die Hausbibliothek
- **Vorteile**:
  1. **Null Migrationsrisiko**: Keine Gefahr von Datenverlust oder Login-Fehlern bei aktiven Nutzerkonten.
  2. **Code-Stabilität**: Das bewährte PHP 8.4 PDO Backend läuft unverändert und stabil.
  3. **Vollständige Isolation**: Ausleih- und Nutzertransaktionen sind strikt vom Webportal-CMS getrennt (Sicherheit & DSGVO-by-Design).
  4. **Minimaler RAM-Overhead**: MySQL 8.0 verbraucht mit Optimierung nur knapp ~78 MB RAM.

---

## 4. Entscheidung & Konsequenzen

### ✅ Beschluss:
Die Hausbibliothek-App behält **dauerhaft ihre eigene MySQL 8.0 Datenbank (`library_db`)**. Eine Konsolidierung mit der CMS-SQLite-Datenbank wird abgelehnt.

### Konsequenzen:
1. **Container-Setup**: Der Container `library_db` (`mysql:8.0`) verbleibt im Dauerbetrieb im Docker-Netzwerk.
2. **Daten-Synchronisation**: Der öffentliche Buchkatalog wird schreibgeschützt über die REST-Schnittstelle (`/api/v1/export/books`) für den statischen Astro-Build und Pagefind exportiert.
3. **Wartung**: Die Datenbank-Sicherungen von `library_db` (MySQL Dumps) und `cms.db` (SQLite WAL) erfolgen in separaten, automatisierten Backups.
