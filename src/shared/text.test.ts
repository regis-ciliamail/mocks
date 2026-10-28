import { describe, expect, it } from 'vitest';
import { comparePtBr, matchesSearch, normalizeSearchText, onlyDigits, toCityKey, toMonthKey } from '#shared/text';

describe('text utils', () => {
  it('should normalize search text without accents and case', () => {
    expect(normalizeSearchText('  Goiânia  ')).toBe('goiania');
  });

  it('should keep only digits', () => {
    expect(onlyDigits('12.345.678/0001-21')).toBe('12345678000121');
  });

  it('should build city keys with the state suffix', () => {
    expect(toCityKey('Goiânia', 'GO')).toBe('Goiânia-GO');
  });

  it('should extract the month from an ISO date', () => {
    expect(toMonthKey('2026-10-19T17:20:00.000Z')).toBe('2026-10');
  });

  it('should sort names in pt-BR ignoring case', () => {
    expect(['b', 'A', 'c'].sort(comparePtBr)).toEqual(['A', 'b', 'c']);
  });

  describe('matchesSearch', () => {
    it('should match any empty search', () => {
      expect(matchesSearch(undefined, ['Oficina'])).toBe(true);
      expect(matchesSearch('   ', ['Oficina'])).toBe(true);
    });

    it('should match text ignoring accents and case', () => {
      expect(matchesSearch('goiania', ['Auto Center Goiânia'])).toBe(true);
    });

    it('should match a numeric term against documents, ignoring punctuation', () => {
      expect(matchesSearch('12.345.678', ['Oficina X'], ['12345678000121'])).toBe(true);
    });

    it('should not treat a term with letters as a document search', () => {
      expect(matchesSearch('rota 66', ['Oficina X'], ['66000000000000'])).toBe(false);
    });
  });
});
