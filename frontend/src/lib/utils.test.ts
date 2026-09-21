import { describe, it } from 'node:test';
import assert from 'node:assert';
import { stripHtml } from './utils';

describe('stripHtml utility', () => {
  it('returns empty string for falsy/empty input', () => {
    assert.strictEqual(stripHtml(''), '');
    assert.strictEqual(stripHtml(null as unknown as string), '');
    assert.strictEqual(stripHtml(undefined as unknown as string), '');
  });

  it('removes HTML tags', () => {
    assert.strictEqual(stripHtml('<p>Hello <strong>World</strong>!</p>'), 'Hello World !');
    assert.strictEqual(stripHtml('<div><span>Test</span></div>'), 'Test');
  });

  it('decodes common HTML entities', () => {
    assert.strictEqual(stripHtml('Tom&nbsp;&amp;&nbsp;Jerry'), 'Tom & Jerry');
    assert.strictEqual(stripHtml('&quot;Hello&#039;s World&quot;'), '"Hello\'s World"');
  });

  it('collapses multiple whitespace characters and trims', () => {
    assert.strictEqual(stripHtml('   <p>   Multiple   spaces   </p>   '), 'Multiple spaces');
  });
});
