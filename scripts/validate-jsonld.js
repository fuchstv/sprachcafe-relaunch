#!/usr/bin/env node
/**
 * Schema.org JSON-LD Validation Script
 * SprachCafé Relaunch Monorepo
 *
 * Purpose:
 * Scans generated HTML output in `frontend/dist/` to extract and validate
 * JSON-LD structured data blocks against Schema.org specs for:
 * - Event (@type: Event)
 * - BlogPosting (@type: BlogPosting)
 * - Book (@type: Book)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIST_DIR = path.resolve(__dirname, '../frontend/dist');
const DIST_DIR = fs.existsSync(path.join(RAW_DIST_DIR, 'client'))
  ? path.join(RAW_DIST_DIR, 'client')
  : RAW_DIST_DIR;

/**
 * Recursively find all .html files in directory
 * @param {string} dir
 * @returns {string[]}
 */
function findHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });

  return results;
}

/**
 * Validate a single JSON-LD block
 * @param {any} schema
 * @param {string} filePath
 */
function validateJsonLd(schema, filePath) {
  const relPath = path.relative(DIST_DIR, filePath);
  const result = {
    filePath: relPath,
    type: schema['@type'] || 'Unknown',
    isValid: true,
    errors: [],
    warnings: [],
    schemaData: schema,
  };

  // 1. Context validation
  if (!schema['@context'] || !schema['@context'].includes('schema.org')) {
    result.errors.push('Missing or invalid @context (must be "https://schema.org")');
  }

  // 2. Type-specific validations
  const schemaType = schema['@type'];

  if (schemaType === 'Event') {
    if (!schema.name) result.errors.push('Event schema missing required property "name"');
    if (!schema.startDate) result.errors.push('Event schema missing required property "startDate"');
    if (!schema.location) {
      result.errors.push('Event schema missing required property "location"');
    } else if (typeof schema.location === 'object' && !schema.location['@type']) {
      result.errors.push('Event location missing "@type" (expected "Place")');
    }
    if (!schema.organizer) result.warnings.push('Event schema missing recommended property "organizer"');
  } else if (schemaType === 'BlogPosting' || schemaType === 'Article') {
    if (!schema.headline) result.errors.push('BlogPosting schema missing required property "headline"');
    if (!schema.author) result.errors.push('BlogPosting schema missing required property "author"');
    if (!schema.publisher) result.warnings.push('BlogPosting schema missing recommended property "publisher"');
    if (!schema.datePublished) result.warnings.push('BlogPosting schema missing recommended property "datePublished"');
  } else if (schemaType === 'Book') {
    if (!schema.name) result.errors.push('Book schema missing required property "name"');
    if (!schema.author) result.errors.push('Book schema missing required property "author"');
    if (!schema.offers) {
      result.warnings.push('Book schema missing recommended property "offers"');
    } else if (schema.offers['@type'] !== 'Offer') {
      result.errors.push('Book offers "@type" must be "Offer"');
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Main Schema Validator Runner
 */
function runValidator() {
  console.log('🔍 Starting Schema.org JSON-LD Structured Data Validation...');
  console.log(`Scanning HTML files in ${DIST_DIR}...\n`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Error: Dist directory does not exist at ${DIST_DIR}. Please run "npm run build" first!`);
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(DIST_DIR);
  console.log(`Found ${htmlFiles.length} HTML files to inspect.`);

  const validationResults = [];
  let totalSchemasFound = 0;

  htmlFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    // Match script tags with application/ld+json
    const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = scriptRegex.exec(content)) !== null) {
      totalSchemasFound++;
      try {
        const jsonText = match[1].trim();
        const parsed = JSON.parse(jsonText);
        const res = validateJsonLd(parsed, file);
        validationResults.push(res);
      } catch (err) {
        const relPath = path.relative(DIST_DIR, file);
        validationResults.push({
          filePath: relPath,
          type: 'Invalid JSON',
          isValid: false,
          errors: [`JSON Syntax Error: ${err.message}`],
          warnings: [],
          schemaData: null,
        });
      }
    }
  });

  console.log('================================================================================');
  console.log('📊 SCHEMA.ORG JSON-LD VALIDATION SUMMARY');
  console.log('================================================================================');
  console.log(`Total HTML files scanned:  ${htmlFiles.length}`);
  console.log(`Total JSON-LD schemas:     ${totalSchemasFound}`);

  const validCount = validationResults.filter((r) => r.isValid).length;
  const invalidCount = validationResults.filter((r) => !r.isValid).length;

  console.log(`Valid Schemas:             ${validCount}`);
  console.log(`Invalid Schemas:           ${invalidCount}`);
  console.log('================================================================================\n');

  // Breakdown by Type
  const typeBreakdown = {};
  validationResults.forEach((r) => {
    if (!typeBreakdown[r.type]) {
      typeBreakdown[r.type] = { total: 0, valid: 0, invalid: 0 };
    }
    typeBreakdown[r.type].total++;
    if (r.isValid) typeBreakdown[r.type].valid++;
    else typeBreakdown[r.type].invalid++;
  });

  console.log('📋 SCHEMAS BREAKDOWN BY TYPE:');
  for (const [type, stats] of Object.entries(typeBreakdown)) {
    console.log(`  • ${type.padEnd(15)} Total: ${stats.total} | Valid: ${stats.valid} | Invalid: ${stats.invalid}`);
  }

  if (invalidCount > 0) {
    console.log('\n❌ VALIDATION ERRORS FOUND:');
    validationResults
      .filter((r) => !r.isValid)
      .forEach((r, idx) => {
        console.log(`  [${idx + 1}] File: ${r.filePath} (${r.type})`);
        r.errors.forEach((e) => console.log(`      - ERROR: ${e}`));
      });
    console.log('\n❌ Schema validation failed!');
    process.exit(1);
  } else {
    console.log('\n✨ All JSON-LD structured data blocks passed Schema.org validation clean!');
    process.exit(0);
  }
}

runValidator();
