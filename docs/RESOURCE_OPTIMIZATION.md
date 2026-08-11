# Ressourcen- & Kapazitätsplanung (2 GB AWS Lightsail Host)

Dieses Dokument analysiert die Datenbank-Engines, den tatsächlichen Speicherverbrauch (empirische L.1 Messwerte) und die finale Datenbank-Konsolidierungsentscheidung für den **dauerhaften parallelen Betrieb** des SprachCafé Webportals und der Hausbibliothek auf einer **2 GB RAM AWS Lightsail-Instanz**.

---

## 1. Empirische L.1 Messwerte aus dem laufenden Betrieb

Eine direkte Ressourcen-Messung via `docker stats --no-stream` auf dem Live-System zeigt den exakten Speicherverbrauch der Dauerbetriebs-Container:

| Komponente / Container Name | Docker Image | Ist-Verbrauch (RAM) | Speicher-Limit | CPU-Last |
|---|---|---|---|---|
| **Hausbibliothek DB (`library_db`)** | `mysql:8.0` | **78.39 MiB** | 512.00 MiB | 0.73% |
| **Hausbibliothek Backend (`library_backend`)** | `php:8.4-apache` | **21.69 MiB** | 128.00 MiB | 0.01% |
| **Hausbibliothek Proxy (`library_proxy`)** | `caddy:2-alpine` | **33.18 MiB** | 64.00 MiB | 0.01% |
| **Hausbibliothek Admin (`library_admin`)** | `phpmyadmin:latest` | **46.39 MiB** | 96.00 MiB | 0.01% |
| **GESAMT HAUSBIBLIOTHEK STACK** | **4 Container** | **~179.65 MiB** | **—** | **0.76%** |

---

## 2. Speicher-Budgetierung & Kapazitätsplanung (2 GB RAM Host)

Da die Hausbibliothek **dauerhaft** als isolierter Dienst unter `hausbibliothek.org` betrieben wird, ergibt sich folgende Gesamtauslastung auf dem 2 GB (2.048 MB) Lightsail-Server:

| Komponente / Dienst | Verwendete Technologie | Ist-RAM-Verbrauch | Max. Limit |
|---|---|---|---|
| **Hausbibliothek Stack (Dauerbetrieb)** | MySQL 8.0 + PHP 8.4 + Caddy | **179.65 MiB** | 800.00 MiB |
| **Headless CMS Service** | Node.js + Embedded SQLite 3 (`cms.db`) | **192.00 MiB** | 256.00 MiB |
| **Astro Frontend Service** | SSG Build / Node.js SSR | **96.00 MiB** | 128.00 MiB |
| **Host-Betriebssystem & Kernel-Puffer** | Ubuntu Linux 24.04 LTS | **350.00 MiB** | 500.00 MiB |
| **GESAMT-AUSLASTUNG PROJEKT** | **Alle Services & OS** | **~817.65 MiB** | **1.684,00 MiB** |

### Fazit Kapazitätsplanung (0.1):
Mit einer Gesamtauslastung von **unter 820 MB RAM** verbleiben auf der 2 GB Instanz **über 1.200 MB RAM freie Reserve**. Ein Engpass oder Ausfallrisiko durch Out-of-Memory (OOM) Kills existiert nicht.

---

## 3. Datenbank-Konsolidierungs-Entscheidung (0.1b & L.1)

Es wurde geprüft, ob eine Konsolidierung der Hausbibliothek-Datenbank (`library_db` - MySQL 8.0) in die neue CMS-Datenbank (SQLite 3, Phase 4.1) sinnvoll und vertretbar ist.

### ❌ Konsolidierung in SQLite wird ABGELEHNT
1. **Migrations- & Ausfallrisiko**: Die Hausbibliothek besitzt verknüpfte Relationen (Leserkonten, Ausleihhistorie, Fristen, Vormerkungen, bcrypt-Passwort-Hashes). Ein Wechsel der Datenbank-Engine würde ein hohes Risiko für Datenverlust oder Login-Probleme der aktiven Nutzerinnen und Nutzer bedeuten.
2. **Code-Kopplung**: Das PHP-Backend nutzt MySQL-spezifische SQL-Befehle (`FOR UPDATE` Zeilensperren für konkurrierende Ausleihen, `CURDATE()`, PDO-MySQL DSNs). SQLite unterstützt keine `FOR UPDATE` Sperren, was zu Lock-Konflikten bei zeitgleichen Buchungen führen würde.
3. **Ressourcenverfügbarkeit**: Da der MySQL-Container dank Tuning ([`infra/mysql-tuning.cnf`](../infra/mysql-tuning.cnf)) in der Praxis nur **~78 MB RAM** benötigt, entsteht durch den parallelen Betrieb kein nennenswerter Over-Head.

### ✅ Beschluss (ADR 0002):
Die Hausbibliothek **behält dauerhaft ihre eigene MySQL 8.0 Datenbank (`library_db`)**.
Details siehe [ADR 0002: Dauerhafte Datenbank-Erhaltung der Hausbibliothek](./decisions/0002-database-consolidation-decision.md).
