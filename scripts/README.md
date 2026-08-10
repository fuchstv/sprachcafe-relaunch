# Phase 6: Migration Skripte (`/scripts`)

Dieses Verzeichnis enthält Automatisierungs- und Migrationsskripte für den Transfer von Daten aus dem bestehenden WordPress-System sowie der alten Hausbibliothek-Datenbank in das neue Headless CMS.

## Skripte

- `wp_migration.py`: Liest Beiträge, Seiten und Medien über die WordPress REST API aus und transformiert sie in Collections für das Headless CMS.
- `hausbibliothek_migration.py`: Liest Bestands- und Ausleihdaten der Hausbibliothek aus CSV/SQL-Exporte und importiert sie in die CMS-Datenbank.
- `requirements.txt`: Python-Abhängigkeiten für die Ausführung der Migrationsskripte.

## Ausführung

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt

# WordPress Daten migrieren
python3 scripts/wp_migration.py

# Hausbibliothek Daten migrieren
python3 scripts/hausbibliothek_migration.py
```
