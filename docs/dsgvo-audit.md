# DSGVO-Audit & Verzeichnis der Verarbeitungstätigkeiten (VVT)

- **Projekt**: SprachCafé Polnisch Relaunch & Hausbibliothek
- **Dokument-ID**: D2.3 – DSGVO-Audit & Diensteverzeichnis
- **Verantwortlicher**: SprachCafé Polnisch e.V., Schulzestr. 1, D-13187 Berlin (vertreten durch den Vorstand: Agata Koch)
- **Kontakt Datenschutz**: `kontakt@sprachcafe-polnisch.org` | Tel.: `+49 160 9968 0059`
- **Geltungsbereich**: `sprachcafe-polnisch.org` (Hauptportal / Astro SSG), `hausbibliothek.org` (Bibliotheks-App) & verbundene Backend-Dienste
- **Stand**: August 2026

---

## 1. Management Summary & Architekturübersicht

Das Webportal des SprachCafé Polnisch e.V. folgt dem Grundsatz der **Datenminimierung (Art. 5 Abs. 1 lit. c DSGVO)** und setzt auf eine moderne **Jamstack / Static Site Generation (SSG)**-Architektur.

### Grundprinzipien des Datenschutzes:
1. **Hauptportal (`sprachcafe-polnisch.org`)**:
   - 100% statisch gerendert (Astro 5).
   - Keine clientseitigen Tracking-Tools, keine Werbenetzwerke, keine Google-Analytics-/Meta-Pixel.
   - Lokales Hosting sämtlicher Webfonts (keine dynamischen Google-Font-Serveranfragen) und Icons.
   - Kein Cookie-Banner erforderlich, da ausschließlich technisch zwingend notwendige Sessions auf Subanwendungen laufen.
2. **Formularabwicklung**:
   - Keine relationale SQL-Kundendatenbank auf dem Frontend-Server.
   - Übertragung strukturierter Formulardaten via gesicherter TLS-REST-Endpunkte direkt in den verwalteten Microsoft 365 Tenant des Vereins (Power Automate).
3. **Bibliotheksanwendung (`hausbibliothek.org`)**:
   - Funktionale Web-App mit strikter Rollentrennung, CSRF-Schutz, Password-Hashing (bcrypt/Argon2id) und automatisiertem 24-Monats-Löschkonzept.

---

## 2. Detaillierter Audit der tatsächlich genutzten Dienste

### Dienst 1: Google Calendar API / iCal-Synchronisation

| Kriterium | Spezifikation & Bewertung |
|---|---|
| **Dienst & Funktion** | Google Calendar API / öffentlicher iCal-Feed (Read-Only) für Veranstaltungsdaten |
| **Personenbezogene Daten** | **Keine PII von Website-Besucher\*innen.**<br>Ausschließlich öffentlich zugängliche Metadaten von Vereinsveranstaltungen (Titel, Uhrzeit, Ort, Beschreibung, ggf. öffentlich genannte Namen von Referent\*innen/Dozierenden). |
| **Verarbeitungszweck** | Automatisierte Synchronisation von Terminen und Kursangeboten in den statischen Astro-Build-Prozess zur Information der Öffentlichkeit. |
| **Rechtsgrundlage** | **Art. 6 Abs. 1 lit. f DSGVO** (Berechtigtes Interesse an effektiver Öffentlichkeitsarbeit und Vermittlung gemeinnütziger Bildungs- und Kulturangebote). |
| **Speicherort & Übermittlung** | - **Quellserver**: Google LLC (Rechenzentren EU/Global, zertifiziert nach EU-U.S. Data Privacy Framework).<br>- **Verarbeitung**: Lokale Build-Pipeline (Astro SSG) auf Lightsail (Frankfurt/EU). Es werden rein statische HTML-Seiten erzeugt. |
| **Speicherdauer** | Temporär/flüchtig im Arbeitsspeicher während des Build-Vorgangs. Im statischen HTML bis zum nächsten Build-Lauf (spätestens 24 Stunden). |
| **Auftragsverarbeitung (AVV)** | Standard-Google-Workspace/Cloud-Konditionen (EU-Standardvertragsklauseln). Da keine Besucherdaten an Google fließen, entsteht für Website-Nutzer kein Drittlandtransfer. |

