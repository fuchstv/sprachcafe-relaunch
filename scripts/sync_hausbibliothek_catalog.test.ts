import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateIsbn } from './sync_hausbibliothek_catalog';

describe('validateIsbn', () => {
  describe('Missing or empty input', () => {
    it('returns missing status for undefined input', () => {
      assert.deepStrictEqual(validateIsbn(undefined), {
        status: 'missing',
        reason: 'ISBN ist leer oder nicht angegeben'
      });
    });

    it('returns missing status for empty string', () => {
      assert.deepStrictEqual(validateIsbn(''), {
        status: 'missing',
        reason: 'ISBN ist leer oder nicht angegeben'
      });
    });

    it('returns missing status for whitespace-only string', () => {
      assert.deepStrictEqual(validateIsbn('   \t\n '), {
        status: 'missing',
        reason: 'ISBN ist leer oder nicht angegeben'
      });
    });
  });

  describe('ISBN-13 validation', () => {
    it('validates correct ISBN-13 with prefix 978', () => {
      assert.deepStrictEqual(validateIsbn('978-3-16-148410-0'), {
        status: 'valid',
        type: 'ISBN-13'
      });
    });

    it('validates correct ISBN-13 with prefix 979', () => {
      assert.deepStrictEqual(validateIsbn('979-10-90636-07-1'), {
        status: 'valid',
        type: 'ISBN-13'
      });
    });

    it('validates correct ISBN-13 with dots and spaces', () => {
      assert.deepStrictEqual(validateIsbn('978.3 16.148410 0'), {
        status: 'valid',
        type: 'ISBN-13'
      });
    });

    it('rejects 13-digit number not starting with 978 or 979', () => {
      assert.deepStrictEqual(validateIsbn('1234567890123'), {
        status: 'unplausible',
        type: 'ISBN-13',
        reason: 'ISBN-13 muss mit 978 oder 979 beginnen'
      });
    });

    it('rejects ISBN-13 with invalid check digit', () => {
      assert.deepStrictEqual(validateIsbn('978-3-16-148410-5'), {
        status: 'unplausible',
        type: 'ISBN-13',
        reason: 'Ungültige Prüfziffer (Erwartet: 0, Ist: 5)'
      });
    });
  });

  describe('ISBN-10 validation', () => {
    it('validates correct ISBN-10 ending with a digit', () => {
      assert.deepStrictEqual(validateIsbn('0-306-40615-2'), {
        status: 'valid',
        type: 'ISBN-10'
      });
    });

    it('validates correct ISBN-10 ending with uppercase X', () => {
      assert.deepStrictEqual(validateIsbn('3-16-148410-X'), {
        status: 'valid',
        type: 'ISBN-10'
      });
    });

    it('validates correct ISBN-10 ending with lowercase x', () => {
      assert.deepStrictEqual(validateIsbn('3-16-148410-x'), {
        status: 'valid',
        type: 'ISBN-10'
      });
    });

    it('rejects ISBN-10 with invalid check digit', () => {
      assert.deepStrictEqual(validateIsbn('0-306-40615-3'), {
        status: 'unplausible',
        type: 'ISBN-10',
        reason: 'Ungültige ISBN-10 Prüfziffer (Modulo 11 Fehlschlag)'
      });
    });
  });

  describe('Invalid format and length', () => {
    it('rejects ISBN with invalid length', () => {
      assert.deepStrictEqual(validateIsbn('12345'), {
        status: 'unplausible',
        reason: 'Unzulässige Zeichen oder Länge (5 Zeichen statt 10 oder 13)'
      });
    });

    it('rejects ISBN with non-numeric characters in body', () => {
      assert.deepStrictEqual(validateIsbn('ABCDEFGHIJ'), {
        status: 'unplausible',
        reason: 'Unzulässige Zeichen oder Länge (10 Zeichen statt 10 oder 13)'
      });
    });

    it('rejects ISBN-10 with X in non-terminal position', () => {
      assert.deepStrictEqual(validateIsbn('3-16-X48410-0'), {
        status: 'unplausible',
        reason: 'Unzulässige Zeichen oder Länge (10 Zeichen statt 10 oder 13)'
      });
    });
  });
});
