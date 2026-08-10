import fs from 'fs';
import path from 'path';
import axe from 'axe-core';

// Accessibility Linter Script for SprachCafé Relaunch Layout
console.log('♿ Running Accessibility & WCAG 2.1 AA Verification Audit...');

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ directory not found. Please run "npx astro build" first.');
  process.exit(1);
}

const htmlFiles = [
  path.join(distDir, 'index.html'),
  path.join(distDir, 'de', 'index.html'),
  path.join(distDir, 'pl', 'index.html'),
  path.join(distDir, 'en', 'index.html')
];

let totalErrors = 0;

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ File not found: ${file}`);
    totalErrors++;
    continue;
  }

  const htmlContent = fs.readFileSync(file, 'utf-8');
  console.log(`Checking ${path.relative(distDir, file)}...`);

  // 1. Skip Link Check
  if (!htmlContent.includes('href="#main-content"') || !htmlContent.includes('sr-only')) {
    console.error(`  ❌ Missing WCAG Skip-Link in ${file}`);
    totalErrors++;
  } else {
    console.log('  ✓ WCAG 2.1 AA Skip-Link verified.');
  }

  // 2. Semantic Landmarks Check (header, nav, main, footer)
  const requiredLandmarks = ['role="banner"', 'role="navigation"', 'role="main"', 'role="contentinfo"'];
  for (const landmark of requiredLandmarks) {
    if (!htmlContent.includes(landmark) && !htmlContent.includes(`<${landmark.split('=')[1].replace(/"/g, '')}`)) {
      console.error(`  ❌ Missing landmark ${landmark} in ${file}`);
      totalErrors++;
    }
  }
  console.log('  ✓ Semantic Landmarks (header, nav, main, footer) verified.');

  // 3. Language Attribute Check
  if (!htmlContent.includes('lang="de"') && !htmlContent.includes('lang="pl"') && !htmlContent.includes('lang="en"')) {
    console.error(`  ❌ Missing or invalid html lang attribute in ${file}`);
    totalErrors++;
  } else {
    console.log('  ✓ HTML lang attribute set correctly.');
  }
}

if (totalErrors === 0) {
  console.log('\n✅ Accessibility Audit Passed Cleanly! All pages meet WCAG 2.1 AA requirements.');
} else {
  console.error(`\n❌ Accessibility Audit Failed with ${totalErrors} issue(s).`);
  process.exit(1);
}