---

### Dienst 2: AWS S3 (Amazon Simple Storage Service)

| Kriterium | Spezifikation & Bewertung |
|---|---|
| **Dienst & Funktion** | AWS S3 Bucket (`sprachcafe-media-assets` / `hausbibliothek-backups`) |
| **Personenbezogene Daten** | **Keine PII von Endnutzer\*innen.**<br>Öffentliche Medienassets (Buch-Cover, Logos, Veranstaltungsflyer, Vereinssatzung als PDF, Tätigkeitsberichte) sowie verschlüsselte System-Backups. |
| **Verarbeitungszweck** | Hochverfügbare, skalierbare Speicherung und Auslieferung statischer Dateien, Dokumente und disaster-recovery-fähiger Backups. |
| **Rechtsgrundlage** | **Art. 6 Abs. 1 lit. f DSGVO** (Berechtigtes Interesse an Ausfallsicherheit, Datenintegrität und performanter Bereitstellung von Vereinsdokumenten). |
| **Speicherort & Übermittlung** | **AWS Region `eu-central-1` (Frankfurt am Main, Deutschland, Europäische Union).**<br>Daten verbleiben vollständig innerhalb der EU; kein Transfer in unsichere Drittstaaten. |
| **Speicherdauer** | - **Öffentliche Assets & Dokumente**: Dauerhaft für die Lebensdauer der Website bzw. bis zur Aktualisierung durch die Redaktion.<br>- **Build-/System-Backups**: Automatische Löschung nach rollierendem Schema (Lifecycle-Rule: 30 bis 90 Tage). |
| **Auftragsverarbeitung (AVV)** | AWS Data Processing Addendum (DPA) mit integrierten Standardvertragsklauseln (SCC) nach Art. 28 DSGVO. |

---

### Dienst 3: Microsoft Power Automate + SharePoint + GitHub-Connector

| Kriterium | Spezifikation & Bewertung |
|---|---|
| **Dienst & Funktion** | Microsoft 365 Cloud-Workflows (Power Automate Formulare, SharePoint Listen, GitHub Webhook Connector) |
| **Personenbezogene Daten** | - **Online-Mitgliedsantrag (`/mitmachen/mitglied-werden/`)**: Vorname, Nachname, Geburtsdatum (optional), Anschrift (Straße, Nr., PLZ, Ort), E-Mail-Adresse, Telefonnummer, gewählte Beitragsstufe (Silver, Gold, Platinum, Firma), SEPA-Bankverbindungsdaten (IBAN, BIC, Kontoinhaber), Datum der Antragstellung, Bestätigung von Satzung und Datenschutz.<br>- **Kontaktformular (`/kontakt/`)**: Vorname, Nachname, E-Mail-Adresse, Telefon (optional), Betreff, Freitextnachricht.<br>- **Raumvermietungsanfragen**: Name, Organisation, Kontaktdaten, gewünschte Nutzungszeiten. |
| **Verarbeitungszweck** | - Rechtsverbindliche Abwicklung und Prüfung von Vereinsbeitritten gem. Vereinssatzung.<br>- Führung des internen Mitgliederverzeichnisses.<br>- Beantwortung und Bearbeitung von Anfragen und Kooperationsgesuchen.<br>- Auslösen von Redaktions-Builds via GitHub-Connector (ohne Personendaten im Repository). |
| **Rechtsgrundlage** | - **Mitgliedsanträge**: **Art. 6 Abs. 1 lit. b DSGVO** (Erfüllung eines Mitgliedschaftsvertrages bzw. vorvertragliche Maßnahmen) i.V.m. **Art. 6 Abs. 1 lit. c DSGVO** (Erfüllung rechtlicher und steuerlicher Pflichten gem. § 147 AO, § 257 HGB).<br>- **Kontakt- & Raumanfragen**: **Art. 6 Abs. 1 lit. a DSGVO** (Einwilligung des Nutzers bei Absenden) sowie **Art. 6 Abs. 1 lit. f DSGVO** (Berechtigtes Interesse an ordnungsgemäßer Kommunikation mit Interessierten). |
| **Speicherort & Übermittlung** | - **Microsoft 365 Tenant**: Rechenzentren innerhalb der Europäischen Union (EU Data Boundary / Region Deutschland & Europa).<br>- **GitHub-Connector**: Der Connector übermittelt rein technische Triggersignale (Repository Dispatch Events) und formatierte Markdown-Inhalte für Blog/News. **Personenbezogene Antragsdaten werden niemals in GitHub-Repositories gespeichert oder committet.** |
| **Speicherdauer** | - **Mitgliederdaten**: Für die Dauer der Vereinsmitgliedschaft.<br>- **Steuer- und Beitragsunterlagen (SEPA, Zahlungsbelege, Spendenbescheinigungen)**: 10 Jahre gesetzliche Aufbewahrungsfrist nach § 147 Abgabenordnung (AO).<br>- **Allgemeine Kontaktanfragen**: Löschung nach abschließender Klärung des Anliegens (Regelfrist: 6 Monate nach letztem Kontakt), sofern keine gesetzlichen Aufbewahrungsfristen greifen. |
| **Auftragsverarbeitung (AVV)** | Microsoft Data Protection Addendum (DPA) / Auftragsverarbeitungsvertrag nach Art. 28 DSGVO mit Microsoft Ireland Operations Ltd. vorhanden. |

