/**
 * Utility to sanitize and fix accessibility (WCAG 2.1 AA) in WordPress Gutenberg HTML content.
 */

export function sanitizeWpHtml(rawHtml: string, lang: 'de' | 'pl' | 'en' = 'de'): string {
  if (!rawHtml) return '';

  let html = rawHtml
    // 1. Strip legacy inline styles and scripts
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')

    // 2. Remove redundant or problematic domain links
    .replace(/https?:\/\/(?:www\.)?sprachcafe-polnisch\.org\//gi, '/')
    .replace(/https?:\/\/beta\.sprachcafe-polnisch\.org\//gi, '/')

    // 3. Fix Accessibility: Link Name on buttons and image links
    .replace(/<a\s+([^>]*?)href="([^"]*?spenden[^"]*?)"([^>]*?)>/gi, (match, before, url, after) => {
      if (/aria-label/i.test(match)) return match;
      const label = lang === 'pl' ? 'Wspieraj nas i wpłać datek' : lang === 'en' ? 'Support us and donate' : 'Spenden an das SprachCafé Polnisch';
      return `<a ${before}href="${url}" aria-label="${label}"${after}>`;
    })
    .replace(/<a\s+([^>]*?)href="([^"]*?newsletter[^"]*?)"([^>]*?)>/gi, (match, before, url, after) => {
      if (/aria-label/i.test(match)) return match;
      const label = lang === 'pl' ? 'Zapisz się do newslettera' : lang === 'en' ? 'Subscribe to newsletter' : 'Newsletter abonnieren';
      return `<a ${before}href="${url}" aria-label="${label}"${after}>`;
    })
    .replace(/<a\s+([^>]*?)href="([^"]*?projekte[^"]*?)"([^>]*?)>/gi, (match, before, url, after) => {
      if (/aria-label/i.test(match)) return match;
      const label = lang === 'pl' ? 'Zobacz nasze projekty' : lang === 'en' ? 'View our projects' : 'Projekte des SprachCafés ansehen';
      return `<a ${before}href="${url}" aria-label="${label}"${after}>`;
    })
    .replace(/<a\s+([^>]*?)href="([^"]*?facebook\.com[^"]*?)"([^>]*?)>/gi, (match, before, url, after) => {
      if (/aria-label/i.test(match)) return match;
      return `<a ${before}href="${url}" aria-label="Facebook SprachCafé Polnisch" target="_blank" rel="noopener noreferrer"${after}>`;
    })
    .replace(/<a\s+([^>]*?)href="([^"]*?instagram\.com[^"]*?)"([^>]*?)>/gi, (match, before, url, after) => {
      if (/aria-label/i.test(match)) return match;
      return `<a ${before}href="${url}" aria-label="Instagram SprachCafé Polnisch" target="_blank" rel="noopener noreferrer"${after}>`;
    })
    .replace(/<a\s+([^>]*?)href="([^"]*?youtube\.com[^"]*?)"([^>]*?)>/gi, (match, before, url, after) => {
      if (/aria-label/i.test(match)) return match;
      return `<a ${before}href="${url}" aria-label="YouTube SprachCafé Polnisch" target="_blank" rel="noopener noreferrer"${after}>`;
    })
    .replace(/<a\s+([^>]*?)href="([^"]*?linkedin\.com[^"]*?)"([^>]*?)>/gi, (match, before, url, after) => {
      if (/aria-label/i.test(match)) return match;
      return `<a ${before}href="${url}" aria-label="LinkedIn SprachCafé Polnisch" target="_blank" rel="noopener noreferrer"${after}>`;
    })
    .replace(/<a\s+([^>]*?)href="([^"]*?tiktok\.com[^"]*?)"([^>]*?)>/gi, (match, before, url, after) => {
      if (/aria-label/i.test(match)) return match;
      return `<a ${before}href="${url}" aria-label="TikTok SprachCafé Polnisch" target="_blank" rel="noopener noreferrer"${after}>`;
    });

  // 4. Ensure any remaining links wrapping <img> have accessible names
  html = html.replace(/<a\s+([^>]*?)>(\s*<img\s+([^>]*?)src="([^"]*?)"([^>]*?)>\s*)<\/a>/gi, (fullMatch, aAttrs, imgTag, imgBefore, src, imgAfter) => {
    if (/aria-label/i.test(aAttrs) || /alt="[^"]+"/i.test(imgTag)) {
      return fullMatch;
    }
    const filename = src.split('/').pop()?.split('.')[0]?.replace(/[-_]/g, ' ') || 'Link';
    return `<a ${aAttrs} aria-label="${filename}">${imgTag}</a>`;
  });

  // 5. Remove completely empty <a></a> tags from WordPress
  html = html.replace(/<a\b[^>]*>\s*<\/a>/gi, '');

  // 6. Fix WCAG 2.1 AA Color Contrast on WordPress custom colored blocks
  html = html.replace(/#1aa974/gi, '#137953');

  return html;
}
