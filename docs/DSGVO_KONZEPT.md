# DSGVO-Datenschutz-Konzept, Sicherheits-Audit & Löschkonzept

- **Projekt**: SprachCafé Polnisch Relaunch & Hausbibliothek
- **Geltungsbereich**: `sprachcafe-polnisch.org` (Hauptportal) & `hausbibliothek.org` (Bibliotheks-App)
- **Stand**: 10. August 2026

---

## 1. Zero-Attack-Surface-Prinzip (Hauptdomain)

Für die Hauptdomain **`sprachcafe-polnisch.org`** gilt das strikte **"Zero Attack Surface"**-Prinzip:

- **Rein statische Architektur**: Generierung aller 415+ Seiten via Astro 5 Static Site Generation (SSG).
- **Keine Server-Datenbank**: Das Hauptportal besitzt keine eigene SQL-Datenbank und führt keine serverseitigen Skripte aus.
- **Keine Tracking-Cookies**: 0 Cookie-Banner erforderlich, 0 Analytics-Tracker von Drittanbietern.
- **Datenschutz bei Formularen**: Kontakt- und Beitrittsanfragen werden über M365 Power Automate Webhooks direkt per E-Mail zugestellt. Keine Zwischenspeicherung auf dem Webserver.
- **Self-Hosted Assets**: 100% der Schriftarten (Inter, Roboto) und Icons werden lokal im WOFF2-Format vom eigenen Server bereitgestellt (0 Anfragen an Google Fonts oder externe CDNs).

---

## 2. Sonderrolle & Abgrenzung: Hausbibliothek (`hausbibliothek.org`)

> [!IMPORTANT]
> **EXPLIZITE ABGRENZUNG**: Das "Zero Attack Surface"-Prinzip gilt **ausschließlich für die Hauptdomain (`sprachcafe-polnisch.org`)**, **NICHT für `hausbibliothek.org`**.

Die Webanwendung **`hausbibliothek.org`** ist eine dynamische Bibliotheksverwaltungs-Software zur Abwicklung des Leihbetriebs. Sie speichert und verarbeitet zwingend personenbezogene Daten der Vereinsmitglieder.

### 2.1 Verarbeitete personenbezogene Daten (Art. 6 Abs. 1 lit. b & f DSGVO)

| Datenkategorie | Erfasste Datenfelder | Verarbeitungszweck |
|---|---|---|
| **Stammdaten** | Vorname, Nachname, E-Mail-Adresse, Telefonnummer | Identifikation der Leser, Kontaktaufnahme bei Mahnungen / Vormerkungen |
| **Vertrags- & Beitragsdaten** | Jahresbeitrag entrichtet (`fee_paid`), Kontosperre (`is_blocked`) | Prüfung der Ausleihberechtigung gem. Bibliotheksordnung |
| **Ausleihdaten** | Ausleihhistorie (Bücher, Ausleihdatum, Rückgabedatum, Status) | Verwaltung von Fristen, Mahnwesen, Nachverfolgung des Buchbestands |
| **Authentifizierungsdaten** | Verschlüsselte Passwort-Hashes (`password_hash`), PHP-Session-ID, CSRF-Token | Sichere Benutzeranmeldung und Sitzungsverwaltung |
| **Einwilligungen** | Datenschutz-Zustimmung (`data_consent`), Regel-Zustimmung (`rules_consent`) | Nachweis der DSGVO- und Regelkonformität bei der Registrierung |

---

## 3. Sicherheits-Audit der Auth-Implementierung

Das Sicherheits-Audit der Authentifizierung auf `hausbibliothek.org` hinter dem Caddy Reverse Proxy hat folgende Schutzmechanismen bestätigt:

### 3.1 CSRF-Schutz & Cache-Bypass
- **Mechanismus**: Zustandsverändernde Requests (`POST`, `PUT`, `DELETE`) verlangen zwingend einen gültigen `X-CSRF-Token` im Request-Header (ausgenommen `/auth/login` und `/auth/register`).
- **Timing-Attacken-Schutz**: Die Prüfung erfolgt kryptographisch sicher über `hash_equals($_SESSION['csrf_token'], $token)`.
- **Proxy-Caching-Schutz**: Dynamische API-Antworten senden die HTTP-Header `Cache-Control: no-store, no-cache, must-revalidate` und `Pragma: no-cache`. Der Caddy Reverse Proxy schließt ein Caching von API- und Session-Headern aus, sodass Tokens niemals im Cache verfälscht oder weitergegeben werden.

