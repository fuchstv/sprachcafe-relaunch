import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Scroll To Top Floating Action Button', () => {
  const pages = [
    { lang: 'de', url: '/', expectedLabel: 'Nach oben scrollen' },
    { lang: 'pl', url: '/pl/', expectedLabel: 'Przewiń do góry' },
    { lang: 'en', url: '/en/', expectedLabel: 'Scroll to top' },
  ];

  for (const p of pages) {
    test(`[${p.lang.toUpperCase()}] should display, work on click, and be accessible`, async ({ page }) => {
      await page.goto(p.url);

      const btn = page.locator('#scroll-to-top');
      await expect(btn).toBeAttached();

      // Check localization of aria-label and title
      await expect(btn).toHaveAttribute('aria-label', p.expectedLabel);
      await expect(btn).toHaveAttribute('title', p.expectedLabel);

      // Initially at top: should be hidden / aria-hidden true / tabindex -1
      await expect(btn).toHaveAttribute('aria-hidden', 'true');
      await expect(btn).toHaveAttribute('tabindex', '-1');
      await expect(btn).toHaveClass(/opacity-0/);

      // Scroll down past the 300px threshold
      await page.evaluate(() => window.scrollTo(0, 800));
      // Give time for requestAnimationFrame and scroll event
      await page.waitForFunction(() => {
        const el = document.getElementById('scroll-to-top');
        return el && el.getAttribute('aria-hidden') === 'false';
      });

      await expect(btn).toHaveAttribute('aria-hidden', 'false');
      await expect(btn).toHaveAttribute('tabindex', '0');
      await expect(btn).toHaveClass(/opacity-100/);

      // Verify touch target size (at least 44x44px)
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }

      // Check accessibility using axe-core while button is visible
      const axeResults = await new AxeBuilder({ page })
        .include('#scroll-to-top')
        .analyze();
      expect(axeResults.violations).toEqual([]);

      // Click button and verify smooth scroll back to top
      await btn.click();
      await page.waitForFunction(() => window.scrollY < 20, null, { timeout: 5000 });
      const finalScrollY = await page.evaluate(() => window.scrollY);
      expect(finalScrollY).toBeLessThan(20);
    });
  }
});
