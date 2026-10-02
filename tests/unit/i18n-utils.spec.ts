import { test, expect } from '@playwright/test';
import { getLangFromUrl, useTranslations, getLocalizedPath, getHreflangLinks } from '../../frontend/src/i18n/utils';
import { defaultLang } from '../../frontend/src/i18n/ui';

test.describe('i18n utils unit test suite', () => {
  test.describe('getLangFromUrl', () => {
    test.describe('Supported languages in URL path', () => {
      test('returns "de" when language prefix is "/de"', () => {
        const url = new URL('https://sprachcafe-polnisch.org/de/');
        expect(getLangFromUrl(url)).toBe('de');
      });

      test('returns "de" when language prefix is "/de" with subpath', () => {
        const url = new URL('https://sprachcafe-polnisch.org/de/ueber-uns');
        expect(getLangFromUrl(url)).toBe('de');
      });

      test('returns "pl" when language prefix is "/pl"', () => {
        const url = new URL('https://sprachcafe-polnisch.org/pl');
        expect(getLangFromUrl(url)).toBe('pl');
      });

      test('returns "pl" when language prefix is "/pl/" with trailing slash', () => {
        const url = new URL('https://sprachcafe-polnisch.org/pl/');
        expect(getLangFromUrl(url)).toBe('pl');
      });

      test('returns "pl" when language prefix is "/pl" with nested subpath', () => {
        const url = new URL('https://sprachcafe-polnisch.org/pl/events/2026/workshop');
        expect(getLangFromUrl(url)).toBe('pl');
      });

      test('returns "en" when language prefix is "/en"', () => {
        const url = new URL('https://sprachcafe-polnisch.org/en');
        expect(getLangFromUrl(url)).toBe('en');
      });

      test('returns "en" when language prefix is "/en/" with trailing slash', () => {
        const url = new URL('https://sprachcafe-polnisch.org/en/');
        expect(getLangFromUrl(url)).toBe('en');
      });

      test('returns "en" when language prefix is "/en" with subpath', () => {
        const url = new URL('https://sprachcafe-polnisch.org/en/about');
        expect(getLangFromUrl(url)).toBe('en');
      });
    });

    test.describe('Default language fallback', () => {
      test('returns defaultLang ("de") for root URL "/"', () => {
        const url = new URL('https://sprachcafe-polnisch.org/');
        expect(getLangFromUrl(url)).toBe(defaultLang);
      });

      test('returns defaultLang ("de") for un-prefixed German paths', () => {
        const url = new URL('https://sprachcafe-polnisch.org/events');
        expect(getLangFromUrl(url)).toBe(defaultLang);
      });

      test('returns defaultLang ("de") for deep un-prefixed German paths', () => {
        const url = new URL('https://sprachcafe-polnisch.org/hausbibliothek/katalog');
        expect(getLangFromUrl(url)).toBe(defaultLang);
      });

      test('returns defaultLang ("de") for unsupported language codes', () => {
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/fr/events'))).toBe(defaultLang);
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/es/'))).toBe(defaultLang);
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/uk/pro-nas'))).toBe(defaultLang);
      });
    });

    test.describe('Query parameters, hashes, and ports', () => {
      test('ignores query parameters and extracts correct language', () => {
        const url = new URL('https://sprachcafe-polnisch.org/pl/events?date=2026-10-01&page=2');
        expect(getLangFromUrl(url)).toBe('pl');
      });

      test('ignores hash fragments and extracts correct language', () => {
        const url = new URL('https://sprachcafe-polnisch.org/en/about#team');
        expect(getLangFromUrl(url)).toBe('en');
      });

      test('handles query parameters on root URL without false positives', () => {
        const url = new URL('https://sprachcafe-polnisch.org/?lang=pl');
        expect(getLangFromUrl(url)).toBe(defaultLang);
      });

      test('works correctly with non-standard ports and localhost', () => {
        const urlLocal = new URL('http://localhost:4321/pl/mitmachen');
        const urlPort = new URL('http://127.0.0.1:8089/en/contact');
        expect(getLangFromUrl(urlLocal)).toBe('pl');
        expect(getLangFromUrl(urlPort)).toBe('en');
      });
    });

    test.describe('Edge cases and path variations', () => {
      test('is case-sensitive and does not match uppercase prefixes like "/PL"', () => {
        const urlUpper = new URL('https://sprachcafe-polnisch.org/PL/events');
        expect(getLangFromUrl(urlUpper)).toBe(defaultLang);
      });

      test('does not match words starting with language prefixes (e.g. "/platform")', () => {
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/platform'))).toBe(defaultLang);
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/entry'))).toBe(defaultLang);
      });

      test('does not match static file extensions in first segment (e.g. "/pl.svg")', () => {
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/pl.svg'))).toBe(defaultLang);
      });

      test('does not falsely match Object prototype properties (e.g. "/toString", "/constructor")', () => {
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/toString/test'))).toBe(defaultLang);
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/constructor/'))).toBe(defaultLang);
        expect(getLangFromUrl(new URL('https://sprachcafe-polnisch.org/valueOf'))).toBe(defaultLang);
      });
    });
  });

  test.describe('useTranslations', () => {
    test('translates strings correctly for German', () => {
      const t = useTranslations('de');
      expect(t('nav.home')).toBe('Startseite');
      expect(t('nav.contact')).toBe('Kontakt');
    });

    test('translates strings correctly for Polish', () => {
      const t = useTranslations('pl');
      expect(t('nav.home')).toBe('Strona główna');
      expect(t('nav.contact')).toBe('Kontakt');
    });

    test('translates strings correctly for English', () => {
      const t = useTranslations('en');
      expect(t('nav.home')).toBe('Home');
      expect(t('nav.contact')).toBe('Contact');
    });
  });

  test.describe('getLocalizedPath', () => {
    test('formats default language paths without prefix and with trailing slash', () => {
      expect(getLocalizedPath('/', 'de')).toBe('/');
      expect(getLocalizedPath('/events', 'de')).toBe('/events/');
      expect(getLocalizedPath('/pl/events', 'de')).toBe('/events/');
      expect(getLocalizedPath('/en/ueber-uns', 'de')).toBe('/ueber-uns/');
    });

    test('formats localized paths with target prefix and trailing slash', () => {
      expect(getLocalizedPath('/', 'pl')).toBe('/pl/');
      expect(getLocalizedPath('/events', 'pl')).toBe('/pl/events/');
      expect(getLocalizedPath('/en/about', 'pl')).toBe('/pl/about/');
      expect(getLocalizedPath('/', 'en')).toBe('/en/');
      expect(getLocalizedPath('/kontakt', 'en')).toBe('/en/kontakt/');
      expect(getLocalizedPath('/pl/kontakt', 'en')).toBe('/en/kontakt/');
    });
  });

  test.describe('getHreflangLinks', () => {
    test('generates correct hreflang links array for root and subpages', () => {
      const links = getHreflangLinks('/pl/events', 'https://sprachcafe-polnisch.org');
      expect(links.length).toBe(4);
      expect(links.find(l => l.lang === 'de')).toEqual({
        lang: 'de',
        url: 'https://sprachcafe-polnisch.org/events/'
      });
      expect(links.find(l => l.lang === 'pl')).toEqual({
        lang: 'pl',
        url: 'https://sprachcafe-polnisch.org/pl/events/'
      });
      expect(links.find(l => l.lang === 'en')).toEqual({
        lang: 'en',
        url: 'https://sprachcafe-polnisch.org/en/events/'
      });
      expect(links.find(l => l.lang === 'x-default')).toEqual({
        lang: 'x-default',
        url: 'https://sprachcafe-polnisch.org/events/'
      });
    });
  });
});
