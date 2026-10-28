import { isWithinDateRange } from '#shared/dates';
import { matchesList } from '#shared/filters';
import { paginate, type PagedResult } from '#shared/paging';
import { normalizeSearchText, onlyDigits } from '#shared/text';
import {
  type IntegrationLogEntity,
  type IntegrationLogFilterOptions,
  type IntegrationLogsQuery,
  type MonthlyFileCreateInput,
  type PrvImportEntity,
  type PrvImportsQuery,
  type RatingImportCreateInput,
  type RatingImportEntity,
  type RatingImportsQuery,
  type RemunerationEntity,
  type RemunerationSettings,
  type WorkshopSyncEntity,
  type WorkshopSyncsQuery,
} from './contracts';
import { LogStatusGroupEnum, PrvImportStatusEnum, RatingImportStatusEnum, WorkshopSyncStatusEnum } from './enums';

export const DEFAULT_REMUNERATION_SETTINGS: RemunerationSettings = {
  amountPerRegulation: 150,
  onTimeBonusPercent: 10,
  onTimeDays: 5,
};

/** Faixa do status HTTP: 2xx e 3xx são sucesso, 4xx erro do cliente, 5xx erro do servidor. */
export const getLogStatusGroup = (statusCode: number): LogStatusGroupEnum => {
  if (statusCode >= 500) return LogStatusGroupEnum.ServerError;
  if (statusCode >= 400) return LogStatusGroupEnum.ClientError;
  return LogStatusGroupEnum.Success;
};

/** `2026-06` → `06/2026`, como na coluna "Mês" do sistema antigo. */
export const formatReferenceMonth = (referenceMonth: string): string => {
  const [year, month] = referenceMonth.split('-');
  return year && month ? `${month}/${year}` : referenceMonth;
};

const matchesText = (term: string, ...texts: string[]): boolean =>
  texts.some((text) => normalizeSearchText(text).includes(term));

const byDateDesc =
  <T>(dateOf: (item: T) => string) =>
  (a: T, b: T): number =>
    dateOf(b).localeCompare(dateOf(a));

const copy = <T extends object>(item: T): T => ({ ...item });

export class IntegrationsRepository {
  private readonly workshopSyncs: WorkshopSyncEntity[];

  private readonly ratingImports: RatingImportEntity[];

  private readonly prvImports: PrvImportEntity[];

  private readonly remunerations: RemunerationEntity[];

  private readonly logs: IntegrationLogEntity[];

  private remunerationSettings: RemunerationSettings = { ...DEFAULT_REMUNERATION_SETTINGS };

  private nextId = 1;

  constructor(
    seed: {
      workshopSyncs: readonly WorkshopSyncEntity[];
      ratingImports: readonly RatingImportEntity[];
      prvImports: readonly PrvImportEntity[];
      remunerations: readonly RemunerationEntity[];
      logs: readonly IntegrationLogEntity[];
    },
    private readonly now: () => Date = () => new Date(),
  ) {
    this.workshopSyncs = seed.workshopSyncs.map(copy);
    this.ratingImports = seed.ratingImports.map(copy);
    this.prvImports = seed.prvImports.map(copy);
    this.remunerations = seed.remunerations.map(copy);
    this.logs = seed.logs.map(copy);
  }

  listWorkshopSyncs(query: WorkshopSyncsQuery): PagedResult<WorkshopSyncEntity> {
    const digits = /\p{L}/u.test(query.search ?? '') ? '' : onlyDigits(query.search ?? '');
    const term = normalizeSearchText(query.search);
    const period = { from: query.periodFrom, to: query.periodTo };
    const items = this.workshopSyncs
      .filter(
        (sync) =>
          !term ||
          matchesText(term, sync.workshopName) ||
          (digits.length > 0 && sync.workshopDocument.includes(digits)),
      )
      .filter((sync) => matchesList(query.types, sync.type) && matchesList(query.statuses, sync.status))
      .filter((sync) => isWithinDateRange(sync.changedAt, period))
      .sort(byDateDesc((sync) => sync.changedAt));
    return paginate(items.map(copy), query.offset, query.limit);
  }

  reprocessWorkshopSyncs(ids: readonly string[], changedBy: string): WorkshopSyncEntity[] {
    const timestamp = this.now().toISOString();
    return this.workshopSyncs
      .filter((sync) => ids.includes(sync.id))
      .map((sync) => {
        Object.assign(sync, {
          status: WorkshopSyncStatusEnum.Pending,
          error: null,
          changedBy,
          changedAt: timestamp,
          sentAt: timestamp,
        });
        return copy(sync);
      });
  }

