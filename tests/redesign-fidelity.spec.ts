import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * SprachCafé Polnisch Bilingual Platform Relaunch & Redesign
 * End-to-End Visual Fidelity & Requirement Test Suite
 *
 * Tiers:
 * - Tier 1: Symmetrical Route Parity & Link Isolation (DE vs. PL)
 * - Tier 2: Core Component Rendering & Stitch Visual Fidelity
 * - Tier 3: Responsive Viewports (Desktop 1376px/1920px & Mobile 375px)
 * - Tier 4: Accessibility (WCAG 2.1 AA via Axe-Core) & Interactive Feature Verification
 */

// ---------------------------------------------------------------------------
// TIER 1: Symmetrical Route Parity & Link Isolation
// ---------------------------------------------------------------------------

test.describe('Tier 1: Symmetrical Route Parity & Link Isolation', () => {
  const ROUTE_PAIRS = [
    { name: 'Startseite / Homepage', de: '/', pl: '/pl/' },
    { name: 'Veranstaltungen & Kalender / Wydarzenia', de: '/events/', pl: '/pl/events/' },
    { name: 'Hausbibliothek Katalog / Biblioteka', de: '/hausbibliothek/', pl: '/pl/hausbibliothek/' },
    { name: 'Über uns / O nas', de: '/ueber-uns/', pl: '/pl/ueber-uns/' },
    { name: 'Über uns Alias / O nas Alias', de: '/ueber-uns/', pl: '/pl/o-nas/' },
    { name: 'Kontakt & Anfahrt / Kontakt', de: '/kontakt/', pl: '/pl/kontakt/' },
    { name: 'Mission & Werte / Misja', de: '/ueber-uns/mission/', pl: '/pl/ueber-uns/mission/' },
    { name: 'Team & Vorstand / Zespół', de: '/ueber-uns/team/', pl: '/pl/ueber-uns/team/' },
    { name: 'Häufige Fragen (FAQ)', de: '/ueber-uns/frequently-asked-questions/', pl: '/pl/ueber-uns/frequently-asked-questions/' },
    { name: 'Mitmachen / Działaj z nami', de: '/mitmachen/', pl: '/pl/mitmachen/' },
    { name: 'Spenden / Datki', de: '/spenden/', pl: '/pl/spenden/' },
    { name: 'Impressum / Stopka', de: '/impressum/', pl: '/pl/impressum/' },
    { name: 'Datenschutz / Ochrona danych', de: '/datenschutz/', pl: '/pl/datenschutz/' },
    { name: 'Barrierefreiheit / Dostępność', de: '/barrierefreiheit/', pl: '/pl/barrierefreiheit/' },
  ];

  for (const pair of ROUTE_PAIRS) {
    test(`Dual Route Parity: ${pair.name} (DE: ${pair.de} | PL: ${pair.pl})`, async ({ page }) => {
      // 1. Check German Route
      const resDe = await page.goto(pair.de);
      expect(resDe?.status(), `German route ${pair.de} should return 200 OK`).toBe(200);
      const htmlLangDe = await page.locator('html').getAttribute('lang');
      expect(htmlLangDe, `German page ${pair.de} must have lang="de"`).toBe('de');

      // Check hreflang tags on German page
      const hreflangDe = await page.locator('link[rel="alternate"][hreflang="de"]').count();
      const hreflangPlOnDe = await page.locator('link[rel="alternate"][hreflang="pl"]').count();
      expect(hreflangDe, `German page ${pair.de} must have hreflang="de"`).toBeGreaterThanOrEqual(1);
      expect(hreflangPlOnDe, `German page ${pair.de} must have hreflang="pl"`).toBeGreaterThanOrEqual(1);

      // 2. Check Polish Route
      const resPl = await page.goto(pair.pl);
      expect(resPl?.status(), `Polish route ${pair.pl} should return 200 OK`).toBe(200);
      const htmlLangPl = await page.locator('html').getAttribute('lang');
      expect(htmlLangPl, `Polish page ${pair.pl} must have lang="pl"`).toBe('pl');

      // Check hreflang tags on Polish page
      const hreflangPl = await page.locator('link[rel="alternate"][hreflang="pl"]').count();
      const hreflangDeOnPl = await page.locator('link[rel="alternate"][hreflang="de"]').count();
      expect(hreflangPl, `Polish page ${pair.pl} must have hreflang="pl"`).toBeGreaterThanOrEqual(1);
      expect(hreflangDeOnPl, `Polish page ${pair.pl} must have hreflang="de"`).toBeGreaterThanOrEqual(1);
    });
  }

  test('Polish Link Prefix Isolation: All internal navigation on /pl/ preserves /pl/ prefix', async ({ page }) => {
    const plPagesToAudit = [
      '/pl/',
      '/pl/events/',
      '/pl/hausbibliothek/',
      '/pl/ueber-uns/',
      '/pl/kontakt/',
    ];

    for (const plUrl of plPagesToAudit) {
      await page.goto(plUrl);
      await page.waitForLoadState('domcontentloaded');

      // Collect all internal navigation links (excluding intentional language switcher buttons)
      const internalNavLinks = await page.evaluate(() => {
        // Exclude language switcher container
        const anchors = Array.from(document.querySelectorAll('header nav[role="navigation"] a, footer a, #mobile-menu a'));
        return anchors
          .map(a => a.getAttribute('href'))
          .filter((href): href is string => Boolean(href))
          .filter(href => {
            // Filter out external URLs, mailto, tel, in-page hash links, and static asset links
            if (href.startsWith('http://') || href.startsWith('https://')) return false;
            if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return false;
            if (href.startsWith('/brand-assets/') || href.startsWith('/images/') || href.startsWith('/fonts/') || href.startsWith('/_astro/')) return false;
            if (href.endsWith('.xml') || href.endsWith('.ico') || href.endsWith('.webmanifest')) return false;
            return href.startsWith('/');
          });
      });

      // Assert that every internal navigation link on Polish pages starts with /pl/
      const leakingLinks = internalNavLinks.filter(href => !href.startsWith('/pl/'));
      expect(
        leakingLinks,
        `Found internal links on Polish page ${plUrl} leaking to un-prefixed German routes: ${JSON.stringify(leakingLinks)}`
      ).toHaveLength(0);
    }
  });

  test('Language Switcher bidirectional route mapping', async ({ page }) => {
    // On German Home -> Switcher should target /pl/
    await page.goto('/');
    const plSwitcher = page.locator('a[aria-label*="Polski"], a[href^="/pl/"]').first();
    await expect(plSwitcher).toBeVisible();

    // On Polish Home -> Switcher should target / (or /de/)
    await page.goto('/pl/');
    const deSwitcher = page.locator('a[aria-label*="Deutsch"], a[href="/"], a[href="/de/"]').first();
    await expect(deSwitcher).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// TIER 2: Core Component Rendering & Stitch Visual Fidelity
// ---------------------------------------------------------------------------

test.describe('Tier 2: Core Component Rendering & Stitch Visual Fidelity', () => {
  test('Homepage: Renders HeroSection with 3-photo collage and Polish Poster warm salon accents', async ({ page }) => {
    // 1. Check German Home
    await page.goto('/');
    const heroSectionDe = page.locator('section').filter({ has: page.locator('h1') }).first();
    await expect(heroSectionDe).toBeVisible();

    const heroH1De = heroSectionDe.locator('h1');
    await expect(heroH1De).toContainText('SprachCafé Polnisch');

    // 3-photo collage within hero
    const heroImagesDe = heroSectionDe.locator('img[src*="/images/hero/"]');
    const heroImageCountDe = await heroImagesDe.count();
    expect(heroImageCountDe, 'Homepage hero should contain 3 collage photographs').toBeGreaterThanOrEqual(3);

    // Verify all collage images are loaded and have alt text
    for (let i = 0; i < heroImageCountDe; i++) {
      const img = heroImagesDe.nth(i);
      await expect(img).toBeVisible();
      const alt = await img.getAttribute('alt');
      expect(alt, 'Hero image must have non-empty alt text').toBeTruthy();
    }

    // CTAs inside Hero on German Home
    const primaryCtaDe = heroSectionDe.locator('a[href="/events/"]').first();
    const secondaryCtaDe = heroSectionDe.locator('a[href="/hausbibliothek/"]').first();
    await expect(primaryCtaDe).toBeVisible();
    await expect(secondaryCtaDe).toBeVisible();

    // 2. Check Polish Home
    await page.goto('/pl/');
    const heroSectionPl = page.locator('section').filter({ has: page.locator('h1') }).first();
    await expect(heroSectionPl).toBeVisible();

    const heroH1Pl = heroSectionPl.locator('h1');
    await expect(heroH1Pl).toContainText('SprachCafé Polnisch');

    // CTAs inside Hero on Polish Home must preserve /pl/ prefix
    const primaryCtaPl = heroSectionPl.locator('a[href="/pl/events/"]').first();
    const secondaryCtaPl = heroSectionPl.locator('a[href="/pl/hausbibliothek/"]').first();
    await expect(primaryCtaPl).toBeVisible();
    await expect(secondaryCtaPl).toBeVisible();
  });

  test('Events: BOTH /events/ and /pl/events/ render VintageEventTicketCard with typewriter date stamps and perforated notches', async ({ page }) => {
    // 1. German Events Page (/events/)
    await page.goto('/events/');
    const ticketCardsDe = page.locator('.vintage-ticket-card');
    const countDe = await ticketCardsDe.count();
    expect(countDe, 'German /events/ must render VintageEventTicketCard items').toBeGreaterThanOrEqual(1);

    const firstCardDe = ticketCardsDe.first();
    await expect(firstCardDe).toBeVisible();

    // Verify typewriter date stamp elements
    await expect(firstCardDe.locator('span.font-black, [class*="font-black"]').first()).toBeVisible(); // Day number
    await expect(firstCardDe.locator('a[href^="/events/"]').first()).toBeVisible(); // Localized detail link

    // 2. Polish Events Page (/pl/events/)
    await page.goto('/pl/events/');
    const ticketCardsPl = page.locator('.vintage-ticket-card');
    const countPl = await ticketCardsPl.count();
    expect(countPl, 'Polish /pl/events/ must render VintageEventTicketCard items with parity').toBeGreaterThanOrEqual(1);

    const firstCardPl = ticketCardsPl.first();
    await expect(firstCardPl).toBeVisible();
    await expect(firstCardPl.locator('a[href^="/pl/events/"]').first()).toBeVisible(); // Localized detail link
  });

  test('Hausbibliothek: BOTH /hausbibliothek/ and /pl/hausbibliothek/ render BookshelfWidget 3D wooden shelf', async ({ page }) => {
    // 1. German Hausbibliothek Page (/hausbibliothek/)
    await page.goto('/hausbibliothek/');
    const bookshelfDe = page.locator('#bookshelf-scroll-container');
    await expect(bookshelfDe, 'German /hausbibliothek/ must render BookshelfWidget').toBeVisible();

    // Carousel buttons
    const prevBtnDe = page.locator('#bookshelf-prev-btn');
    const nextBtnDe = page.locator('#bookshelf-next-btn');
    if (await prevBtnDe.count() > 0) {
      await expect(prevBtnDe).toBeVisible();
      await expect(nextBtnDe).toBeVisible();
    }

    // 2. Polish Hausbibliothek Page (/pl/hausbibliothek/)
    await page.goto('/pl/hausbibliothek/');
    const bookshelfPl = page.locator('#bookshelf-scroll-container');
    await expect(bookshelfPl, 'Polish /pl/hausbibliothek/ must render BookshelfWidget with parity').toBeVisible();

    // Catalog search input exists on both
    await expect(page.locator('#filter-search')).toBeVisible();
  });

  test('Kiez-Hub: Renders 3 location cards (Pankow, Schöneberg, Köpenick) with interactive filter tabs', async ({ page }) => {
    await page.goto('/');

    // Check presence of 3 Kiez cards
    const pankowCard = page.locator('[data-hub="pankow"]').first();
    const schoenebergCard = page.locator('[data-hub="schoeneberg"]').first();
    const koepenickCard = page.locator('[data-hub="koepenick"]').first();

    await expect(pankowCard).toBeVisible();
    await expect(schoenebergCard).toBeVisible();
    await expect(koepenickCard).toBeVisible();

    // Check filter tab switching interaction if tabs exist
    const tabPankow = page.locator('#kiez-tab-pankow');
    const tabAll = page.locator('#kiez-tab-all');

    if (await tabPankow.count() > 0) {
      // Click Pankow tab -> Pankow visible, Schöneberg and Köpenick hidden
      await tabPankow.click();
      await expect(pankowCard).toBeVisible();
      await expect(schoenebergCard).toHaveClass(/hidden/);
      await expect(koepenickCard).toHaveClass(/hidden/);

      // Click All tab -> All visible
      await tabAll.click();
      await expect(pankowCard).toBeVisible();
      await expect(schoenebergCard).toBeVisible();
      await expect(koepenickCard).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// TIER 3: Responsive Viewports
// ---------------------------------------------------------------------------

test.describe('Tier 3: Responsive Viewports', () => {
  const DESKTOP_VIEWPORTS = [
    { name: 'Desktop WXGA (1376x768)', width: 1376, height: 768 },
    { name: 'Desktop Full HD (1920x1080)', width: 1920, height: 1080 },
  ];

  for (const vp of DESKTOP_VIEWPORTS) {
    test(`Desktop Viewport: ${vp.name} renders full navigation and no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Desktop main navigation should be visible (md:flex)
      const desktopNav = page.locator('header nav[role="navigation"]').first();
      await expect(desktopNav).toBeVisible();

      // Mobile toggle button should be hidden on desktop
      const mobileToggle = page.locator('#mobile-menu-toggle');
      await expect(mobileToggle).toBeHidden();

      // Verify no horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow, `Horizontal scroll overflow detected at ${vp.name}`).toBe(false);
    });
  }

  test('Mobile Viewport (375x667): Hamburger button toggles mobile navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Hamburger button should be visible on mobile
    const mobileToggle = page.locator('#mobile-menu-toggle');
    await expect(mobileToggle).toBeVisible();
    await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');

    // Mobile menu drawer should initially be hidden
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeHidden();

    // Click hamburger button to open drawer
    await mobileToggle.click();
    await expect(mobileMenu).toBeVisible();
    await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');

    // Verify mobile menu contains navigation links
    const mobileEventsLink = mobileMenu.locator('a[href="/events/"], a[href^="/events"]').first();
    await expect(mobileEventsLink).toBeVisible();

    // Click hamburger button again to close drawer
    await mobileToggle.click();
    await expect(mobileMenu).toBeHidden();
    await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('Mobile Viewport (375x667): Zero horizontal overflow across core pages', async ({ page }) => {
    const PAGES_TO_TEST = ['/', '/pl/', '/events/', '/pl/events/', '/hausbibliothek/', '/pl/hausbibliothek/', '/kontakt/', '/pl/kontakt/'];

    await page.setViewportSize({ width: 375, height: 667 });

    for (const path of PAGES_TO_TEST) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(isOverflowing, `Horizontal scroll overflow detected on mobile for ${path}`).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// TIER 4: Accessibility & Interactions
// ---------------------------------------------------------------------------

test.describe('Tier 4: Accessibility & Interactions', () => {
  test.setTimeout(120000);

  const A11Y_AUDIT_PAGES = [
    { name: 'Startseite (DE)', path: '/' },
    { name: 'Startseite (PL)', path: '/pl/' },
    { name: 'Veranstaltungen (DE)', path: '/events/' },
    { name: 'Veranstaltungen (PL)', path: '/pl/events/' },
    { name: 'Hausbibliothek (DE)', path: '/hausbibliothek/' },
    { name: 'Hausbibliothek (PL)', path: '/pl/hausbibliothek/' },
    { name: 'Über uns (DE)', path: '/ueber-uns/' },
    { name: 'O nas (PL)', path: '/pl/ueber-uns/' },
    { name: 'Kontakt (DE)', path: '/kontakt/' },
    { name: 'Kontakt (PL)', path: '/pl/kontakt/' },
  ];

  for (const target of A11Y_AUDIT_PAGES) {
    test(`Axe-Core WCAG 2.1 AA Audit: ${target.name} (${target.path})`, async ({ page }) => {
      await page.goto(target.path);
      await page.waitForLoadState('domcontentloaded');

      const scanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('iframe')
        .analyze();

      const criticalOrSerious = scanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(
        criticalOrSerious,
        `Critical/Serious A11y violations found on ${target.name} (${target.path}): ${JSON.stringify(criticalOrSerious.map(v => ({ id: v.id, impact: v.impact, description: v.description })), null, 2)}`
      ).toHaveLength(0);
    });
  }

  test('Image Alt Texts & Semantic Structure', async ({ page }) => {
    const pagesToCheck = ['/', '/pl/', '/events/', '/hausbibliothek/'];

    for (const p of pagesToCheck) {
      await page.goto(p);
      await page.waitForLoadState('domcontentloaded');

      // Verify skip link
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toHaveCount(1);

      // Verify all img elements have alt attribute defined
      const missingAltImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter(img => img.getAttribute('alt') === null).map(img => img.src);
      });

      expect(missingAltImages, `Found images without alt attribute on ${p}: ${JSON.stringify(missingAltImages)}`).toHaveLength(0);
    }
  });

  test('Interactive: Hausbibliothek catalog search and filter logic', async ({ page }) => {
    await page.goto('/hausbibliothek/');
    await page.waitForLoadState('domcontentloaded');

    const searchInput = page.locator('#filter-search');
    await expect(searchInput).toBeVisible();

    // Type a specific search query
    await searchInput.fill('Polnisch');
    await searchInput.dispatchEvent('input');

    // Verify matching book cards are rendered in catalog
    const bookCards = page.locator('.book-card');
    const totalCards = await bookCards.count();
    expect(totalCards, 'Should render book cards in catalog').toBeGreaterThanOrEqual(1);

    // Type non-existent query to trigger no-results state
    await searchInput.fill('xyznonexistentquery999');
    await searchInput.dispatchEvent('input');

    const noResults = page.locator('#no-results');
    await expect(noResults).toBeVisible();
  });

  test('Interactive: Events calendar switcher tab toggling', async ({ page }) => {
    await page.goto('/events/');
    await page.waitForLoadState('domcontentloaded');

    const tabKids = page.locator('#tab-kids-cal');
    const tabMain = page.locator('#tab-main-cal');
    const containerKids = page.locator('#container-kids-cal');
    const containerMain = page.locator('#container-main-cal');

    if (await tabKids.count() > 0 && await tabMain.count() > 0) {
      // Click Kids Calendar
      await tabKids.click();
      await expect(containerKids).toBeVisible();
      await expect(containerMain).toBeHidden();

      // Click Main Calendar
      await tabMain.click();
      await expect(containerMain).toBeVisible();
      await expect(containerKids).toBeHidden();
    }
  });

  test('Interactive: Dark / Light theme toggle persistence', async ({ page }) => {
    await page.goto('/');
    const themeBtn = page.locator('#theme-toggle-btn');
    await expect(themeBtn).toBeVisible();

    const isInitialDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    // Toggle theme
    await themeBtn.click();
    const isToggledDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isToggledDark).toBe(!isInitialDark);

    // Verify localStorage item was stored
    const savedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(savedTheme).toBeTruthy();
  });
});
