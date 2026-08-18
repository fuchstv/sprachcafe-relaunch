import { test, expect } from '@playwright/test';

test.describe('📝 Mitgliedschafts-Formular & 4-Schritte-Abnahmetest', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/mitmachen/mitglied-werden/');
  });

  test('Stufe 1-4 Erklärung und Dokumenten-Download Links sind vorhanden', async ({ page }) => {
    // Hero & Title
    await expect(page.locator('h1')).toContainText('Wo Gemeinschaft und Kultur ein Zuhause finden');
    
    // 4-Schritte-Sektion
    const schritteSection = page.locator('#schritte');
    await expect(schritteSection).toBeVisible();

    // Schritt 1: Satzung lesen (PDF Download Link Verification)
    const satzungLink = page.locator('a[href*="Satzung-SCP-12.06.2020.pdf"]').first();
    await expect(satzungLink).toBeVisible();
    await expect(satzungLink).toHaveAttribute('href', '/downloads/Satzung-SCP-12.06.2020.pdf');

    // Schritt 2: Mission & Werte
    const missionLink = page.locator('#schritte a[href*="/ueber-uns/mission/"]');
    await expect(missionLink).toBeVisible();

    // Schritt 4: Beitragsstufen (Silver, Gold, Platinum, Firmen)
    const stufenSection = page.locator('#stufen');
    await expect(stufenSection).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Silver' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gold' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Platinum' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Firmen' })).toBeVisible();
  });

  test('Vollständiger 4-Stufen Formularausfüll- und Absende-Test', async ({ page }) => {
    const form = page.locator('#membership-native-form');
    await expect(form).toBeVisible();

    // STUFE 1: Allgemeine Angaben ausfüllen
    await page.fill('#member-fullname', 'Marta Nowak Playwright Test');
    await page.fill('#member-birthdate', '1992-04-12');
    await page.fill('#member-occupation', 'Software Entwicklerin');
    await page.fill('#member-street', 'Schulzestraße 1');
    await page.fill('#member-zip', '13187');
    await page.fill('#member-city', 'Berlin');
    await page.fill('#member-email', 'marta.nowak.playwright@example.org');
    await page.fill('#member-phone', '+49301234567');

    // STUFE 2: Art der Mitgliedschaft & Stufe auswählen
    await page.selectOption('#member-type', 'ordentlich');
    await page.selectOption('#member-tier', 'Gold');

    // STUFE 3: Weitere Angaben
    await page.selectOption('#member-how', 'Website / Suchmaschine');
    await page.fill('#member-support', 'Unterstützung bei der Hausbibliothek und Eventorganisation');

    // STUFE 4: Legal & Checkboxen (Satzung & Datenschutz)
    await page.check('#consent-statute');
    await page.check('#consent-privacy');

    // Checkbox Validierung prüfen
    expect(await page.isChecked('#consent-statute')).toBeTruthy();
    expect(await page.isChecked('#consent-privacy')).toBeTruthy();

    // Absenden
    await page.click('#member-submit-btn');

    // Erfolgsmeldung verifizieren
    const successBanner = page.locator('#member-form-success');
    await expect(successBanner).toBeVisible({ timeout: 10000 });
    await expect(successBanner).toContainText('Vielen Dank für Ihren Mitgliedsantrag!');
  });
});
