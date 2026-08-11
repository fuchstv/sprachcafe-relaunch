import { cleanGutenbergContent, normalizeLanguageCode, replaceContentImageUrls } from './wp_migration.js';

function runTests() {
  console.log('🧪 Running Migration Unit Tests...\n');

  // Test 1: Gutenberg HTML comment cleanup
  const sampleGutenbergHtml = `
<!-- wp:paragraph -->
<p>Willkommen im SprachCafé Polnisch e.V. in Berlin-Pankow!</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":142,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://sprachcafe-polnisch.org/wp-content/uploads/2024/05/logo.png" alt="Logo"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":2} -->
<h2>Unser Sprach- und Kulturprogramm</h2>
<!-- /wp:heading -->
`;

  const { cleanedHtml, removedCommentsCount } = cleanGutenbergContent(sampleGutenbergHtml);

  console.log(`Test 1: Gutenberg Cleanup - Removed ${removedCommentsCount} block comments.`);
  if (removedCommentsCount === 6 && !cleanedHtml.includes('<!-- wp:')) {
    console.log('  ✓ PASSED: All Gutenberg comments stripped cleanly.');
  } else {
    console.error('  ❌ FAILED Gutenberg cleanup:', cleanedHtml);
    process.exit(1);
  }

  // Test 2: Language Code Normalization
  console.log('\nTest 2: Polylang / WPML Language Code Normalization');
  const de = normalizeLanguageCode('de_DE', '/de/ueber-uns');
  const pl = normalizeLanguageCode('pl_PL', '/pl/o-nas');
  const en = normalizeLanguageCode(undefined, '/en/about-us');

  if (de === 'de' && pl === 'pl' && en === 'en') {
    console.log('  ✓ PASSED: Language normalization mapped correctly (de, pl, en).');
  } else {
    console.error('  ❌ FAILED Language normalization:', { de, pl, en });
    process.exit(1);
  }

  // Test 3: Inline Image URL Replacement
  console.log('\nTest 3: Inline Image URL Replacement (Strato -> S3)');
  const urlMap = new Map<string, string>([
    ['https://sprachcafe-polnisch.org/wp-content/uploads/2024/05/logo.png', 'https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/uploads/wp-migration/2026/08/logo.png']
  ]);

  const updatedHtml = replaceContentImageUrls(cleanedHtml, urlMap);

  if (updatedHtml.includes('sprachcafe-media-storage.s3.eu-central-1.amazonaws.com')) {
    console.log('  ✓ PASSED: Strato image URL successfully replaced with AWS S3 CDN URL.');
  } else {
    console.error('  ❌ FAILED Image replacement:', updatedHtml);
    process.exit(1);
  }

  console.log('\n🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!');
}

runTests();
