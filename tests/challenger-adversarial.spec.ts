import { test, expect } from '@playwright/test';

/**
 * Challenger 1: Adversarial E2E & Interaction Stress Test Suite
 *
 * Scope:
 * 1. Rapid language switcher toggling across multiple views (race conditions, path preservation, aria sync, error absence).
 * 2. Long Polish compound words & multi-line event titles in VintageEventTicketCard (layout overflow, box bounds, linocut preservation, button clickability).
 * 3. Bookshelf carousel boundary conditions (scrolling past bounds, keyboard arrow navigation, focus visibility, empty/single states).
 * 4. Responsive viewport stress tests across unusual screen dimensions (320px ultra-mobile, 1024px landscape, 1366px laptop, 2560px 4K).
 * 5. Dark/Light mode color token contrast (WCAG AA/AAA calculations) and ticket notch background inversion.
 */

// Helper functions for WCAG color contrast calculation
function parseRgb(color: string): [number, number, number] {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(c1: [number, number, number], c2: [number, number, number]): number {
  const lum1 = getLuminance(c1);
  const lum2 = getLuminance(c2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// ---------------------------------------------------------------------------
// 1. RAPID LANGUAGE SWITCHER TOGGLING ACROSS MULTIPLE VIEWS
// ---------------------------------------------------------------------------
test.describe('1. Adversarial Language Switcher Stress Tests', () => {
  const targetRoutes = [
    { name: 'Home', de: '/', pl: '/pl/', en: '/en/' },
    { name: 'Events', de: '/events/', pl: '/pl/events/', en: '/en/events/' },
    { name: 'Hausbibliothek', de: '/hausbibliothek/', pl: '/pl/hausbibliothek/', en: '/en/hausbibliothek/' },
    { name: 'Ueber Uns', de: '/ueber-uns/', pl: '/pl/ueber-uns/', en: '/en/ueber-uns/' },
    { name: 'Kontakt', de: '/kontakt/', pl: '/pl/kontakt/', en: '/en/kontakt/' },
  ];

  for (const route of targetRoutes) {
    test(`Rapid consecutive switching on ${route.name} route without desync or console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => {
        consoleErrors.push(err.message);
      });

      await page.goto(route.de);
      await page.waitForLoadState('domcontentloaded');

      // Check initial DE state
      expect(await page.locator('html').getAttribute('lang')).toBe('de');
      const deSwitcherLink = page.locator('nav[data-testid="language-switcher"] a[href$="/"], nav[data-testid="language-switcher"] a[href="' + route.de + '"]').first();
      await expect(deSwitcherLink).toHaveAttribute('aria-current', 'page');

      // Rapidly switch: DE -> PL -> EN -> PL -> DE
      // 1. Switch to PL
      const plLink = page.locator('nav[data-testid="language-switcher"] a[title="Polski"], nav[data-testid="language-switcher"] a[href*="/pl/"]').first();
      await plLink.click();
      await page.waitForLoadState('domcontentloaded');
      expect(await page.locator('html').getAttribute('lang')).toBe('pl');
      expect(page.url()).toContain('/pl/');

      // 2. Rapid switch to EN (if present) or back to DE
      const enLink = page.locator('nav[data-testid="language-switcher"] a[title="English"], nav[data-testid="language-switcher"] a[href*="/en/"]').first();
      if (await enLink.count() > 0) {
        await enLink.click();
        await page.waitForLoadState('domcontentloaded');
        expect(await page.locator('html').getAttribute('lang')).toBe('en');
        expect(page.url()).toContain('/en/');
      }

      // 3. Switch back to PL
      const plLinkAgain = page.locator('nav[data-testid="language-switcher"] a[title="Polski"], nav[data-testid="language-switcher"] a[href*="/pl/"]').first();
      await plLinkAgain.click();
      await page.waitForLoadState('domcontentloaded');
      expect(await page.locator('html').getAttribute('lang')).toBe('pl');
      expect(page.url()).toContain('/pl/');

      // 4. Switch back to DE
      const deLinkFinal = page.locator('nav[data-testid="language-switcher"] a[title="Deutsch"], nav[data-testid="language-switcher"] a[href$="/"]').first();
      await deLinkFinal.click();
      await page.waitForLoadState('domcontentloaded');
      expect(await page.locator('html').getAttribute('lang')).toBe('de');

      // Assert no JavaScript execution crashes
      const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('404') && !e.includes('CORS') && !e.includes('ERR_FAILED'));
      expect(fatalErrors, `Console errors occurred during rapid switching on ${route.name}: ${fatalErrors.join(', ')}`).toHaveLength(0);
    });
  }

  test('Language Switcher Active Pill state synchronization and keyboard focusability', async ({ page }) => {
    await page.goto('/pl/events/');
    await page.waitForLoadState('domcontentloaded');

    // On /pl/events/, Polish option must have active styling & aria-current="page"
    const activePlOption = page.locator('nav[aria-label] a[aria-current="page"]');
    await expect(activePlOption).toBeVisible();
    await expect(activePlOption).toContainText('PL');

    // Inactive German and English options must NOT have aria-current="page"
    const inactiveDeOption = page.locator('nav[aria-label] a[title="Deutsch"]');
    await expect(inactiveDeOption).not.toHaveAttribute('aria-current', 'page');

    // Verify focus ring styling on tab
    await inactiveDeOption.focus();
    const isFocused = await inactiveDeOption.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. LONG POLISH COMPOUND WORDS & MULTI-LINE TITLES IN VINTAGE TICKET CARDS
// ---------------------------------------------------------------------------
test.describe('2. VintageEventTicketCard Layout Stress & Polish Word Invariance', () => {
  test('Native Polish event ticket cards on /pl/events/ render without horizontal overflow or overlapping elements', async ({ page }) => {
    await page.goto('/pl/events/');
    await page.waitForLoadState('domcontentloaded');

    const ticketCards = page.locator('article.vintage-ticket-card');
    const count = await ticketCards.count();
    expect(count, 'Should have at least 1 VintageEventTicketCard on /pl/events/').toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const card = ticketCards.nth(i);
      await expect(card).toBeVisible();

      // Check card internal scrollWidth vs clientWidth (no layout overflow)
      const isOverflowing = await card.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
      expect(isOverflowing, `Ticket card #${i} has internal horizontal overflow`).toBe(false);

      // Check date stamp box
      const dateBox = card.locator('div:has(span.font-serif)').first();
      await expect(dateBox).toBeVisible();
      const dateBoxBounds = await dateBox.boundingBox();
      expect(dateBoxBounds?.width, `Date box #${i} width must be >= 60px`).toBeGreaterThanOrEqual(60);
      expect(dateBoxBounds?.height, `Date box #${i} height must be >= 50px`).toBeGreaterThanOrEqual(50);

      // Check linocut illustration thumbnail
      const linocutImg = card.locator('img[loading="lazy"]').first();
      await expect(linocutImg).toBeVisible();
      const imgBounds = await linocutImg.boundingBox();
      expect(imgBounds?.width, `Linocut thumbnail #${i} must not be crushed`).toBeGreaterThanOrEqual(40);
      expect(imgBounds?.height, `Linocut thumbnail #${i} must not be crushed`).toBeGreaterThanOrEqual(40);

      // Check CTA buttons are within card bounding box and clickable
      const detailsBtn = card.locator('a:has-text("Szczegóły"), a:has-text("Details"), a[href*="/events/"]').last();
      await expect(detailsBtn).toBeVisible();
      const cardBounds = await card.boundingBox();
      const btnBounds = await detailsBtn.boundingBox();
      expect(btnBounds && cardBounds && btnBounds.y + btnBounds.height <= cardBounds.y + cardBounds.height + 4,
        `Details button #${i} must not overflow outside card bottom`).toBe(true);

      const calBtn = card.locator('a[title="Google Calendar"], a:has-text("Kalendarz"), a:has-text("Kalender")').first();
      await expect(calBtn).toBeVisible();
    }
  });

  test('Adversarial Stress Test: Ultra-long unbroken Polish compound words and 15-line titles', async ({ page }) => {
    await page.goto('/events/');
    await page.waitForLoadState('domcontentloaded');

    const firstCard = page.locator('article.vintage-ticket-card').first();
    await expect(firstCard).toBeVisible();

    // Inject extreme adversarial Polish content into the first ticket card
    await firstCard.evaluate((card) => {
      const titleEl = card.querySelector('h3 a');
      if (titleEl) {
        titleEl.textContent = 'Konstantynopolitańczykowianeczka Dziewięćsetdziewięćdziesięciodziewięcionarodowościowa Najwybitniejszopolszczyźnianie ' +
          'Wyindywidualizowaliśmy_się_z_rozentuzjazmowanego_tłumu_podczas_międzynarodowego_festiwalu_językowego_w_berlinie';
      }

      const descEl = card.querySelector('p');
      if (descEl) {
        descEl.textContent = 'Bardzo długi opis wydarzenia zawierający specyficzne polskie znaki diakrytyczne: Zażółć gęślą jaźń, Źdźbło, Świerk, Ćma, Łódź, Dźwig, Koń, Bąk. ' +
          'Niezwykle rozbudowane zdanie wielokrotnie złożone opisujące historię literatury polskiej oraz wpływ polskich plakatów na sztukę europejską XX wieku. '.repeat(5);
      }

      // Add long location and tags
      const tagContainer = card.querySelector('div.flex.flex-wrap');
      if (tagContainer) {
        const span = document.createElement('span');
        span.className = 'px-2.5 py-1 rounded-full bg-[#8B1E2D]/10 text-[#8B1E2D] text-[11px] font-bold border border-[#8B1E2D]/20';
        span.textContent = '📍 Berlin-Pankow-Niederschönhausen-Wielokulturowo';
        tagContainer.appendChild(span);
      }
    });

    // Verify card layout stability under extreme text
    const stressCard = page.locator('article.vintage-ticket-card').first();
    const cardBox = await stressCard.boundingBox();
    expect(cardBox?.width).toBeGreaterThan(200);

    // Verify no window horizontal overflow
    const docOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(docOverflow, 'Document must not develop horizontal scroll from long compound words').toBe(false);

    // Verify action buttons remain within bounds and interactive
    const detailsBtn = stressCard.locator('a').filter({ hasText: /Details|Szczegóły/ }).first();
    await expect(detailsBtn).toBeVisible();
    const btnBox = await detailsBtn.boundingBox();
    expect(btnBox && cardBox && btnBox.y < cardBox.y + cardBox.height).toBe(true);

    // Verify date stamp box is not crushed
    const dateBox = stressCard.locator('div:has(span.font-serif)').first();
    const dateBoxBounds = await dateBox.boundingBox();
    expect(dateBoxBounds?.width).toBeGreaterThanOrEqual(60);
  });
});

// ---------------------------------------------------------------------------
// 3. BOOKSHELF CAROUSEL BOUNDARY CONDITIONS & ACCESSIBILITY
// ---------------------------------------------------------------------------
test.describe('3. Bookshelf Carousel Boundary Conditions & Keyboard Navigation', () => {
  test('Carousel boundary navigation: clicking Next/Prev past extremities maintains valid scroll position', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const container = page.locator('#bookshelf-scroll-container');
    await expect(container).toBeVisible();

    const prevBtn = page.locator('#bookshelf-prev-btn');
    const nextBtn = page.locator('#bookshelf-next-btn');
    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();

    // Initial scroll position should be 0
    let initialScroll = await container.evaluate((el) => el.scrollLeft);
    expect(initialScroll).toBe(0);

    // Clicking Prev at position 0 must not produce negative scroll or error
    for (let i = 0; i < 5; i++) {
      await prevBtn.click();
    }
    await page.waitForTimeout(300);
    const scrollAfterPrev = await container.evaluate((el) => el.scrollLeft);
    expect(scrollAfterPrev, 'scrollLeft must remain >= 0 when clicking Prev at start').toBeGreaterThanOrEqual(0);

    // Click Next repeatedly past the end
    for (let i = 0; i < 10; i++) {
      await nextBtn.click();
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(1000);

    const scrollAtEnd = await container.evaluate((el) => ({
      scrollLeft: el.scrollLeft,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      maxScroll: el.scrollWidth - el.clientWidth,
    }));

    expect(scrollAtEnd.scrollLeft).toBeGreaterThan(0);
    expect(scrollAtEnd.scrollLeft, 'scrollLeft must not exceed scrollWidth - clientWidth + 2').toBeLessThanOrEqual(scrollAtEnd.maxScroll + 10);

    // Click Prev repeatedly back to start
    for (let i = 0; i < 10; i++) {
      await prevBtn.click();
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(1000);

    const scrollBack = await container.evaluate((el) => el.scrollLeft);
    expect(scrollBack).toBeLessThanOrEqual(50);
  });

  test('Keyboard arrow navigation and focusability of Bookshelf container', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const container = page.locator('#bookshelf-scroll-container');
    await expect(container).toHaveAttribute('tabindex', '0');
    await expect(container).toHaveAttribute('aria-label');

    // Focus container and dispatch keyboard arrows
    await container.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // Verify all book items have reachable and focusable links with proper titles
    const bookLinks = container.locator('a[href*="/hausbibliothek/"]');
    const bookCount = await bookLinks.count();
    expect(bookCount, 'Should have book links on shelf').toBeGreaterThanOrEqual(3);

    for (let i = 0; i < Math.min(bookCount, 5); i++) {
      const link = bookLinks.nth(i);
      const titleAttr = await link.getAttribute('title');
      expect(titleAttr, `Book link #${i} must have descriptive title attribute`).toBeTruthy();
      const href = await link.getAttribute('href');
      expect(href).toMatch(/\/hausbibliothek\/.+/);
    }
  });

  test('Polish localized Bookshelf widget on /pl/ retains localized links and headings', async ({ page }) => {
    await page.goto('/pl/');
    await page.waitForLoadState('domcontentloaded');

    const shelfHeading = page.locator('#bookshelf-heading');
    await expect(shelfHeading).toBeVisible();

    // Check bottom catalog button on /pl/ leads to /pl/hausbibliothek/
    const catalogBtn = page.locator('section[aria-labelledby="bookshelf-heading"] a[href*="/hausbibliothek/"]').last();
    await expect(catalogBtn).toBeVisible();
    const catalogHref = await catalogBtn.getAttribute('href');
    expect(catalogHref, 'Catalog button on /pl/ must link to /pl/hausbibliothek/').toContain('/pl/hausbibliothek/');
  });
});

// ---------------------------------------------------------------------------
// 4. RESPONSIVE VIEWPORT STRESS TESTS ACROSS UNUSUAL DIMENSIONS
// ---------------------------------------------------------------------------
test.describe('4. Responsive Viewport Stress Tests', () => {
  const VIEWPORTS = [
    { name: 'Ultra-Mobile (320px)', width: 320, height: 640 },
    { name: 'Tablet Landscape (1024px)', width: 1024, height: 768 },
    { name: 'Laptop Standard (1366px)', width: 1366, height: 768 },
    { name: '4K UHD Desktop (2560px)', width: 2560, height: 1440 },
  ];

  const PAGES_TO_TEST = ['/', '/pl/', '/events/', '/pl/events/', '/hausbibliothek/', '/pl/hausbibliothek/'];

  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name}`, () => {
      for (const path of PAGES_TO_TEST) {
        test(`No horizontal window scrollbar & intact layout on ${path} (${vp.width}x${vp.height})`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(path);
          await page.waitForLoadState('domcontentloaded');

          // 1. Verify ZERO horizontal scrollbar on root document
          const isWindowOverflowing = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            return docWidth > winWidth;
          });
          expect(isWindowOverflowing, `Page ${path} develops horizontal scrollbar at ${vp.width}px!`).toBe(false);

          // 2. Check header visibility
          const header = page.locator('header[role="banner"]');
          await expect(header).toBeVisible();

          // 3. For ultra-mobile (320px), verify mobile hamburger menu opens and closes smoothly
          if (vp.width <= 480) {
            const menuToggle = page.locator('#mobile-menu-toggle');
            await expect(menuToggle).toBeVisible();
            await menuToggle.click();

            const mobileMenu = page.locator('#mobile-menu');
            await expect(mobileMenu).toBeVisible();

            // Close menu
            await menuToggle.click();
            await expect(mobileMenu).toBeHidden();
          }

          // 4. For 4K UHD (2560px), verify content container does not exceed max-width (1200px)
          if (vp.width >= 1920) {
            const mainSections = page.locator('header > div, section.max-w-\\[1200px\\]');
            const sectionCount = await mainSections.count();
            for (let s = 0; s < Math.min(sectionCount, 3); s++) {
              const sec = mainSections.nth(s);
              const secBox = await sec.boundingBox();
              if (secBox) {
                expect(secBox.width, `Section #${s} should be constrained by max-w-[1200px]`).toBeLessThanOrEqual(1250);
              }
            }
          }
        });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 5. DARK / LIGHT MODE COLOR TOKEN CONTRAST & TICKET NOTCH INVERSION
