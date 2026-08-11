import { validateIsbn } from './sync_hausbibliothek_catalog.js';

function runLibrarySyncTests() {
  console.log('🧪 Running Hausbibliothek Catalog Sync Unit Tests...\n');

  // Test 1: Valid ISBN-13
  const res13 = validateIsbn('978-3-455-00228-7');
  console.log('Test 1: Valid ISBN-13 (978-3-455-00228-7)');
  if (res13.status === 'valid' && res13.type === 'ISBN-13') {
    console.log('  ✓ PASSED: Validated ISBN-13 correctly.');
  } else {
    console.error('  ❌ FAILED ISBN-13 validation:', res13);
    process.exit(1);
  }

  // Test 2: Valid ISBN-10
  const res10 = validateIsbn('0-306-40615-2');
  console.log('\nTest 2: Valid ISBN-10 (0-306-40615-2)');
  if (res10.status === 'valid' && res10.type === 'ISBN-10') {
    console.log('  ✓ PASSED: Validated ISBN-10 correctly.');
  } else {
    console.error('  ❌ FAILED ISBN-10 validation:', res10);
    process.exit(1);
  }

  // Test 3: Missing ISBN
  const resMissing = validateIsbn('');
  console.log('\nTest 3: Missing ISBN');
  if (resMissing.status === 'missing') {
    console.log('  ✓ PASSED: Flagged missing ISBN correctly.');
  } else {
    console.error('  ❌ FAILED Missing ISBN test:', resMissing);
    process.exit(1);
  }

  // Test 4: Unplausible ISBN
  const resInvalid = validateIsbn('1234567890123');
  console.log('\nTest 4: Unplausible Checksum ISBN');
  if (resInvalid.status === 'unplausible') {
    console.log('  ✓ PASSED: Flagged unplausible ISBN checksum correctly.');
  } else {
    console.error('  ❌ FAILED Unplausible ISBN test:', resInvalid);
    process.exit(1);
  }

  console.log('\n🎉 ALL LIBRARY SYNC UNIT TESTS PASSED SUCCESSFULLY!');
}

runLibrarySyncTests();