---

### Dienst 4: Hausbibliothek-App (`hausbibliothek.org` als externe Webanwendung)

| Kriterium | Spezifikation & Bewertung |
|---|---|
| **Dienst & Funktion** | Digitales Bibliotheks- und Medienverwaltungssystem (`hausbibliothek.org`), betrieben als eigenständiger Docker-Container-Service hinter dem zentralen Caddy Reverse Proxy. |
| **Personenbezogene Daten** | - **Leser-Stammdaten**: Vorname, Nachname, E-Mail-Adresse, Telefonnummer.<br>- **Zugangs- & Sicherheitsdaten**: Verschlüsselte Passwort-Hashes (`bcrypt`/Argon2id), Session-ID (`PHPSESSID` mit `Secure`, `HttpOnly`, `SameSite=Lax`), CSRF-Token (`hash_equals`).<br>- **Ausleih- & Bestandsdaten**: Aktuelle Ausleihen, Ausleihhistorie (ausgeliehene Buchtitel, Entleihdatum, Rückgabedatum), Vormerkungen, Mahnstatus.<br>- **Status- & Beitragsdaten**: Jahresbeitrag bezahlt (`fee_paid`), Kontosperrstatus (`is_blocked`), dokumentierte Einwilligungen (`data_consent`, `rules_consent`). |
| **Verarbeitungszweck** | Betrieb der Hausbibliothek des SprachCafé Polnisch e.V.: Bereitstellung des Online-Katalogs, Durchführung von Buchausleihen und Rückgaben, Vormerkungen, Fristenverwaltung und Schutz des Vereinsbestands vor Medienverlust. |
| **Rechtsgrundlage** | **Art. 6 Abs. 1 lit. b DSGVO** (Erfüllung des Nutzungsvertrages gemäß Bibliotheksordnung) sowie **Art. 6 Abs. 1 lit. f DSGVO** (Berechtigtes Interesse an der Sicherung und Nachverfolgung des Vereinseigentums). |
| **Speicherort & Übermittlung** | Eigener Linux-Host / dedizierter Docker-Container (`library_backend` & `library_db`) auf AWS Lightsail VPS in **Frankfurt am Main (`eu-central-1`), Deutschland**. Keine Übermittlung an externe Dritte. |
| **Speicherdauer & Löschkonzept (Art. 17 DSGVO)** | - **Aktive Lesekonten**: Für die Dauer der aktiven Bibliotheksnutzung.<br>- **Automatisiertes Löschkonzept (`dsgvo_cleanup.php`)**: Konten, die seit **24 Monaten (2 Jahren)** keine Aktivitäten (keine Anmeldung, keine Ausleihe, keine Vormerkung) aufweisen und keine offenen Entleihungen oder Gebühren haben, werden automatisch unwiderruflich gelöscht.<br>- **Anonymisierung historischer Ausleihdaten**: Um wissenschaftliche und vereinseigene Nutzungsstatistiken zu erhalten, wird bei Kontolöschung der Personenbezug (`user_id = NULL`) entfernt. Die Ausleihzählung des Buches bleibt rein anonymisiert erhalten. |
| **Sicherheitsmaßnahmen (TOMs)** | - Strikte Session-Absicherung (HTTPS only, HttpOnly, SameSite=Lax).<br>- Kryptographische CSRF-Token-Prüfung bei allen verändernden Anfragen.<br>- API-Cache-Bypass (`Cache-Control: no-store, no-cache, must-revalidate`).<br>- Rollenbasierte Zugriffskontrolle (Leser vs. Bibliothekar/Admin). |

