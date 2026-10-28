import { describe, expect, it } from 'vitest';
import { isWithinDateRange } from '#shared/dates';

describe('isWithinDateRange', () => {
  it('should accept any date without a range', () => {
    expect(isWithinDateRange('2026-10-19T17:20:00.000Z')).toBe(true);
  });

  it('should include the whole day on both ends', () => {
    const range = { from: '2026-10-01', to: '2026-10-31' };
    expect(isWithinDateRange('2026-10-01T00:00:00.000Z', range)).toBe(true);
    expect(isWithinDateRange('2026-10-31T23:59:59.999Z', range)).toBe(true);
  });

  it('should reject dates outside the range', () => {
    const range = { from: '2026-10-01', to: '2026-10-31' };
    expect(isWithinDateRange('2026-09-30T23:59:59.999Z', range)).toBe(false);
    expect(isWithinDateRange('2026-11-01T00:00:00.000Z', range)).toBe(false);
  });

  it('should accept an open range with only one end', () => {
    expect(isWithinDateRange('2026-10-15T10:00:00.000Z', { from: '2026-10-15' })).toBe(true);
    expect(isWithinDateRange('2026-10-14T10:00:00.000Z', { to: '2026-10-14' })).toBe(true);
  });
});
