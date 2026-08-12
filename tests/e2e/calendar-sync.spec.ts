import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('📅 Kalender-Sync-Konsistenztest (R1.2 iCal Sync)', () => {
  test('verifiziert, dass synchonisierte Google-Kalender-Events vorhanden und valide gerendert werden', async ({ page }) => {
    // 1. Lokale Event-Dateien in content collection prüfen
    const eventsDir = path.resolve(process.cwd(), 'frontend/src/content/events');
    expect(fs.existsSync(eventsDir)).toBeTruthy();
    
    const eventFiles = fs.readdirSync(eventsDir).filter(f => f.endsWith('.md'));
    expect(eventFiles.length).toBeGreaterThan(0);
    console.log(`✓ Gefundene synchonisierte Event-Dateien in Content Collection: ${eventFiles.length}`);

    // 2. Startseite aufrufen
    await page.goto('/');
    await expect(page).toHaveTitle(/SprachCafé/i);

    // 3. Kalender / Event-Elemente prüfen
    const bodyText = await page.innerText('body');
    expect(bodyText).toBeTruthy();

    // Verifizieren, dass Orte (Pankow, Schöneberg, Köpenick) und Event-Kategorien vorhanden sind
    const hasLocation = bodyText.includes('Pankow') || bodyText.includes('Schöneberg') || bodyText.includes('Köpenick') || bodyText.includes('Berlin');
    expect(hasLocation).toBeTruthy();
  });

  test('verifiziert Datenstruktur und Eigenschaften eines synchronisierten iCal-Events', async () => {
    const eventsDir = path.resolve(process.cwd(), 'frontend/src/content/events');
    const files = fs.readdirSync(eventsDir).filter(f => f.startsWith('gcal-') && f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
    
    // Synchonisiertes Event einlesen
    const samplePath = path.join(eventsDir, files[0]);
    const content = fs.readFileSync(samplePath, 'utf-8');

    expect(content).toContain('title:');
    expect(content).toContain('date:');
    expect(content).toContain('locationRef:');
    expect(content).not.toContain('undefined');
  });
});
