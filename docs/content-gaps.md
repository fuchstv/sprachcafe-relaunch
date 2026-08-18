# Open Content & Navigation Gaps (TODO-Liste für Phasen R2 / R3 / R4)

Dieses Dokument erfasst alle auf der Staging-Umgebung (`beta.sprachcafe-polnisch.org`) aktiven Platzhalter, fehlenden Navigationspunkte und noch zu ersetzenden Medieninhalte.

---

## 📌 Status-Übersicht

> [!IMPORTANT]
> Die folgenden Punkte sind bewusst als offene TODOs markiert und werden in den kommenden Phasen R2, R3 und R4 schrittweise abgearbeitet. Sie stellen keinen finalen Stand dar.

---

## 📋 Offene Punkte & Platzhalter

### 1. ⚖️ Rechtliche Seiten & Footer-Links (✅ Erledigt)
- **Status**: Die statischen Seiten `/datenschutz/`, `/impressum/` und `/barrierefreiheit/` sind vollständig implementiert.
- **Footer-Integration**: Der Footer löst alle früheren Platzhalter (`#privacy`, `#imprint`, `#accessibility`) ab und verlinkt dynamisch in allen Sprachversionen (DE: *Barrierefreiheit*, PL: *Deklaracja dostępności*, EN: *Accessibility Statement*) direkt auf `/barrierefreiheit/`.

### 2. 🖼️ Testimonial-Medien & Fotos
- **Problem**: Die im Testimonial-Bereich eingebundenen Profilbilder verwenden generische Unsplash-Stockphotos anstelle echter Aufnahmen des Vereins.
- **Ziel (Phase R3)**:
  - Austausch der Unsplash-Bilder durch authentische, freigegebene Fotos des SprachCafé-Teams, von Ehrenamtlichen und Besucher:innen.
  - Einbindung optimierter WebP-Formate inklusive Alt-Texte.

### 3. 🧭 Hauptnavigation & Seiten-Struktur
- **Problem**: Die aktuelle Hauptnavigation deckt zentrale Vereinsbereiche noch nicht ab. Es fehlen:
  - **Über uns** (Vereinsgeschichte, Mission, Vorstandsübersicht)
  - **Laden** (Informationen zum Nachbarschaftsladen & Begegnungsraum)
  - **Kunstgalerie** (Ausstellungen & kulturelle Angebote)
  - **Mehrsprachigkeit** (Sprachtreffs, Sprachkurse & Tandems)
  - **Mitmachen / Mitglied werden** (Ehrenamt, Spenden & Mitgliedsantrag)
- **Ziel (Phase R2 / R4)**:
  - Ergänzung der fehlenden Unterseiten im Astro Frontend.
  - Aktualisierung der Hauptnavigation in Header und Mobile Navigation.

---

## 🗓️ Umsetzungsfahrplan

| Bereich | Betroffener Pfad / Komponente | Geplante Phase |
|---|---|---|
| Impressum & Datenschutz | `/impressum`, `/datenschutz` | **Phase R2** |
| Navigation (Über uns, Mitmachen, etc.) | `Header.astro`, `Navigation.astro` | **Phase R2 / R4** |
| Realitätsnahe Team- & Testimonial-Fotos | `src/assets/images/testimonials/` | **Phase R3** |