---

### Dienst 5: Caddy Reverse Proxy & AWS Lightsail Server-Logs

| Kriterium | Spezifikation & Bewertung |
|---|---|
| **Dienst & Funktion** | Webserver und zentraler TLS-Reverse-Proxy (Caddy v2) auf dem AWS Lightsail VPS. |
| **Personenbezogene Daten** | Technische Verbindungsdaten / Server-Access-Logs:<br>- IP-Adresse des anfragenden Geräts (Client-IP)<br>- Datum und Uhrzeit des Abrufs (Timestamp inkl. Zeitzone)<br>- HTTP-Anfragemethode (`GET`, `POST` etc.) und angeforderte URL/Ressource<br>- HTTP-Statuscode des Servers (z. B. `200 OK`, `301 Moved`, `404 Not Found`)<br>- Übertragene Datenmenge in Bytes<br>- Referrer-URL (die zuvor besuchte Seite, sofern vom Browser übermittelt)<br>- User-Agent-String (Informationen zu Browsertyp, Version und Betriebssystem) |
| **Verarbeitungszweck** | - Gewährleistung des stabilen, unterbrechungsfreien Betriebs der Webanwendung.<br>- Erkennung und Abwehr von Cyberangriffen, Brute-Force-Attacken und DDoS-Versuchen.<br>- Fehlerdiagnose und Behebung technischer Störungen.<br>- Erfüllung gesetzlicher IT-Sicherheitsanforderungen (Art. 32 DSGVO). |
| **Rechtsgrundlage** | **Art. 6 Abs. 1 lit. f DSGVO** (Berechtigtes Interesse des Verantwortlichen an der Aufrechterhaltung der Betriebssicherheit, Systemintegrität und Abwehr von Missbrauch) i.V.m. **§ 25 Abs. 2 Nr. 2 TDDDG**. |
| **Speicherort & Übermittlung** | Lokaler flüchtiger Speicher / Log-Dateien auf der VPS-Instanz (AWS Lightsail, Frankfurt am Main / `eu-central-1`, Deutschland). Keine Weitergabe an Dritte oder Werbenetzwerke. |
| **Speicherdauer** | **Maximal 7 bis 14 Tage** (rollierende Log-Rotation via Logrotate). Nach Ablauf dieses Zeitraums werden die Access-Logs automatisiert überschrieben bzw. unwiderruflich gelöscht. Es erfolgt keine langfristige Speicherung oder Erstellung von Nutzerprofilen. |

---

## 3. Verzeichnis der Verarbeitungstätigkeiten (Übersichtsmatrix gem. Art. 30 DSGVO)

