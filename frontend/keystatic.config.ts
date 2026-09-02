import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: process.env.NODE_ENV === 'production' && process.env.KEYSTATIC_GITHUB_REPO
    ? {
        kind: 'github',
        repo: {
          owner: process.env.KEYSTATIC_GITHUB_OWNER || 'fuchstv',
          name: process.env.KEYSTATIC_GITHUB_REPO || 'sprachcafe-relaunch',
        },
        branchPrefix: 'content/',
      }
    : {
        kind: 'local',
      },
  ui: {
    brand: {
      name: 'SprachCafé Polnisch Redaktion',
    },
    navigation: {
      'Inhalte & Redaktion': ['news', 'exhibitions'],
      'Verein & Kiosk': ['team', 'shopItems'],
    },
  },
  collections: {
    news: collection({
      label: 'Aktuelles & Newsletter',
      slugField: 'title',
      path: 'src/content/news/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Titel' }),
        date: fields.date({ label: 'Datum' }),
        language: fields.select({
          label: 'Sprache',
          options: [
            { label: 'Deutsch', value: 'de' },
            { label: 'Polnisch', value: 'pl' },
            { label: 'Englisch', value: 'en' },
          ],
          defaultValue: 'de',
        }),
        type: fields.select({
          label: 'Kategorie',
          options: [
            { label: 'Newsletter', value: 'newsletter' },
            { label: 'Ankündigung', value: 'announcement' },
            { label: 'Presse', value: 'press' },
          ],
          defaultValue: 'newsletter',
        }),
        description: fields.text({ label: 'Kurzbeschreibung', multiline: true }),
        sourceUrl: fields.text({ label: 'Quell-Link' }),
        campaignId: fields.text({ label: 'Kampagnen-ID' }),
        content: fields.markdoc({ label: 'Inhalt / Artikel' }),
      },
    }),
    team: collection({
      label: 'Team & Vorstand',
      slugField: 'name',
      path: 'src/content/team/*',
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Vollständiger Name' }),
        category: fields.select({
          label: 'Kategorie',
          options: [
            { label: 'Vorstand', value: 'vorstand' },
            { label: 'Büroleitung & Koordination', value: 'leitung' },
            { label: 'Kursleitung / Dozent*in', value: 'kursleitung' },
            { label: 'Ehrenamt / Team', value: 'team' },
          ],
          defaultValue: 'team',
        }),
        role: fields.object({
          de: fields.text({ label: 'Rolle (Deutsch)' }),
          pl: fields.text({ label: 'Rolle (Polnisch)' }),
          en: fields.text({ label: 'Rolle (Englisch)' }),
        }),
        contact: fields.object({
          email: fields.text({ label: 'E-Mail-Adresse' }),
          phone: fields.text({ label: 'Telefonnummer' }),
          linkedin: fields.text({ label: 'LinkedIn-Profil' }),
        }),
        photo: fields.text({ label: 'Pfad zum Porträtfoto' }),
        bio: fields.object({
          de: fields.text({ label: 'Kurzbiografie (Deutsch)', multiline: true }),
          pl: fields.text({ label: 'Kurzbiografie (Polnisch)', multiline: true }),
          en: fields.text({ label: 'Kurzbiografie (Englisch)', multiline: true }),
        }),
        order: fields.integer({ label: 'Sortierreihenfolge', defaultValue: 10 }),
      },
    }),
    shopItems: collection({
      label: 'Vereinsshop / Kiosk',
      slugField: 'order',
      path: 'src/content/shopItems/*',
      format: { data: 'yaml' },
      schema: {
        order: fields.integer({ label: 'Artikelnummer / Reihenfolge', defaultValue: 1 }),
        name: fields.object({
          de: fields.text({ label: 'Artikelname (Deutsch)' }),
          pl: fields.text({ label: 'Artikelname (Polnisch)' }),
          en: fields.text({ label: 'Artikelname (Englisch)' }),
        }),
        priceDisplay: fields.object({
          de: fields.text({ label: 'Preis (z. B. 2,50 €)' }),
          pl: fields.text({ label: 'Preis PL' }),
          en: fields.text({ label: 'Preis EN' }),
        }),
        availability: fields.select({
          label: 'Verfügbarkeit',
          options: [
            { label: 'Auf Lager', value: 'in_stock' },
            { label: 'Ausverkauft', value: 'out_of_stock' },
            { label: 'Vorbestellung', value: 'preorder' },
            { label: 'Auf Anfrage', value: 'on_request' },
          ],
          defaultValue: 'in_stock',
        }),
        description: fields.object({
          de: fields.text({ label: 'Beschreibung DE', multiline: true }),
          pl: fields.text({ label: 'Beschreibung PL', multiline: true }),
          en: fields.text({ label: 'Beschreibung EN', multiline: true }),
        }),
        image: fields.text({ label: 'Bild-Pfad' }),
        orderLink: fields.text({ label: 'Bestelllink / PayPal' }),
      },
    }),
    exhibitions: collection({
      label: 'Ausstellungen & Kunst',
      slugField: 'artist',
      path: 'src/content/exhibitions/*',
      format: { data: 'yaml' },
      schema: {
        artist: fields.text({ label: 'Künstler*in' }),
        title: fields.object({
          de: fields.text({ label: 'Titel DE' }),
          pl: fields.text({ label: 'Titel PL' }),
          en: fields.text({ label: 'Titel EN' }),
        }),
        startDate: fields.date({ label: 'Beginn' }),
        endDate: fields.date({ label: 'Ende' }),
        description: fields.object({
          de: fields.text({ label: 'Beschreibung DE', multiline: true }),
          pl: fields.text({ label: 'Beschreibung PL', multiline: true }),
          en: fields.text({ label: 'Beschreibung EN', multiline: true }),
        }),
      },
    }),
  },
});
