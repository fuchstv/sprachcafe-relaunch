# ✉️ Power Automate E-Mail Flows für Server-Wartung, Updates & Reboots

> **Zweck:**  
> Dieser Leitfaden beschreibt die Einrichtung und den Betrieb der automatisierten **E-Mail-Benachrichtigungen via Microsoft Power Automate**, damit der IT-Administrator (`p.fuchs@sprachcafe-polnisch.org`) bei Server-Wartungen, Kernel-Upgrades, Reboot-Bedarf und Störungen sofort einen **strukturierten Überblick erhält** über:
> 1. **Was getan wurde** (z.B. durchgeführte Backups, installierte APT-Pakete, Neustarts).
> 2. **Den aktuellen System-Health-Status** (Erreichbarkeit aller 5 Web-Endpunkte, SQLite DB-Integrität, RAM-Auslastung).
> 3. **Was noch zu wissen / zu tun ist** (z.B. anstehende Reboots im Wartungsfenster oder erforderliche Freigaben).

---

## 📑 Inhaltsverzeichnis
1. [Architektur & Auslöser (Trigger-Matrix)](#1-architektur--auslöser-trigger-matrix)
2. [Flow-Spezifikation (JSON & Webhook-Schema)](#2-flow-spezifikation-json--webhook-schema)
3. [E-Mail-Design & Vorlagen-Struktur](#3-e-mail-design--vorlagen-struktur)
4. [Server-Integration (server_maintenance.sh & backup_db.sh)](#4-server-integration-server_maintenancesh--backup_dbsh)
5. [Schritt-für-Schritt Einrichtung im Power Automate Portal](#5-schritt-für-schritt-einrichtung-im-power-automate-portal)
6. [CLI-Test & Funktionsprüfung](#6-cli-test--funktionsprüfung)

---

## 1. Architektur & Auslöser (Trigger-Matrix)

```mermaid
flowchart LR
    subgraph Server [🖥️ EC2 Server (3.66.205.213)]
        Cron[⏱️ Monatlicher Wartungs-Cron] --> Maint["server_maintenance.sh"]
        BackupCron[⏱️ Täglicher Backup-Cron] --> Backup["backup_db.sh"]
        
        Maint -->|POST JSON Webhook| Dispatcher["Webhook Dispatcher"]
        Backup -->|POST JSON Webhook| Dispatcher
    end

    subgraph M365 [🏢 Microsoft Power Automate]
        Dispatcher -->|HTTPS Request| Trigger["HTTP Request Received Trigger"]
        Trigger --> Action["Send an email (V2) - Office 365 Outlook"]
    end

    subgraph Admin [📬 Postfach des IT-Admins]
        Action --> Inbox["p.fuchs@sprachcafe-polnisch.org"]
    end
```

### Ereignis- und Schweregrad-Matrix:

| Ereignis-Typ (`event_type`) | Schweregrad (`severity`) | Auslöser | E-Mail-Inhalt / Zweck |
| :--- | :--- | :--- | :--- |
| `MAINTENANCE_COMPLETED` | `INFO` | Nach monatlichem `server_maintenance.sh --full` | Erfolgsbericht: Installierte Pakete, S3-Backup-Status, 100% Health Check |
| `REBOOT_REQUIRED` | `WARNING` | Nach Kernel-Update (`/var/run/reboot-required`) | Information über anstehenden Neustart mit Paket-Details & Zeitfenster-Empfehlung |
| `REBOOT_EXECUTED` | `INFO` | Nach automatischem/manuellem Reboot | Bestätigung über erfolgreichen Wiederanlauf aller Dienste |
| `HEALTH_CHECK_ALERT` | `CRITICAL` | Wenn eine Domain (z.B. `hausbibliothek.org`) nicht mit 200 antwortet | Sofortige Störungsmeldung mit HTTP-Fehlercode & Runbook-Link |
| `BACKUP_FAILED` | `CRITICAL` | Wenn S3-Sync oder SQLite-Backup fehlschlägt | Notfall-Alert mit Backup-Log & Speicherplatz-Info |

---

## 2. Flow-Spezifikation (JSON & Webhook-Schema)

- **Flow-Name:** `SprachCafé - Server-Wartung, Updates & Reboot Alerts`
- **Datei:** [`scripts/flows/flow-server-ops-alert.json`](file:///home/ubuntu/sprachcafe-relaunch/scripts/flows/flow-server-ops-alert.json)

### JSON Webhook Payload-Schema:
```json
{
  "event_type": "MAINTENANCE_COMPLETED",
  "severity": "INFO",
  "server": "3.66.205.213 (ip-172-26-13-42)",
  "kernel": "7.0.0-1011-aws",
  "summary": "Monatliche Server-Wartung erfolgreich abgeschlossen. 1 Paket aktualisiert.",
  "what_was_done": "• Atomares Multi-DB Backup nach AWS S3 synchronisiert.\n• 1 APT-Paket aktualisiert (fwupd 2.0.20).\n• Caddy & Docker Container neu geladen.",
  "health_status": "• sprachcafé.org: HTTP 200 OK\n• hausbibliothek.org: HTTP 200 OK\n• team.sprachcafé.org: HTTP 200 OK\n• RAM: 853MB / 1.9GB (stabil unter 1.1 GB)",
  "action_required": "Keine Aktion erforderlich – alle Vereinssysteme laufen einwandfrei.",
  "timestamp": "2026-09-01T16:30:00Z"
}
```

---

## 3. E-Mail-Design & Vorlagen-Struktur

Die E-Mail wird als professionelles, responsives HTML im SprachCafé Corporate Design (`#8B263E` Weinrot, `#FAF6EE` Beige) formatiert:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  🏛️ SprachCafé Polnisch – Server & IT Alert                            │
│  Host: 3.66.205.213 | Kernel: 7.0.0-1011-aws                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [STATUS BADGE] Ereignis: MAINTENANCE_COMPLETED (INFO)                 │
│  Monatliche Server-Wartung erfolgreich abgeschlossen.                  │
│                                                                        │
│  📋 Was getan wurde:                                                   │
│  • Atomares Multi-DB Backup nach AWS S3 synchronisiert.                │
│  • 1 APT-Paket aktualisiert (fwupd).                                  │
│  • Caddy Reverse Proxy & Docker Container reloaded.                   │
│                                                                        │
│  🔍 System-Health & Status:                                            │
│  • Alle 5 öffentlichen Web-Endpunkte antworten mit HTTP 200/302.       │
│  • SQLite DB-Integrität (Hausbibliothek & Dienstplan): OK              │
│  • RAM-Auslastung: 853 MB / 1.9 GB (< 1.1 GB Benchmark).              │
│                                                                        │
│  ⚠️ Was du noch wissen solltest / Handlungsempfehlung:                 │
│  Keine Aktion erforderlich – alle Vereinssysteme laufen einwandfrei.   │
│                                                                        │
│  [ Button: Zum Intranet-Hub ]                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Server-Integration (server_maintenance.sh & backup_db.sh)

Das Wartungsskript [`scripts/server_maintenance.sh`](file:///home/ubuntu/sprachcafe-relaunch/scripts/server_maintenance.sh) verfügt über eine integrierte Dispatcher-Funktion:

```bash
# Webhook-URL in .env hinterlegen (Sicher & nicht in Git):
M365_OPS_NOTIFICATION_WEBHOOK_URL="https://defaultb745a80a...powerplatform.com/...sig=..."
```

Wird keine URL konfiguriert, loggt das Skript die Meldung lokal, ohne abzubrechen (Fail-Safe).

---

## 5. Schritt-für-Schritt Einrichtung im Power Automate Portal

1. Öffne **[make.powerautomate.com](https://make.powerautomate.com)** mit dem Vereinskonto.
2. Klicke auf **+ Erstellen** ➔ **Sofortiger Cloud-Flow**.
3. Name: `SprachCafé - Server-Wartung, Updates & Reboot Alerts`.
4. Trigger wählen: **Beim Empfang einer HTTP-Anforderung** (Method: `POST`).
5. Klicke auf *„Beispielnutzdaten zum Generieren eines Schemas verwenden“* und füge das obige JSON-Beispiel ein.
6. Neue Aktion hinzufügen: **E-Mail senden (V2)** (Office 365 Outlook):
   - **An:** `p.fuchs@sprachcafe-polnisch.org`
   - **Betreff:** `[SprachCafé Ops] @{triggerBody()?['severity']}: @{triggerBody()?['summary']}`
   - **Textkörper:** HTML-Vorlage aus [`scripts/flows/flow-server-ops-alert.json`](file:///home/ubuntu/sprachcafe-relaunch/scripts/flows/flow-server-ops-alert.json).
7. Flow speichern und die generierte **HTTP-POST-URL** kopieren.
8. URL auf dem Server in `/home/ubuntu/sprachcafe-relaunch/.env` eintragen als:
   ```env
   M365_OPS_NOTIFICATION_WEBHOOK_URL="DEINE_KOPIERTE_HTTP_POST_URL"
   ```

---

## 6. CLI-Test & Funktionsprüfung

Du kannst den Benachrichtigungs-Flow jederzeit direkt von der Kommandozeile aus testen:

```bash
# Test-Alert via CLI absetzen:
npx tsx scripts/test_ops_email_alert.ts

# Oder im Rahmen eines Wartungs-Checks:
npm run server:check
```
