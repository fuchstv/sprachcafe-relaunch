# Technical Audit & Architecture Assessment: Hausbibliothek (hausbibliothek.org)

- **System Name**: Hausbibliothek Digital Catalog & Loan Management System
- **Host Domain**: `hausbibliothek.org` / `www.hausbibliothek.org`
- **Target Role**: Permanent Single Source of Truth for Loan Operations, User Accounts & Reservations
- **Audit Date**: 10. August 2026

---

## 1. Executive Summary & Architectural Role

Die Anwendung `hausbibliothek.org` dient als zentrale Bibliotheksverwaltung des SprachCafé Polnisch e.V. Sie verwaltet den Buchkatalog, Mitgliederkonten, aktive Ausleihen, Fristen und Vormerkungen. 

Im Rahmen des Relaunches verbleibt die Hausbibliothek dauerhaft als **eigenständige, isolierte Service-Instanz** auf Port 8080 (geproxyed über Caddy). Das Astro-Webportal liest Buchdaten schreibgeschützt über die JSON-Schnittstelle (`/api/v1/export/books`) für die statische Seitengenerierung und die Suche via Pagefind aus.

---

## 2. Technischer Aufbau im Detail

### 2.1 Backend-Framework & Runtime
- **Sprache / Runtime**: PHP 8.4 (Offizielles Docker-Image `php:8.4-apache`).
- **Webserver Engine**: Apache HTTP Server mit aktiviertem `mod_rewrite`.
- **API Architecture**: RESTful Endpoint-Struktur (`/api/books`, `/api/loans`, `/api/reservations`, `/api/auth`, `/api/admin`).
- **Datenbanktreiber**: PHP Data Objects (PDO) mit `pdo_mysql`.
- **Sicherheits-Konfiguration**: Production `php.ini` mit `display_errors = Off` und `log_errors = On`.

### 2.2 Datenbank-Engine & Schema
- **Datenbank-Server**: MySQL 8.0 (`mysql:8.0` Container `library_db`).
- **Storage Engine**: InnoDB mit vollem Support für Transaktionen und Foreign-Key-Constraints (`ON DELETE CASCADE`).
- **Zeichensatz & Kollation**: `utf8mb4` mit `utf8mb4_unicode_ci` für vollständige Unterstützung polnischer und deutscher Sonderzeichen (z. B. ą, ć, ę, ł, ń, ó, ś, ż, ź, ä, ö, ü, ß).
- **Kern-Tabellen**:
  - `users`: ID, Name, E-Mail, Passwort-Hash, Telefon, Fee-Status, Sperr-Status, DSGVO/Regeln-Einwilligung, Rolle (`member` / `admin`).
  - `books`: ID, Kategorie, Autor, Titel, Erscheinungsjahr, Verlag, ISBN, Beschreibung, Cover-Image, Signatur, Standort, Verfügbarkeits-Status (`available` / `borrowed`).
  - `loans`: ID, Book-ID, User-ID, Ausleihdatum, Fälligkeitsdatum, Rückgabedatum, Status (`active`, `returned`, `overdue`).
  - `reservations`: ID, Book-ID, User-ID, Status (`pending`, `completed`, `cancelled`).
  - `notifications`: ID, User-ID, Message, Read-Flag, Erstellungsdatum.
  - `pages`: Statische Inhaltsseiten (Reglement, Impressum, Datenschutz, Ankündigungen).

### 2.3 Session- & Authentifizierungs-Mechanismus
- **Session Management**: Native PHP Sessions (`$_SESSION`) mit HTTP-Only Cookies.
- **Session Fixation Protection**: Erneuerung der Session-ID bei jedem erfolgreichen Login via `session_regenerate_id(true)`.
- **CSRF Protection**: Tokenbasierter Schutz gegen Cross-Site Request Forgery (`generateCsrfToken()`) bei allen mutierenden Formular- und API-Requests.
- **Rollen- & Rechtekonzept**: Zweistufiges Berechtigungssystem (`admin` vs. `member`).

