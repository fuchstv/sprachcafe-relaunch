export const languages = {
  de: { code: 'de', name: 'Deutsch', label: 'DE', flag: '🇩🇪' },
  pl: { code: 'pl', name: 'Polski', label: 'PL', flag: '🇵🇱' },
  en: { code: 'en', name: 'English', label: 'EN', flag: '🇬🇧' }
} as const;

export type LanguageCode = keyof typeof languages;

export const defaultLang: LanguageCode = 'de';

export const ui = {
  de: {
    'nav.home': 'Startseite',
    'nav.about': 'Über uns',
    'nav.events': 'Veranstaltungen',
    'nav.library': 'Hausbibliothek',
    'nav.contact': 'Kontakt',
    'hero.title': 'SprachCafé Polnisch',
    'hero.subtitle': 'Ort der Begegnung, Sprache und deutsch-polnischen Kultur.',
    'hero.badge': 'Offizielle Plattform',
    'lang.switch': 'Sprache wählen',
  },
  pl: {
    'nav.home': 'Strona główna',
    'nav.about': 'O nas',
    'nav.events': 'Wydarzenia',
    'nav.library': 'Biblioteka',
    'nav.contact': 'Kontakt',
    'hero.title': 'SprachCafé Polnisch',
    'hero.subtitle': 'Miejsce spotkań, języka i kultury niemiecko-polskiej.',
    'hero.badge': 'Oficjalna platforma',
    'lang.switch': 'Wybierz język',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.events': 'Events',
    'nav.library': 'House Library',
    'nav.contact': 'Contact',
    'hero.title': 'SprachCafé Polnisch',
    'hero.subtitle': 'A place for encounter, language, and German-Polish culture.',
    'hero.badge': 'Official Platform',
    'lang.switch': 'Select language',
  }
} as const;
