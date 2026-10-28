import { describe, expect, it } from 'vitest';
import { IntegrationsRepository, formatReferenceMonth, getLogStatusGroup } from './repository';
import { integrationLogsQuerySchema, workshopSyncsQuerySchema } from './contracts';
import { buildIntegrationsSeed } from './seed';
import { LogStatusGroupEnum, WorkshopSyncStatusEnum } from './enums';

const FIXED_NOW = new Date('2026-10-28T12:00:00.000Z');
const createRepository = () => new IntegrationsRepository(buildIntegrationsSeed(), () => FIXED_NOW);

describe('integrations helpers', () => {
  it('should group HTTP status codes into success, client and server errors', () => {
    expect(getLogStatusGroup(201)).toBe(LogStatusGroupEnum.Success);
    expect(getLogStatusGroup(404)).toBe(LogStatusGroupEnum.ClientError);
    expect(getLogStatusGroup(500)).toBe(LogStatusGroupEnum.ServerError);
  });

  it('should show the reference month as MM/AAAA', () => {
    expect(formatReferenceMonth('2026-06')).toBe('06/2026');
  });
});

describe('IntegrationsRepository', () => {
  it('should filter workshop syncs by status and return them newest first', () => {
    const page = createRepository().listWorkshopSyncs(
      workshopSyncsQuerySchema.parse({
        statuses: 'error',
        limit: 200,
      }),
    );
    expect(page.items.every((sync) => sync.status === WorkshopSyncStatusEnum.Error)).toBe(true);
    page.items.slice(1).forEach((sync, index) => {
      expect(sync.changedAt <= (page.items[index]?.changedAt ?? '')).toBe(true);
    });
  });

  it('should send reprocessed syncs back to pending', () => {
    const repository = createRepository();
    const [first] = repository.listWorkshopSyncs(workshopSyncsQuerySchema.parse({ statuses: 'error', limit: 1 })).items;
    const reprocessed = repository.reprocessWorkshopSyncs([first?.id ?? ''], 'Tester');
    expect(reprocessed).toHaveLength(1);
    expect(reprocessed[0]?.status).toBe(WorkshopSyncStatusEnum.Pending);
    expect(reprocessed[0]?.error).toBeNull();
    expect(reprocessed[0]?.changedBy).toBe('Tester');
  });

  it('should keep the remuneration settings updated', () => {
    const repository = createRepository();
    repository.updateRemunerationSettings({ amountPerRegulation: 200, onTimeBonusPercent: 15, onTimeDays: 7 });
    expect(repository.getRemunerationSettings()).toEqual({
      amountPerRegulation: 200,
      onTimeBonusPercent: 15,
      onTimeDays: 7,
    });
  });

  it('should replace the remuneration file of a month instead of duplicating it', () => {
    const repository = createRepository();
    const before = repository.listRemunerations().total;
    repository.saveRemuneration({ referenceMonth: '2025-12', fileName: 'novo.csv' });
    expect(repository.listRemunerations().total).toBe(before);
  });

  it('should filter logs by status group', () => {
    const page = createRepository().listLogs(
      integrationLogsQuerySchema.parse({ statuses: 'server_error', limit: 200 }),
    );
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((log) => getLogStatusGroup(log.statusCode) === LogStatusGroupEnum.ServerError)).toBe(true);
  });

  it('should list the insurers present in the logs, sorted by name', () => {
    const options = createRepository().logFilterOptions();
    expect(options.insurers).toEqual(['Allianz', 'HDI', 'Porto Seguro', 'Tokio Marine']);
  });
});