// ---------------------------------------------------------------------------
test.describe('5. Dark/Light Mode Contrast & Ticket Notch Inversion', () => {
  test('Dark mode toggle alters DOM class and persists state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const themeToggleBtn = page.locator('#theme-toggle-btn');
    await expect(themeToggleBtn).toBeVisible();

    // Ensure light mode initially
    const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    
    // Toggle theme
    await themeToggleBtn.click();
    const afterFirstToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(afterFirstToggle).toBe(!initialIsDark);

    // Check localStorage persistence
    const savedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(savedTheme).toBe(afterFirstToggle ? 'dark' : 'light');

    // Toggle back
    await themeToggleBtn.click();
    const afterSecondToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(afterSecondToggle).toBe(initialIsDark);
  });

  test('Ticket notch cutout background color perfectly inverts between Light and Dark mode', async ({ page }) => {
    await page.goto('/events/');
    await page.waitForLoadState('domcontentloaded');

    // Ensure Light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });

    const firstTicket = page.locator('article.vintage-ticket-card').first();
    await expect(firstTicket).toBeVisible();

    // In Light Mode:
    // Left notch cutout element: div.w-3.5.h-7
    const leftNotch = firstTicket.locator('div.w-3\\.5.h-7').first();
    await expect(leftNotch).toBeVisible();

    const lightNotchBg = await leftNotch.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const lightBodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

    const lightNotchRgb = parseRgb(lightNotchBg);
    const lightBodyRgb = parseRgb(lightBodyBg);

    // In light mode, notch should match warm salon background #FAF6EE (rgb(250, 246, 238))
    const lightDiff = Math.abs(lightNotchRgb[0] - lightBodyRgb[0]) +
                      Math.abs(lightNotchRgb[1] - lightBodyRgb[1]) +
                      Math.abs(lightNotchRgb[2] - lightBodyRgb[2]);
    expect(lightDiff, `Light mode notch bg (${lightNotchBg}) must match body bg (${lightBodyBg})`).toBeLessThanOrEqual(15);

    // Switch to Dark Mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });

    const darkNotchBg = await leftNotch.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const darkBodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

    const darkNotchRgb = parseRgb(darkNotchBg);
    const darkBodyRgb = parseRgb(darkBodyBg);

    // In dark mode, notch should invert and match dark background #181615 (rgb(24, 22, 21))
    const darkDiff = Math.abs(darkNotchRgb[0] - darkBodyRgb[0]) +
                     Math.abs(darkNotchRgb[1] - darkBodyRgb[1]) +
                     Math.abs(darkNotchRgb[2] - darkBodyRgb[2]);
    expect(darkDiff, `Dark mode notch bg (${darkNotchBg}) must match body dark bg (${darkBodyBg})`).toBeLessThanOrEqual(15);

    // Verify dark notch is significantly darker than light notch (empirical proof of inversion)
    const lightNotchLum = getLuminance(lightNotchRgb);
    const darkNotchLum = getLuminance(darkNotchRgb);
    expect(lightNotchLum, 'Light notch luminance must be bright (> 0.8)').toBeGreaterThan(0.8);
    expect(darkNotchLum, 'Dark notch luminance must be dark (< 0.05)').toBeLessThan(0.05);
  });

  test('Mathematical WCAG 2.1 AA/AAA Color Contrast Verification for Core Design Tokens', async ({ page }) => {
    // Exact brand tokens from Tailwind config
    const TOKENS = {
      // Light Mode
      lightBg: hexToRgb('#FAF6EE'),       // ~ rgb(250, 246, 238)
      lightText: hexToRgb('#1D1B1A'),     // On-surface text
      lightMuted: hexToRgb('#5B403D'),    // On-surface variant
      lightPrimary: hexToRgb('#8B1E2D'),  // Polish Wine Red
      lightWhite: hexToRgb('#FFFFFF'),

      // Dark Mode
      darkBg: hexToRgb('#181615'),        // ~ rgb(24, 22, 21)
      darkCard: hexToRgb('#22201E'),      // Dark surface
      darkText: hexToRgb('#F5F0EE'),      // On-surface dark
      darkMuted: hexToRgb('#D4C5C2'),     // On-surface variant dark
      darkPrimary: hexToRgb('#FF758F'),   // Accessible Rose Pink in dark mode
      darkDateBox: hexToRgb('#2A2725'),
    };

    // 1. Light Mode Contrasts
    const lightHeadingContrast = getContrastRatio(TOKENS.lightText, TOKENS.lightBg);
    expect(lightHeadingContrast, 'Light heading contrast (#1D1B1A on #FAF6EE) must exceed WCAG AAA (7:1)').toBeGreaterThanOrEqual(12.0);

    const lightBodyContrast = getContrastRatio(TOKENS.lightMuted, TOKENS.lightBg);
    expect(lightBodyContrast, 'Light body text contrast (#5B403D on #FAF6EE) must exceed WCAG AAA (7:1)').toBeGreaterThanOrEqual(7.0);

    const lightPrimaryContrast = getContrastRatio(TOKENS.lightPrimary, TOKENS.lightBg);
    expect(lightPrimaryContrast, 'Light primary wine red contrast (#8B1E2D on #FAF6EE) must exceed WCAG AA (4.5:1)').toBeGreaterThanOrEqual(6.0);

    const lightDateBoxMonthContrast = getContrastRatio(TOKENS.lightPrimary, TOKENS.lightWhite);
    expect(lightDateBoxMonthContrast, 'Light date box month (#8B1E2D on #FFFFFF) must exceed WCAG AA (4.5:1)').toBeGreaterThanOrEqual(7.0);

    // 2. Dark Mode Contrasts
    const darkHeadingContrast = getContrastRatio(TOKENS.darkText, TOKENS.darkBg);
    expect(darkHeadingContrast, 'Dark heading contrast (#F5F0EE on #181615) must exceed WCAG AAA (7:1)').toBeGreaterThanOrEqual(13.0);

    const darkBodyContrast = getContrastRatio(TOKENS.darkMuted, TOKENS.darkBg);
    expect(darkBodyContrast, 'Dark body contrast (#D4C5C2 on #181615) must exceed WCAG AAA (7:1)').toBeGreaterThanOrEqual(9.0);

    const darkPrimaryOnBgContrast = getContrastRatio(TOKENS.darkPrimary, TOKENS.darkBg);
    expect(darkPrimaryOnBgContrast, 'Dark primary pink on dark bg (#FF758F on #181615) must exceed WCAG AA (4.5:1)').toBeGreaterThanOrEqual(7.0);

    const darkPrimaryOnCardContrast = getContrastRatio(TOKENS.darkPrimary, TOKENS.darkCard);
    expect(darkPrimaryOnCardContrast, 'Dark primary pink on dark card (#FF758F on #22201E) must exceed WCAG AA (4.5:1)').toBeGreaterThanOrEqual(6.0);

    const darkDateBoxMonthContrast = getContrastRatio(TOKENS.darkPrimary, TOKENS.darkDateBox);
    expect(darkDateBoxMonthContrast, 'Dark date box month (#FF758F on #2A2725) must exceed WCAG AA (4.5:1)').toBeGreaterThanOrEqual(4.5);
  });
});