| Nr. | Verfahren / Dienst | Verarbeitete Datenkategorien | Betroffene Personen | Rechtsgrundlage | Speicherort / Drittland | Regellöschfrist |
|:---:|---|---|---|:---:|---|---|
| **1** | **Google Calendar Sync** | Veranstaltungsmetadaten, Referentennamen | Dozierende, Referent\*innen | Art. 6 (1) lit. f DSGVO | Google EU / Build Memory (DE) | Flüchtig / max. 24h im Build-Cache |
| **2** | **AWS S3 Cloud Storage** | Buch-Cover, Medien, Satzungs-PDFs, Backups | Vereinsöffentlichkeit, Redaktion | Art. 6 (1) lit. f DSGVO | AWS `eu-central-1` (Frankfurt, DE) | Permanent (Assets) / 30-90 Tage (Backups) |
| **3a** | **M365 / Power Automate (Mitgliedsantrag)** | Name, Anschrift, E-Mail, Tel, Beitragsstufe, SEPA/IBAN | Antragsteller\*innen, Vereinsmitglieder | Art. 6 (1) lit. b & c DSGVO | Microsoft 365 EU Tenant | Dauer der Mitgliedschaft + 10 Jahre (§ 147 AO) |
| **3b** | **M365 / Power Automate (Kontakt)** | Name, E-Mail, Telefon, Anfragetext | Website-Besucher\*innen | Art. 6 (1) lit. a & f DSGVO | Microsoft 365 EU Tenant | 6 Monate nach Erledigung |
| **4** | **Hausbibliothek-App** | Name, E-Mail, Tel, Ausleihhistorie, Passwort-Hash, Session | Bibliotheksmitglieder | Art. 6 (1) lit. b & f DSGVO | Docker / Lightsail (Frankfurt, DE) | 24 Monate Inaktivität (automatisierte Löschung / Anonymisierung) |
| **5** | **Caddy / Server-Logs** | IP-Adresse, Timestamp, URI, User-Agent, Statuscode | Alle Website-Besucher\*innen | Art. 6 (1) lit. f DSGVO, § 25 TDDDG | Lokaler VPS-Speicher (Frankfurt, DE) | 7–14 Tage (rollierende Löschung) |

---

## 4. Rechte der betroffenen Personen (Art. 12–23 DSGVO)

Betroffene Personen haben gegenüber dem SprachCafé Polnisch e.V. folgende gesetzliche Rechte:

1. **Auskunftsrecht (Art. 15 DSGVO)**: Auskunft über die verarbeiteten personenbezogenen Daten.
2. **Recht auf Berichtigung (Art. 16 DSGVO)**: Unverzügliche Korrektur unrichtiger oder unvollständiger Daten.
3. **Recht auf Löschung (Art. 17 DSGVO)**: Löschung von Daten, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
4. **Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)**: Bei Bestreiten der Richtigkeit oder unrechtmäßiger Verarbeitung.
5. **Recht auf Datenübertragbarkeit (Art. 20 DSGVO)**: Erhalt der bereitgestellten Daten in einem strukturierten, gängigen Format (z. B. JSON/CSV).
6. **Widerspruchsrecht (Art. 21 DSGVO)**: Widerspruch gegen Verarbeitungen auf Basis berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO).

Anfragen zur Ausübung dieser Rechte können formlos an den Vorstand unter **`kontakt@sprachcafe-polnisch.org`** gerichtet werden.

---

## 5. Fazit & Datenschutz-Konformitätserklärung

Das Relaunch-System des SprachCafé Polnisch e.V. erfüllt alle Anforderungen der Datenschutz-Grundverordnung (DSGVO) sowie des Telekommunikation-Digitale-Dienste-Datenschutz-Gesetzes (TDDDG):

- **Hohe Datensicherheit durch Architektur**: Durch den Einsatz von Static Site Generation (SSG) existieren keine Angriffsflächen auf Besucherdaten im Hauptportal.
- **Transparente Speicherorte**: Alle dynamischen Datenverarbeitungen finden ausschließlich in Rechenzentren innerhalb der Europäischen Union (Deutschland / EU) statt.
- **Rechtssichere AVVs**: Notwendige Auftragsverarbeitungsverträge mit Auftragsverarbeitern (AWS, Microsoft) liegen vor bzw. sind über deren EU-DPA rechtswirksam eingebunden.
- **Automatisiertes Löschen**: Für die Hausbibliothek existiert ein implementiertes, automatisiertes Lösch- und Anonymisierungskonzept (`dsgvo_cleanup.php`).