### 2.4 Passwort-Hashing-Verfahren
- **Hashing-Algorithmus**: PHP Native `password_hash($password, PASSWORD_DEFAULT)` mit automatischem Salt-Management (unter PHP 8.4 standardmäßig bcrypt / Argon2id).
- **Verifikation**: Sichere Prüfung via `password_verify($input, $hash)`.
- **Passwort-Policies**: Erfassen der Mindestlänge (8 Zeichen) sowie erzwungener Passwortwechsel beim Erstlogin via `must_change_password=1`.

### 2.5 Automatische Benachrichtigungen & Infrastruktur-Resilienz
- **Technischer Mechanismus**: In-App-Benachrichtigungssystem über die MySQL-Tabelle `notifications` (`id`, `user_id`, `message`, `is_read`, `created_at`).
- **Ereignis-Steuerung (Abholbereitschaft & Vormerkungen)**:
  - Bei der Buchrückgabe (`PUT /api/loans` mit `action = 'return'`) prüft das Backend via `notifyBookAvailable($pdo, $book_id)` ausstehende Einträge in der Tabelle `reservations`.
  - Ist eine Vormerkung aktiv, erzeugt das Backend synchron in der Datenbank-Transaktion einen Benachrichtigungseintrag für den Leser (*"Das Buch '$title' ist wieder verfügbar."*) sowie für die Administration.
- **Leihfristen & Überfälligkeit (Overdue Items)**:
  - Überfällige Medien werden bei jeder Abfrage (`GET /api/notifications` und `GET /api/loans`) dynamisch über `WHERE due_date < CURDATE() AND status != 'returned'` ermittelt und im Web-Interface als Warnung/Badge dargestellt.
- **Schnittstellen & Entkopplung**:
  - **Kein externer SMTP-Versand**: Es existiert keine synchrone Abhängigkeit zu externen Mailservern oder Drittanbietern (z. B. SendGrid, Mailgun).
  - **Keine Hintergrund-Cron-Worker**: Der Benachrichtigungsmechanismus benötigt keine Hintergrund-Cronjobs auf Betriebssystem-Ebene.
- **Infrastruktur-Resilienz (Docker-Limits & Firewall-Regeln)**:
  - Da alle Benachrichtigungen reine Datenbank-Transaktionen innerhalb des isolierten Docker-Netzwerks darstellen, laufen sie auch unter den neuen Ressourcen-Limits (128 MB Backend, 512 MB MySQL) und verschärften Firewall-Regeln (keine ausgehenden SMTP-Ports 25/587/465 nötig) **100% unbeeinträchtigt und ausfallsicher** weiter.
- **Power Automate Ausblick**:
  - Eine eventuelle Anbindung an das M365 Exchange/Power-Automate-System ist ausdrücklich **kein Go-Live-Ziel**, sondern bleibt als spätere Ausbaustufe reserviert.


