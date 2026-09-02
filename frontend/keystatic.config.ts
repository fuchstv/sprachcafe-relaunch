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
        title: fields.slug({ name: { label: 'Titel' } }),
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
        image: fields.image({
          label: 'Beitragsbild / Titelbild hochladen',
          directory: 'public/images/news',
          publicPath: '/images/news/',
        }),
        content: fields.markdoc({
          label: 'Inhalt / Artikel',
          extension: 'md',
          options: {
            image: {
              directory: 'public/images/content',
              publicPath: '/images/content/',
            },
          },
        }),
      },
    }),
    team: collection({
      label: 'Team & Vorstand',
      slugField: 'name',
      path: 'src/content/team/*',
      format: { contentField: 'content' },
      schema: {
        name: fields.slug({ name: { label: 'Vollständiger Name' } }),
        category: fields.select({
          label: 'Kategorie',
          options: [
            { label: 'Vorstand', value: 'vorstand' },
            { label: 'Verwaltung / Koordination', value: 'verwaltung' },
            { label: 'Pädagogik / Kurse', value: 'paedagogik' },
            { label: 'Kunst & Kultur', value: 'kunst' },
            { label: 'Literatur & Sprache', value: 'literatur' },
            { label: 'Technik & IT', value: 'technik' },
            { label: 'Business & Partnerschaften', value: 'business' },
            { label: 'BFD & Freiwillige', value: 'bfd' },
          ],
          defaultValue: 'paedagogik',
        }),
        role: fields.object({
          de: fields.text({ label: 'Rolle (Deutsch)' }),
          pl: fields.text({ label: 'Rolle (Polnisch)' }),
          en: fields.text({ label: 'Rolle (Englisch)' }),
        }),
        contact: fields.object({
          email: fields.text({ label: 'E-Mail-Adresse' }),
        }),
        photo: fields.image({
          label: 'Porträtfoto hochladen',
          directory: 'public/images/team',
          publicPath: '/images/team/',
        }),
        bio: fields.object({
          de: fields.text({ label: 'Kurzbiografie (Deutsch)', multiline: true }),
          pl: fields.text({ label: 'Kurzbiografie (Polnisch)', multiline: true }),
          en: fields.text({ label: 'Kurzbiografie (Englisch)', multiline: true }),
        }),
        order: fields.integer({ label: 'Sortierreihenfolge', defaultValue: 10 }),
        content: fields.markdoc({ label: 'Zusatzinformationen / Freitext', extension: 'md' }),
      },
    }),
    shopItems: collection({
      label: 'Vereinsshop / Kiosk',
      slugField: 'slug',
      path: 'src/content/shopItems/*',
      format: { contentField: 'content' },
      schema: {
        slug: fields.text({ label: 'Slug / Kennung' }),
        order: fields.integer({ label: 'Artikelnummer / Reihenfolge', defaultValue: 1 }),
        name: fields.object({
          de: fields.text({ label: 'Artikelname (Deutsch)' }),
          pl: fields.text({ label: 'Artikelname (Polnisch)' }),
          en: fields.text({ label: 'Artikelname (Englisch)' }),
        }),
        description: fields.object({
          de: fields.text({ label: 'Beschreibung DE', multiline: true }),
          pl: fields.text({ label: 'Beschreibung PL', multiline: true }),
          en: fields.text({ label: 'Beschreibung EN', multiline: true }),
        }),
        priceDisplay: fields.object({
          de: fields.text({ label: 'Preis (z. B. 2,50 €)' }),
          pl: fields.text({ label: 'Preis PL' }),
          en: fields.text({ label: 'Preis EN' }),
        }),
        image: fields.image({
          label: 'Produktbild hochladen',
          directory: 'public/images/shop',
          publicPath: '/images/shop/',
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
        orderLink: fields.text({ label: 'Bestelllink / PayPal' }),
        content: fields.markdoc({ label: 'Details / Notizen', extension: 'md' }),
      },
    }),
    exhibitions: collection({
      label: 'Ausstellungen & Kunst',
      slugField: 'artist',
      path: 'src/content/exhibitions/*',
      format: { contentField: 'content' },
      schema: {
        artist: fields.slug({ name: { label: 'Künstler*in' } }),
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
        gallery: fields.array(
          fields.object({
            url: fields.image({
              label: 'Ausstellungsbild hochladen',
              directory: 'public/images/exhibitions',
              publicPath: '/images/exhibitions/',
            }),
            caption: fields.object({
              de: fields.text({ label: 'Caption DE' }),
              pl: fields.text({ label: 'Caption PL' }),
              en: fields.text({ label: 'Caption EN' }),
            }),
            alt: fields.object({
              de: fields.text({ label: 'Alt DE' }),
              pl: fields.text({ label: 'Alt PL' }),
              en: fields.text({ label: 'Alt EN' }),
            }),
          }),
          { label: 'Bildergalerie' }
        ),
        content: fields.markdoc({ label: 'Details / Begleittext', extension: 'md' }),
      },
    }),
  },
});