### 3.2 Session-Cookie-Sicherheit
- **Proxy-Integration**: Bei Anfragen über HTTPS signalisiert Caddy dem PHP-Backend über den `X-Forwarded-Proto: https`-Header die verschlüsselte Verbindung (`$_SERVER['HTTPS'] = 'on'`).
- **Cookie-Flags**:
  - `Secure`: Session-Cookies werden ausschließlich über HTTPS übertragen.
  - `HttpOnly`: Clientseitige JavaScripts (z. B. XSS-Skripte) können nicht auf `PHPSESSID` zugreifen.
  - `SameSite=Lax`: Verhindert die ungewollte Übertragung von Session-Cookies bei Cross-Site Requests.

### 3.3 Passwort-Hashing
- **Verfahren**: Einsatz von PHP `password_hash($password, PASSWORD_DEFAULT)`.
- **Algorithmus**: Unter PHP 8.4 auf dem Backend-Server wird **bcrypt** mit einem mathematischen Kostenfaktor von `10` (bzw. Argon2id) verwendet.
- **Salting**: Automatische Erzeugung eines kryptographisch sicheren Zufalls-Salts pro Passwort.

---

## 4. Umgesetztes Löschkonzept für inaktive Konten (Art. 17 DSGVO)

In Übereinstimmung mit dem Grundsatz der **Speicherbegrenzung (Art. 5 Abs. 1 lit. e DSGVO)** und dem **Recht auf Löschung (Art. 17 DSGVO)** ist für `hausbibliothek.org` ein automatisiertes und manuelles Löschkonzept implementiert:

### 4.1 Löschfristen & Kriterien

1. **Aktive Mitglieder**:
   - Die Daten verbleiben für die gesamte Dauer der aktiven Bibliotheksnutzung im System.

2. **Inaktive Konten (24-Monats-Aufbewahrung)**:
   - Ein Konto gilt als **inaktiv**, wenn seit **24 Monaten (2 Jahren)** keine Anmeldung, keine Ausleihe und keine Vormerkung erfolgt ist.
   - **Voraussetzung**: Es dürfen keine aktiven Ausleihen (`status != 'returned'`) und keine offenen Gebühren vorliegen.
   - **Löschvollzug**: Bei der Bereinigung werden das Benutzerkonto (`users`-Tabelle) sowie persönliche Mitteilungen und Vormerkungen unwiderruflich entfernt.

3. **Konten mit offenen Verbindlichkeiten**:
   - Konten mit nicht zurückgegebenen Büchern werden gemäß Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse zur Durchsetzung von Ersatzansprüchen) **nicht automatisch gelöscht**, bis die Gegenstände zurückgegeben sind.

### 4.2 Anonymisierung von Ausleihstatistiken
Um die wissenschaftliche und vereinseigene Bestandsstatistik (*"Wie oft wurde ein Buch in den letzten 5 Jahren ausgeliehen?"*) zu erhalten, werden historische Ausleihen bei der Kontolöschung **anonymisiert**:
- Die Personenverknüpfung (`user_id`) in der Tabelle `loans` wird auf `NULL` gesetzt.
- Sämtliche Personenbezüge (Name, E-Mail, Telefon) werden gelöscht. Die Buch-Ausleihhistorie bleibt rein anonymisiert für die Bestandsanalyse erhalten.

---

## 5. Implementierte Tools & API-Endpoints für das Löschkonzept

### 5.1 CLI Tooling (`dsgvo_cleanup.php`)
Ein entwickeltes PHP-CLI Skript ermöglicht die Ausführung der Inaktivitätsbereinigung direkt auf dem Server (z. B. via Cron-Job):

```bash
# Simulation / Vorschau der zu löschenden Inaktiven Konten (24+ Monate)
docker exec -i library_backend php dsgvo_cleanup.php --dry-run

# Bereinigung durchführen (Löschung & Anonymisierung)
docker exec -i library_backend php dsgvo_cleanup.php --execute
```

### 5.2 Admin REST API Endpoints
Für die Administration über das Dashboard wurden zwei Schnittstellen bereitgestellt:

1. **`POST /api/admin/users/cleanup-inactive?dry_run=true|false`**:
   - Bereinigt inaktive Konten über die Web-Oberfläche.
2. **`DELETE /api/admin/users/{id}`**:
   - Ermöglicht Admins die sofortige Löschung eines Nutzers auf Auskunfts- oder Löschersuchen (Art. 17 DSGVO). Bei vorliegenden Ausleihen wird die Löschung mit einer Fehlermeldung verweigert.
