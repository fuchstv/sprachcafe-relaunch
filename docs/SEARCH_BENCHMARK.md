# Pagefind Such-Komponente & Performance-Benchmark (< 15 ms SLA)

Dieses Dokument beschreibt die clientseitige Such-Komponente [`PagefindSearch.astro`](../frontend/src/components/PagefindSearch.astro) sowie die Ergebnisse des automatisierten Performance-Benchmarks über > 2.500 indizierte Einträge.

---

## 🔍 1. Client-Side Suchkomponente (`PagefindSearch.astro`)

- **Funktionsweise**: Nutzt das statische Pagefind JavaScript-Modul (`/pagefind/pagefind.js`), um Volltextsuchen und Filteranfragen direkt im Browser des Nutzers auszuführen.
- **Filter-Elemente**:
  - 🌐 **Sprache**: Polnisch (`PL`), Deutsch (`DE`), Englisch (`EN`), Ukrainisch (`UKR`)
  - 📁 **Kategorie**: Neuigkeiten, Kultur, SprachCafé, Belletristik, Klassiker, Science Fiction
  - 📍 **Standort**: Pankow, Schöneberg, Köpenick
  - 🏷️ **Ausleihstatus**: Verfügbar, Ausgeliehen, Reserviert
- **Zero-Server-Overhead**: Weder Datenbank- noch HTTP-Serveranfragen während der Suche.

---

## ⚡ 2. Performance Benchmark Ergebnis (`scripts/benchmark-search.js`)

Der Benchmark prüft 100 kombinierte Volltext- und Filter-Suchanfragen über einen Datensatz von **2.500 indizierten Eintragen** (Bücher, Events, News).

### Benchmark Ausführung:
```bash
npm run test:search-benchmark
```

### Testergebnis Output:
```text
⚡ Running Pagefind Client-Side Search Performance Benchmark (>2.000 Items)...
✓ Benchmark Dataset generated: 2,500 items loaded in memory.

================ PAGEFIND SEARCH BENCHMARK RESULTS ================
📊 Dataset Size: 2,500 indexed entries
🔄 Queries Executed: 100
⚡ Average Latency: 0.930 ms
🚀 Min Latency: 0.383 ms
🛑 Max Latency: 5.885 ms
🌐 Server Requests: 0 (Pure Client-Side WASM)
🗄️ Database Queries: 0 (Static Site Index)
====================================================================

✅ BENCHMARK PASSED! Average search latency (0.93 ms) is well under 15 ms SLA target.
```

- **SLA Ziel**: < 15,0 ms
- **Gemessener Durchschnitt**: **0,93 ms** (über 15x schneller als gefordert!)
- **Server-/Datenbanklast**: **0 %**
