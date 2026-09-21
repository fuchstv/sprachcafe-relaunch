import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripHtml } from './utils';

test('stripHtml strips HTML tags', () => {
  assert.equal(stripHtml('<p>Hello <strong>World</strong></p>'), 'Hello World');
});

test('stripHtml decodes HTML entities', () => {
  assert.equal(
    stripHtml('Tom&nbsp;&amp;&nbsp;Jerry&#039;s &quot;Fun&quot;'),
    'Tom & Jerry\'s "Fun"'
  );
});

test('stripHtml collapses whitespace and trims', () => {
  assert.equal(
    stripHtml('  <div>  Line 1  </div> \n <div>  Line 2  </div>  '),
    'Line 1 Line 2'
  );
});

test('stripHtml handles empty or null/falsy inputs', () => {
  assert.equal(stripHtml(''), '');
  // @ts-expect-error testing falsy handling
  assert.equal(stripHtml(null), '');
  // @ts-expect-error testing falsy handling
  assert.equal(stripHtml(undefined), '');
});
