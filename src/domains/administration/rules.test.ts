import { describe, expect, it } from 'vitest';
import { PrvCalculationEnum } from './enums';
import { validatePrvRanges } from './rules';

const fixed = PrvCalculationEnum.FixedAmount;
const percentage = PrvCalculationEnum.Percentage;

describe('validatePrvRanges', () => {
  it('should accept contiguous ranges with an open last range', () => {
    const ranges = [
      { min: 0, max: 5000, value: 3 },
      { min: 5000, max: 20000, value: 2.5 },
      { min: 20000, max: null, value: 2 },
    ];
    expect(validatePrvRanges(ranges, percentage)).toBeNull();
  });

  it('should reject an empty list', () => {
    expect(validatePrvRanges([], fixed)).toBe('empty');
  });

  it('should reject negative values', () => {
    expect(validatePrvRanges([{ min: -1, max: 10, value: 1 }], fixed)).toBe('negative');
  });

  it('should reject percentages above 100', () => {
    expect(validatePrvRanges([{ min: 0, max: 10, value: 101 }], percentage)).toBe('percentageAbove100');
    expect(validatePrvRanges([{ min: 0, max: 10, value: 101 }], fixed)).toBeNull();
  });

  it('should reject a range whose minimum is not below its maximum', () => {
    expect(validatePrvRanges([{ min: 10, max: 10, value: 1 }], fixed)).toBe('minAboveMax');
  });

  it('should reject an open range that is not the last one', () => {
    const ranges = [
      { min: 0, max: null, value: 1 },
      { min: 10, max: 20, value: 2 },
    ];
    expect(validatePrvRanges(ranges, fixed)).toBe('openRangeNotLast');
  });

  it('should reject overlapping ranges', () => {
    const ranges = [
      { min: 0, max: 100, value: 1 },
      { min: 50, max: 200, value: 2 },
    ];
    expect(validatePrvRanges(ranges, fixed)).toBe('overlap');
  });
});
