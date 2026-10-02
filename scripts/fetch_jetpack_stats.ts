#!/usr/bin/env npx tsx
/**
 * SprachCafé Polnisch e.V. - Jetpack Historical Statistics Fetcher
 * 
 * Fetches verified historical WordPress traffic, views, top pages, referrers,
 * and outbound clicks via Automattic Jetpack API and exports them to:
 * `frontend/public/data/jetpack-stats.json`
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const OUTPUT_JSON_PATH = path.resolve(scriptDir, '../frontend/public/data/jetpack-stats.json');
const PHP_EXPORT_SCRIPT = path.resolve(scriptDir, 'export_jetpack_stats.php');
const WP_PRODUCTION_DIR = '/home/ubuntu/wordpress-production';

export interface JetpackStatsExport {
  metadata: {
    blogId: number;
    source: string;
    exportedAt: string;
    totalAllTimeViews: number;
    daysRecorded: number;
    yearlyTotals: Record<string, number>;
  };
  monthlyViews: {
    jahrMonat: string;
    jahr: number;
    views: number;
    days: number;
  }[];
  topPosts: {
    postId: number;
    title: string;
    url: string;
    viewsTotal: number;
    views2026: number;
    views2025: number;
    views2024: number;
    viewsByMonth: Record<string, number>;
  }[];
  trafficChannels: Record<string, number>;
  topReferrers: {
    domain: string;
    exampleUrl: string;
    viewsTotal: number;
    views2026: number;
    views2025: number;
  }[];
  clickCategories: Record<string, number>;
  topClicks: {
    url: string;
    label: string;
    clicksTotal: number;
    clicks2026: number;
    clicks2025: number;
  }[];
}

async function main() {
  console.log('📊 [Jetpack Exporter] Starte Export historischer Jetpack-Statistiken...');

  try {
    const phpCode = fs.readFileSync(PHP_EXPORT_SCRIPT, 'utf-8')
      .replace(/^<\?php\s*/, '')
      .replace(/^\s*if\s*\(!defined\('ABSPATH'\)\)\s*\{\s*exit;\s*\}/m, '');

    console.log('🔄 Sende Abfrage an WordPress Jetpack API (via wp-cli Docker)...');
    const cmd = `docker compose run --rm -T wp-cli eval "${phpCode.replace(/"/g, '\\"')}" 2>/dev/null`;
    
    // Alternative: pipe via stdin to avoid shell escaping issues with large strings
    const jsonOutput = execSync(`sed '1{/^<?php/d}' "${PHP_EXPORT_SCRIPT}" | docker compose run --rm -T wp-cli eval "$(cat)" 2>/dev/null`, {
      cwd: WP_PRODUCTION_DIR,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf-8',
      timeout: 120000
    });

    if (!jsonOutput || !jsonOutput.trim().startsWith('{')) {
      throw new Error('Ungültige oder leere Rückgabe von WP-CLI');
    }

    const data: JetpackStatsExport = JSON.parse(jsonOutput);

    fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✅ Jetpack Statistiken erfolgreich exportiert nach: ${OUTPUT_JSON_PATH}`);
    console.log(`   - Blog ID: ${data.metadata.blogId}`);
    console.log(`   - Gesamtaufrufe: ${data.metadata.totalAllTimeViews.toLocaleString('de-DE')}`);
    console.log(`   - Aufgezeichnete Tage: ${data.metadata.daysRecorded}`);
    console.log(`   - Aufrufe 2026: ${data.metadata.yearlyTotals['2026']?.toLocaleString('de-DE') || 0}`);
    console.log(`   - Aufrufe 2025: ${data.metadata.yearlyTotals['2025']?.toLocaleString('de-DE') || 0}`);
    console.log(`   - Top-Seiten erfasst: ${data.topPosts.length}`);
    console.log(`   - Referrer-Domains: ${data.topReferrers.length}`);
  } catch (err: any) {
    console.error('⚠️ Fehler beim Abrufen der Live-Jetpack-Statistiken:', err.message || err);
    if (fs.existsSync(OUTPUT_JSON_PATH)) {
      console.log('ℹ️ Verwende vorhandene gecachte jetpack-stats.json.');
    } else {
      process.exit(1);
    }
  }
}

main();
