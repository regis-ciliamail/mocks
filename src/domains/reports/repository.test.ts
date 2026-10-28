import { describe, expect, it } from 'vitest';
import { ReportsRepository, toMonthlyStatus } from './repository';
import { workshopCreditQuerySchema, workshopStatusQuerySchema, type WorkshopStatusEntry } from './contracts';
import { buildReportsSeed } from './seed';

const entry = (id: string, changedAt: string, isReferenced: boolean): WorkshopStatusEntry => ({
  id,
  name: id,
  legalName: id,
  document: '12345678000121',
  city: 'Goiânia',
  state: 'GO',
  isReferenced,
  changedAt,
});

describe('toMonthlyStatus', () => {
  it('should count referenced and unreferenced workshops per month of change, oldest first', () => {
    const monthly = toMonthlyStatus([
      entry('a', '2026-05-06T10:00:00.000Z', true),
      entry('b', '2026-05-20T10:00:00.000Z', false),
      entry('c', '2026-04-01T10:00:00.000Z', true),
    ]);
    expect(monthly).toEqual([
      { month: '2026-04', referenced: 1, unreferenced: 0 },
      { month: '2026-05', referenced: 1, unreferenced: 1 },
    ]);
  });
});

describe('ReportsRepository', () => {
  const repository = new ReportsRepository(buildReportsSeed());

  it('should return the monthly series over all matches, not only the page', () => {
    const report = repository.workshopStatus(workshopStatusQuerySchema.parse({ limit: 1 }));
    const total = report.monthly.reduce((sum, month) => sum + month.referenced + month.unreferenced, 0);
    expect(report.items).toHaveLength(1);
    expect(total).toBe(report.total);
  });

  it('should sum the credits that match the search, not only the page', () => {
    const credits = repository.workshopCredits(workshopCreditQuerySchema.parse({ search: 'Speed', limit: 1 }));
    expect(credits.items.length).toBeLessThanOrEqual(1);
    expect(credits.totalAmount).toBeGreaterThan(0);
  });
});