  listRatingImports(query: RatingImportsQuery): PagedResult<RatingImportEntity> {
    const term = normalizeSearchText(query.search);
    const items = this.ratingImports
      .filter((item) => !term || matchesText(term, item.fileName))
      .filter((item) => matchesList(query.statuses, item.status) && matchesList(query.kinds, item.kind))
      .sort(byDateDesc((item) => item.sentAt));
    return paginate(items.map(copy), query.offset, query.limit);
  }

  createRatingImport(input: RatingImportCreateInput): RatingImportEntity {
    const timestamp = this.now().toISOString();
    const item: RatingImportEntity = {
      id: this.createId('rating-import'),
      fileName: input.fileName,
      total: input.total,
      processed: 0,
      kind: input.kind,
      sentAt: timestamp,
      updatedAt: timestamp,
      status: RatingImportStatusEnum.Sent,
      error: null,
    };
    this.ratingImports.push(item);
    return copy(item);
  }

  listPrvImports(query: PrvImportsQuery): PagedResult<PrvImportEntity> {
    const term = normalizeSearchText(query.search);
    const items = this.prvImports
      .filter((item) => !term || matchesText(term, formatReferenceMonth(item.referenceMonth), item.fileName))
      .sort(byDateDesc((item) => item.sentAt));
    return paginate(items.map(copy), query.offset, query.limit);
  }

  createPrvImport(input: MonthlyFileCreateInput): PrvImportEntity {
    const timestamp = this.now().toISOString();
    const item: PrvImportEntity = {
      id: this.createId('prv'),
      referenceMonth: input.referenceMonth,
      fileName: input.fileName,
      status: PrvImportStatusEnum.Sent,
      error: null,
      info: null,
      sentAt: timestamp,
      updatedAt: timestamp,
    };
    this.prvImports.push(item);
    return copy(item);
  }

  /** Lista curta (um item por mês): sem paginação, como no sistema antigo. */
  listRemunerations(): PagedResult<RemunerationEntity> {
    const items = [...this.remunerations].sort((a, b) => b.referenceMonth.localeCompare(a.referenceMonth));
    return { items: items.map(copy), total: items.length };
  }

  /** Um arquivo por mês: enviar de novo para o mesmo mês substitui o anterior. */
  saveRemuneration(input: MonthlyFileCreateInput): RemunerationEntity {
    const timestamp = this.now().toISOString();
    const existing = this.remunerations.find((item) => item.referenceMonth === input.referenceMonth);
    if (existing) {
      Object.assign(existing, { fileName: input.fileName, updatedAt: timestamp });
      return copy(existing);
    }
    const item: RemunerationEntity = {
      id: this.createId('remuneration'),
      referenceMonth: input.referenceMonth,
      fileName: input.fileName,
      sentAt: timestamp,
      updatedAt: timestamp,
    };
    this.remunerations.push(item);
    return copy(item);
  }

  getRemunerationSettings(): RemunerationSettings {
    return { ...this.remunerationSettings };
  }

  updateRemunerationSettings(settings: RemunerationSettings): RemunerationSettings {
    this.remunerationSettings = { ...settings };
    return this.getRemunerationSettings();
  }

  listLogs(query: IntegrationLogsQuery): PagedResult<IntegrationLogEntity> {
    const term = normalizeSearchText(query.search);
    const period = { from: query.periodFrom, to: query.periodTo };
    const items = this.logs
      .filter((log) => !term || matchesText(term, log.url))
      .filter((log) => !query.insurers?.length || (log.insurer !== null && query.insurers.includes(log.insurer)))
      .filter((log) => !query.statuses?.length || query.statuses.includes(getLogStatusGroup(log.statusCode)))
      .filter((log) => matchesList(query.directions, log.direction) && matchesList(query.methods, log.method))
      .filter((log) => matchesList(query.integrations, log.integration))
      .filter((log) => isWithinDateRange(log.date, period));
    return paginate(items.map(copy), query.offset, query.limit);
  }

  logFilterOptions(): IntegrationLogFilterOptions {
    const unique = (values: (string | null)[]): string[] =>
      [...new Set(values)]
        .filter((value): value is string => value !== null)
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    return {
      insurers: unique(this.logs.map((log) => log.insurer)),
      integrations: unique(this.logs.map((log) => log.integration)),
    };
  }

  private createId(prefix: string): string {
    const id = `${prefix}-new-${this.nextId}`;
    this.nextId += 1;
    return id;
  }
}
