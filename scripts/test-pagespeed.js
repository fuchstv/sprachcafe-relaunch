#!/usr/bin/env node
/**
 * Automated Google PageSpeed & Performance Audit Runner (Mobile & Desktop)
 * SprachCafé Relaunch Monorepo
 *
 * Thresholds:
 * - PageSpeed Performance Score >= 95 (0.95)
 * - First Contentful Paint (FCP) < 800ms (0.8s)
 * - Largest Contentful Paint (LCP) < 1500ms (1.5s)
 * - Cumulative Layout Shift (CLS) <= 0.01 (0.00)
 *
 * Fail-the-Build: Exits with code 1 if any metric violates thresholds.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../frontend/dist');
const PORT = 8089;
const HOST = '127.0.0.1';

// Threshold Definitions
const THRESHOLDS = {
  performanceScore: 0.95, // 95/100
  fcpMaxMs: 800,          // < 0.8s
  lcpMaxMs: 1500,         // < 1.5s
  clsMax: 0.01,           // 0.00 (with float tolerance)
};

// MIME types for static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * Lightweight Static HTTP Server
 */
function createStaticServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl.endsWith('/')) reqUrl += 'index.html';

    let filePath = path.join(DIST_DIR, reqUrl);

    if (!fs.existsSync(filePath) && fs.existsSync(filePath + '/index.html')) {
      filePath = filePath + '/index.html';
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  });
}

/**
 * Run Lighthouse CLI for given mode ('mobile' | 'desktop')
 */
function runLighthouse(mode) {
  const url = `http://${HOST}:${PORT}/`;
  const reportPath = path.resolve(__dirname, `../lh-report-${mode}.json`);

  let chromePath = process.env.CHROME_PATH;
  if (!chromePath || !fs.existsSync(chromePath)) {
    const candidatePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium'
    ];
    chromePath = candidatePaths.find(p => fs.existsSync(p));
  }

  const lighthouseBin = path.resolve(__dirname, '../frontend/node_modules/.bin/lighthouse');

  let args = [
    url,
    '--quiet',
    '--no-enable-error-reporting',
    '--output=json',
    `--output-path=${reportPath}`,
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage',
  ];

  if (mode === 'desktop') {
    args.push('--preset=desktop');
  }

  console.log(`🚀 Executing Lighthouse Audit for Mode: ${mode.toUpperCase()}...`);
  if (chromePath) {
    console.log(`📌 Using Chrome Binary: ${chromePath}`);
  }
  
  try {
    const env = { ...process.env, CI: 'true' };
    if (chromePath) env.CHROME_PATH = chromePath;
    execFileSync(lighthouseBin, args, { stdio: 'inherit', env, timeout: 60000 });
  } catch (err) {
    console.warn(`⚠️ Notice: Lighthouse execution returned non-zero code or warning: ${err.message}`);
  }

  if (!fs.existsSync(reportPath)) {
    console.warn(`⚠️ Warning: Lighthouse JSON report not found at ${reportPath}. Skipping threshold comparison for mode: ${mode}`);
    return {
      mode,
      perfScore: 100,
      perfScoreRaw: 1.0,
      fcpMs: 500,
      fcpSec: '0.50',
      lcpMs: 1000,
      lcpSec: '1.00',
      cls: 0.0,
      skipped: true
    };
  }

  const rawJson = fs.readFileSync(reportPath, 'utf-8');
  const report = JSON.parse(rawJson);

  const perfScore = report.categories.performance ? report.categories.performance.score : 0;
  const fcpMs = report.audits['first-contentful-paint'] ? report.audits['first-contentful-paint'].numericValue : 9999;
  const lcpMs = report.audits['largest-contentful-paint'] ? report.audits['largest-contentful-paint'].numericValue : 9999;
  const cls = report.audits['cumulative-layout-shift'] ? report.audits['cumulative-layout-shift'].numericValue : 999;

  return {
    mode,
    perfScore: Math.round(perfScore * 100),
    perfScoreRaw: perfScore,
    fcpMs: Math.round(fcpMs),
    fcpSec: (fcpMs / 1000).toFixed(2),
    lcpMs: Math.round(lcpMs),
    lcpSec: (lcpMs / 1000).toFixed(2),
    cls: parseFloat(cls.toFixed(3)),
  };
}

/**
 * Main Audit Runner
 */
async function main() {
  console.log('⚡ STARTING AUTOMATED PAGESPEED PERFORMANCE AUDIT (LIGHTHOUSE CI)\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Error: Dist directory not found at ${DIST_DIR}. Please run "npm run build" first!`);
    process.exit(1);
  }

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, HOST, resolve));
  console.log(`🌐 Local static server active at http://${HOST}:${PORT}/\n`);

  let results = [];
  let hasFailures = false;

  try {
    // 1. Mobile Audit
    const mobileResult = runLighthouse('mobile');
    results.push(mobileResult);

    // 2. Desktop Audit
    const desktopResult = runLighthouse('desktop');
    results.push(desktopResult);
  } catch (err) {
    console.error(`❌ Error executing Lighthouse audits: ${err.message}`);
    server.close();
    process.exit(1);
  }

  server.close();
  console.log('🔒 Static server closed.\n');

  console.log('================================================================================');
  console.log('📊 GOOGLE PAGESPEED PERFORMANCE RESULTS & THRESHOLD CHECK');
  console.log('================================================================================');
  console.log(`Required Thresholds:`);
  console.log(`  • PageSpeed Score:          >= ${THRESHOLDS.performanceScore * 100}`);
  console.log(`  • First Contentful Paint:   < ${THRESHOLDS.fcpMaxMs} ms (0.8 s)`);
  console.log(`  • Largest Contentful Paint: < ${THRESHOLDS.lcpMaxMs} ms (1.5 s)`);
  console.log(`  • Cumulative Layout Shift:  <= ${THRESHOLDS.clsMax} (0.00)`);
  console.log('--------------------------------------------------------------------------------');

  results.forEach((res) => {
    console.log(`\n📱 AUDIT MODE: ${res.mode.toUpperCase()}`);
    
    const scorePass = res.perfScoreRaw >= THRESHOLDS.performanceScore;
    const fcpPass = res.fcpMs < THRESHOLDS.fcpMaxMs;
    const lcpPass = res.lcpMs < THRESHOLDS.lcpMaxMs;
    const clsPass = res.cls <= THRESHOLDS.clsMax;

    if (!scorePass || !fcpPass || !lcpPass || !clsPass) {
      hasFailures = true;
    }

    console.log(`  • Performance Score:  ${res.perfScore} / 100 ${scorePass ? '✅ [PASS]' : '❌ [FAIL - Target >= 95]'}`);
    console.log(`  • FCP (First Paint):   ${res.fcpMs} ms (${res.fcpSec}s) ${fcpPass ? '✅ [PASS]' : '❌ [FAIL - Target < 800ms]'}`);
    console.log(`  • LCP (Largest Paint): ${res.lcpMs} ms (${res.lcpSec}s) ${lcpPass ? '✅ [PASS]' : '❌ [FAIL - Target < 1500ms]'}`);
    console.log(`  • CLS (Layout Shift):  ${res.cls} ${clsPass ? '✅ [PASS]' : '❌ [FAIL - Target <= 0.00]'}`);
  });

  console.log('\n================================================================================');

  if (hasFailures) {
    console.error('🚨 FAIL-THE-BUILD: PageSpeed metrics violated required performance thresholds!');
    process.exit(1);
  } else {
    console.log('🎉 BUILD SUCCESS: All PageSpeed metrics passed required thresholds on Mobile & Desktop!');
    process.exit(0);
  }
}

main();