### 2.6 PWA-Manifest & Service-Worker
- **PWA Manifest**: Standardkonformes Web-App-Manifest ([manifest.webmanifest](file:///home/ubuntu/minimalist_home_library/frontend/dist/manifest.webmanifest)) inklusive App-Icons, Theme-Farben und Display-Modi (`standalone`).
- **Service Worker**: Workbox-basierter Service Worker (`sw.js`) für Offline-Precaching von App-Shell, Assets, Spracheneinstellungen und Navigation-Route Caching mit `skipWaiting()` und `clientsClaim()`.

### 2.7 ISBN-Lookup-Funktion & Cover-Storage-Entscheidung

#### A. ISBN-Lookup-Funktion (Externe API-Anbindung)
- **Verwendeter Dienst**: Die ISBN-Suchfunktion im Admin-Dashboard nutzt die offizielle REST-API von **Open Library**:
  `https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data`
- **Funktionsweise**: Bei Eingabe einer ISBN und Klick auf den Suchen-Button ruft der Browser die Open Library API auf und befüllt automatisch Titel, Autor, Erscheinungsjahr, Verlag und Beschreibung.
- **Rate-Limits & Quotas**:
  - **Limit**: Open Library gestattet bis zu **100 Anfragen pro IP-Adresse pro Minute** (bzw. max. 5 Requests/Sekunde).
  - **API-Key**: Für den Standard-Zugriff ist kein API-Schlüssel erforderlich.
  - **Fehler-Handling**: Bei Erreichen von Rate-Limits oder unbekannten ISBNs gibt die App eine sanfte Fehlermeldung aus (*"Buch nicht gefunden"*). Die manuelle Eingabe bleibt jederzeit möglich.

#### B. S3-Cover-Upload-Entscheidung (Verschoben auf L2)
- **Ist-Zustand**: Cover-Bilder werden im PHP-Backend hochgeladen und lokal im Ordner `/var/www/html/uploads/` auf der 60-GB-Server-SSD gespeichert.
- **Bewertung & Aufwand**: 
  - Die gesamte Buch-Cover-Sammlung der Hausbibliothek umfasst derzeit weniger als **20 MB** Datenvolumen. Auf der Server-SSD stehen über 40 GB freie Kapazität zur Verfügung.
  - Die Umstellung des PHP-Backends auf AWS S3 (`sprachcafe-media-storage`) würde die Einbindung des AWS SDK für PHP sowie S3-Credentials im PHP-Container erfordern.
- **Beschluss**: Gemäß der optionalen Vorgabe wird die Umstellung auf den AWS S3 Bucket **auf Phase L2 verschoben**. Für den Go-Live reicht die lokale Speicherung auf der SSD vollkommen aus.


---

## 3. Ressourcen-Audit: RAM/CPU-Grundlast

Messung der laufenden Docker-Container auf dem Ziel-Host via `docker stats --no-stream`:

| Container Name | Docker Image | CPU % | RAM Nutzung / Limit | RAM % | PIDs |
|---|---|---|---|---|---|
| `library_db` | `mysql:8.0` | 0.73% | 78.39 MiB / 512.00 MiB | 15.31% | 39 |
| `library_backend` | `php:8.4-apache` | 0.01% | 21.69 MiB / 128.00 MiB | 16.95% | 11 |
| `library_proxy` | `caddy:2-alpine` | 0.01% | 33.18 MiB / 64.00 MiB | 51.85% | 8 |
| `library_admin` | `phpmyadmin:latest` | 0.01% | 46.39 MiB / 96.00 MiB | 48.33% | 8 |
| **Gesamtsystem** | **4 Container** | **~0.76%** | **~179.65 MiB Total** | **—** | **66** |

### Bewertung des Ressourcenverbrauchs:
Der gesamte Stack benötigt im Leerlauf **unter 180 MB RAM**. Dies erfüllt das Kapazitätsbudget für den 2 GB RAM Lightsail-Host spielend und hinterlässt ausreichend Reserven für Astro Static Site Generation, SQLite Headless CMS und den Caddy Reverse Proxy.

---

## 4. Sicherheits- & Altlasten-Bewertung

### 4.1 Prüfung auf Sicherheits- & Code-Altlasten
- **SQL-Injection**: NATIVE Prepared Statements (`$pdo->prepare()`) für sämtliche Eingabeparameter. Keine unsichere String-Konkatenation in Datenbankabfragen.
- **Cross-Site Scripting (XSS)**: JSON-Ausgabe und HTML-Escaping bei allen Benutzerinteraktionen.
- **Session-HiJacking**: Automatische `session_regenerate_id(true)` bei der Anmeldung.
- **Deprecated Code**: Keine Nutzung veralteter PHP-Funktionen (`mysql_*` o.ä.). Das Projekt läuft nativ unter der aktuellsten PHP-Version 8.4.

### 4.2 Fazit & Architektur-Entscheidung

> [!IMPORTANT]
> **BEWERTUNG**: Die Hausbibliothek-App befindet sich in einem **hervorragenden, sicheren und wartbaren Zustand**. Es existieren **keine kritischen Altlasten**, die einen Teil-Nachbau rechtfertigen oder erzwingen würden.

### **Beschluss (Regelfall)**:
1. **Reine Integration, kein Nachbau**: Die Bibliothek-App bleibt dauerhaft als eigenständiger Dienst unter `hausbibliothek.org` bestehen.
2. **Katalog-Synchronisation**: Der öffentliche Buchkatalog wird für das Hauptportal schreibgeschützt als JSON exportiert (`/api/v1/export/books`).
3. **Ausleihe- & Nutzerzugriff**: Interaktive Funktionen (Ausleihe, Vormerkung, Profil) verlinken direkt auf `hausbibliothek.org`.
