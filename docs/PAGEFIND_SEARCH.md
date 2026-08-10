# Pagefind Statische Volltextsuche & Indizierung

Dieses Dokument dokumentiert die Integration der hochperformanten, statischen Volltextsuchmaschine **Pagefind** in den Astro 5 SSG Build-Prozess.

---

## ⚡ 1. Build-Prozess Integration (`package.json`)

Der Build-Skriptbefehl führt automatisch nach der statischen HTML-Generierung von Astro den Pagefind-Indizierungsschritt aus:

```json
{
  "scripts": {
    "build": "astro build && pagefind --site dist",
    "pagefind": "pagefind --site dist",
    "test:a11y": "astro build && pagefind --site dist && node scripts/test-a11y.js"
  }
}
```

- **Quell-Ordner**: `dist` (Astro HTML Output)
- **Ziel-Ordner**: `dist/pagefind/` (Statische Such-Indizes, WASM & Leichtgewichtige JS-Chunks)

---

## 🏷️ 2. Indizierung & Filter-Attribute (`data-pagefind-body` & `data-pagefind-filter`)

Pagefind erfasst ausschließlich Seiten und Inhaltsbereiche, die explizit mit `data-pagefind-body` ausgezeichnet sind. Dadurch bleiben Navigation, Footer und Boilerplate-Elemente aus den Suchergebnissen ausgeschlossen.

### A. Blogbeiträge ([`src/pages/posts/[slug].astro`](../frontend/src/pages/posts/[slug].astro))
```html
<article
  data-pagefind-body
  data-pagefind-filter="type:Post, category:Neuigkeiten, location:Global"
>
  <!-- Artikelinhalt -->
</article>
```

### B. Veranstaltungen ([`src/pages/events/[slug].astro`](../frontend/src/pages/events/[slug].astro))
```html
<article
  data-pagefind-body
  data-pagefind-filter="type:Event, location:Pankow, language:Bilingual, target_group:Alle"
>
  <!-- Eventdetails -->
</article>
```

### C. Hausbibliothek Buchkatalog ([`src/pages/hausbibliothek/[id].astro`](../frontend/src/pages/hausbibliothek/[id].astro))
```html
<article
  data-pagefind-body
  data-pagefind-filter="type:Book, language:PL, category:Belletristik, location:Pankow, status:verfuegbar"
>
  <!-- Buchdetails & ISBN -->
</article>
```

---

## 📊 3. Performance & Zero-Server-Overhead

- 🚀 **0 ms Server-Latenz**: Suchanfragen werden zu 100% clientseitig im Browser über hochgradig komprimierte WASM-Index-Files aufgelöst.
- 📉 **Minimale Bandbreite**: Bei einer Suchanfrage lädt Pagefind nur winzige Index-Happen (oft < 10 KB) anstelle eines großen Monolith-Indexes.
- 🔒 **DSGVO-Konform**: Keine Suchdaten verlassen den Browser des Nutzers.
