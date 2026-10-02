import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLangFromUrl, useTranslations, getLocalizedPath, getHreflangLinks } from './utils';
import { defaultLang } from './ui';

describe('i18n utils', () => {
  describe('getLangFromUrl', () => {
    describe('Supported languages in URL path', () => {
      it('returns "de" when language prefix is "/de"', () => {
        const url = new URL('https://sprachcafe-polnisch.org/de/');
        assert.equal(getLangFromUrl(url), 'de');
      });

      it('returns "de" when language prefix is "/de" with subpath', () => {
        const url = new URL('https://sprachcafe-polnisch.org/de/ueber-uns');
        assert.equal(getLangFromUrl(url), 'de');
      });

      it('returns "pl" when language prefix is "/pl"', () => {
        const url = new URL('https://sprachcafe-polnisch.org/pl');
        assert.equal(getLangFromUrl(url), 'pl');
      });

      it('returns "pl" when language prefix is "/pl/" with trailing slash', () => {
        const url = new URL('https://sprachcafe-polnisch.org/pl/');
        assert.equal(getLangFromUrl(url), 'pl');
      });

      it('returns "pl" when language prefix is "/pl" with nested subpath', () => {
        const url = new URL('https://sprachcafe-polnisch.org/pl/events/2026/workshop');
        assert.equal(getLangFromUrl(url), 'pl');
      });

      it('returns "en" when language prefix is "/en"', () => {
        const url = new URL('https://sprachcafe-polnisch.org/en');
        assert.equal(getLangFromUrl(url), 'en');
      });

      it('returns "en" when language prefix is "/en/" with trailing slash', () => {
        const url = new URL('https://sprachcafe-polnisch.org/en/');
        assert.equal(getLangFromUrl(url), 'en');
      });

      it('returns "en" when language prefix is "/en" with subpath', () => {
        const url = new URL('https://sprachcafe-polnisch.org/en/about');
        assert.equal(getLangFromUrl(url), 'en');
      });
    });

    describe('Default language fallback', () => {
      it('returns defaultLang ("de") for root URL "/"', () => {
        const url = new URL('https://sprachcafe-polnisch.org/');
        assert.equal(getLangFromUrl(url), defaultLang);
      });

      it('returns defaultLang ("de") for un-prefixed German paths', () => {
        const url = new URL('https://sprachcafe-polnisch.org/events');
        assert.equal(getLangFromUrl(url), defaultLang);
      });

      it('returns defaultLang ("de") for deep un-prefixed German paths', () => {
        const url = new URL('https://sprachcafe-polnisch.org/hausbibliothek/katalog');
        assert.equal(getLangFromUrl(url), defaultLang);
      });

      it('returns defaultLang ("de") for unsupported language codes', () => {
        const urlFr = new URL('https://sprachcafe-polnisch.org/fr/events');
        const urlEs = new URL('https://sprachcafe-polnisch.org/es/');
        const urlUk = new URL('https://sprachcafe-polnisch.org/uk/pro-nas');
        assert.equal(getLangFromUrl(urlFr), defaultLang);
        assert.equal(getLangFromUrl(urlEs), defaultLang);
        assert.equal(getLangFromUrl(urlUk), defaultLang);
      });
    });

    describe('Query parameters, hashes, and ports', () => {
      it('ignores query parameters and extracts correct language', () => {
        const url = new URL('https://sprachcafe-polnisch.org/pl/events?date=2026-10-01&page=2');
        assert.equal(getLangFromUrl(url), 'pl');
      });

      it('ignores hash fragments and extracts correct language', () => {
        const url = new URL('https://sprachcafe-polnisch.org/en/about#team');
        assert.equal(getLangFromUrl(url), 'en');
      });

      it('handles query parameters on root URL without false positives', () => {
        const url = new URL('https://sprachcafe-polnisch.org/?lang=pl');
        assert.equal(getLangFromUrl(url), defaultLang);
      });

      it('works correctly with non-standard ports and localhost', () => {
        const urlLocal = new URL('http://localhost:4321/pl/mitmachen');
        const urlPort = new URL('http://127.0.0.1:8089/en/contact');
        assert.equal(getLangFromUrl(urlLocal), 'pl');
        assert.equal(getLangFromUrl(urlPort), 'en');
      });
    });

    describe('Edge cases and path variations', () => {
      it('is case-sensitive and does not match uppercase prefixes like "/PL"', () => {
        const urlUpper = new URL('https://sprachcafe-polnisch.org/PL/events');
        assert.equal(getLangFromUrl(urlUpper), defaultLang);
      });

      it('does not match words starting with language prefixes (e.g. "/platform")', () => {
        const urlPlatform = new URL('https://sprachcafe-polnisch.org/platform');
        const urlEnglishWord = new URL('https://sprachcafe-polnisch.org/entry');
        assert.equal(getLangFromUrl(urlPlatform), defaultLang);
        assert.equal(getLangFromUrl(urlEnglishWord), defaultLang);
      });

      it('does not match static file extensions in first segment (e.g. "/pl.svg")', () => {
        const urlFile = new URL('https://sprachcafe-polnisch.org/pl.svg');
        assert.equal(getLangFromUrl(urlFile), defaultLang);
      });

      it('does not falsely match Object prototype properties (e.g. "/toString", "/constructor")', () => {
        const urlToString = new URL('https://sprachcafe-polnisch.org/toString/test');
        const urlConstructor = new URL('https://sprachcafe-polnisch.org/constructor/');
        const urlValueOf = new URL('https://sprachcafe-polnisch.org/valueOf');
        assert.equal(getLangFromUrl(urlToString), defaultLang);
        assert.equal(getLangFromUrl(urlConstructor), defaultLang);
        assert.equal(getLangFromUrl(urlValueOf), defaultLang);
      });
    });
  });

  describe('useTranslations', () => {
    it('translates strings correctly for German', () => {
      const t = useTranslations('de');
      assert.equal(t('nav.home'), 'Startseite');
      assert.equal(t('nav.contact'), 'Kontakt');
    });

    it('translates strings correctly for Polish', () => {
      const t = useTranslations('pl');
      assert.equal(t('nav.home'), 'Strona główna');
      assert.equal(t('nav.contact'), 'Kontakt');
    });

    it('translates strings correctly for English', () => {
      const t = useTranslations('en');
      assert.equal(t('nav.home'), 'Home');
      assert.equal(t('nav.contact'), 'Contact');
    });
  });

  describe('getLocalizedPath', () => {
    it('formats default language paths without prefix and with trailing slash', () => {
      assert.equal(getLocalizedPath('/', 'de'), '/');
      assert.equal(getLocalizedPath('/events', 'de'), '/events/');
      assert.equal(getLocalizedPath('/pl/events', 'de'), '/events/');
      assert.equal(getLocalizedPath('/en/ueber-uns', 'de'), '/ueber-uns/');
    });

    it('formats localized paths with target prefix and trailing slash', () => {
      assert.equal(getLocalizedPath('/', 'pl'), '/pl/');
      assert.equal(getLocalizedPath('/events', 'pl'), '/pl/events/');
      assert.equal(getLocalizedPath('/en/about', 'pl'), '/pl/about/');
      assert.equal(getLocalizedPath('/', 'en'), '/en/');
      assert.equal(getLocalizedPath('/kontakt', 'en'), '/en/kontakt/');
      assert.equal(getLocalizedPath('/pl/kontakt', 'en'), '/en/kontakt/');
    });
  });

  describe('getHreflangLinks', () => {
    it('generates correct hreflang links array for root and subpages', () => {
      const links = getHreflangLinks('/pl/events', 'https://sprachcafe-polnisch.org');
      assert.equal(links.length, 4);
      assert.deepEqual(links.find(l => l.lang === 'de'), {
        lang: 'de',
        url: 'https://sprachcafe-polnisch.org/events/'
      });
      assert.deepEqual(links.find(l => l.lang === 'pl'), {
        lang: 'pl',
        url: 'https://sprachcafe-polnisch.org/pl/events/'
      });
      assert.deepEqual(links.find(l => l.lang === 'en'), {
        lang: 'en',
        url: 'https://sprachcafe-polnisch.org/en/events/'
      });
      assert.deepEqual(links.find(l => l.lang === 'x-default'), {
        lang: 'x-default',
        url: 'https://sprachcafe-polnisch.org/events/'
      });
    });
  });
});
