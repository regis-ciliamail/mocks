import { describe, expect, it } from 'vitest';
import { csvEnumSchema, csvStringsSchema, paginate, pagingQuerySchema } from '#shared/paging';
import { PermissionEnum } from '#domains/registrations/enums';

describe('paginate', () => {
  it('should return the requested page and the total of matches', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual({ items: [3, 4], total: 5 });
  });

  it('should return an empty page past the end', () => {
    expect(paginate([1, 2], 10, 5)).toEqual({ items: [], total: 2 });
  });
});

describe('query schemas', () => {
  it('should apply default offset and limit', () => {
    expect(pagingQuerySchema.parse({})).toEqual({ offset: 0, limit: 20 });
  });

  it('should reject a page size above 200', () => {
    expect(pagingQuerySchema.safeParse({ limit: 500 }).success).toBe(false);
  });

  it('should split comma-separated strings and drop empty items', () => {
    expect(csvStringsSchema.parse('GO, SP,,')).toEqual(['GO', 'SP']);
    expect(csvStringsSchema.parse('')).toBeUndefined();
  });

  it('should validate comma-separated enum values', () => {
    const schema = csvEnumSchema(PermissionEnum);
    expect(schema.parse('dashboard,map')).toEqual(['dashboard', 'map']);
    expect(schema.safeParse('dashboard,unknown').success).toBe(false);
  });
});
