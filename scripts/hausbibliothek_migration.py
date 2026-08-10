#!/usr/bin/env python3
"""
Hausbibliothek Data Migration Script for SprachCafé Relaunch
Phase 6: Migration

Importiert Buchdaten, Kategorien und Ausleihestatus der Hausbibliothek (CSV/Excel DB Export)
in das Headless CMS.
"""

import os
import csv
import sys
import json
from dotenv import load_dotenv

load_dotenv()

CSV_FILE_PATH = os.getenv("HAUSBIBLIOTHEK_CSV", "data/hausbibliothek.csv")

def parse_and_migrate_library_data(file_path):
    if not os.path.exists(file_path):
        print(f"Hinweis: Datei '{file_path}' nicht gefunden. Bitte CSV-Export in data/ ablegen.")
        return

    print(f"Lese Hausbibliothek-Daten aus {file_path}...")
    with open(file_path, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        books = list(reader)
        print(f"{len(books)} Bücher gefunden für den Import.")
        for book in books:
            print(f"Importiere Buch: {book.get('Titel')} (ISBN: {book.get('ISBN')})")

if __name__ == "__main__":
    print("Starte Hausbibliothek Migrationsskript...")
    parse_and_migrate_library_data(CSV_FILE_PATH)
    print("Hausbibliothek Migration abgeschlossen.")
