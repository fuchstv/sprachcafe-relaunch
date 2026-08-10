import { ui, defaultLang, languages, type LanguageCode } from './ui';

export function getLangFromUrl(url: URL): LanguageCode {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as LanguageCode;
  return defaultLang;
}

export function useTranslations(lang: LanguageCode) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang]?.[key] || ui[defaultLang][key];
  };
}

export function getLocalizedPath(pathname: string, targetLang: LanguageCode): string {
  // Strip existing lang prefix if present
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && segments[0] in languages) {
    segments.shift();
  }

  const cleanPath = segments.join('/');
  
  if (targetLang === defaultLang) {
    return cleanPath ? `/${cleanPath}/` : '/';
  }
  return cleanPath ? `/${targetLang}/${cleanPath}/` : `/${targetLang}/`;
}

export function getHreflangLinks(pathname: string, siteUrl: string = 'https://sprachcafe-polnisch.org') {
  const baseUrl = siteUrl.replace(/\/$/, '');
  
  // Clean pathname from language prefix
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && segments[0] in languages) {
    segments.shift();
  }
  const cleanPath = segments.join('/');

  return [
    {
      lang: 'de',
      url: cleanPath ? `${baseUrl}/${cleanPath}/` : `${baseUrl}/`
    },
    {
      lang: 'pl',
      url: cleanPath ? `${baseUrl}/pl/${cleanPath}/` : `${baseUrl}/pl/`
    },
    {
      lang: 'en',
      url: cleanPath ? `${baseUrl}/en/${cleanPath}/` : `${baseUrl}/en/`
    },
    {
      lang: 'x-default',
      url: cleanPath ? `${baseUrl}/${cleanPath}/` : `${baseUrl}/`
    }
  ];
}
