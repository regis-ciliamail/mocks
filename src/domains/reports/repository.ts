import { isWithinDateRange } from '#shared/dates';
import { matchesList } from '#shared/filters';
import { paginate, type PagedResult } from '#shared/paging';
import { comparePtBr, matchesSearch, toCityKey, toMonthKey } from '#shared/text';
import type {
  MonthlyStatus,
  WorkshopCredit,
  WorkshopCreditQuery,
  WorkshopStatusCityOption,
  WorkshopStatusEntry,
  WorkshopStatusQuery,
} from './contracts';

export type ReportsSeed = {
  statusEntries: WorkshopStatusEntry[];
  credits: WorkshopCredit[];
};

/** Série mensal: por mês da última mudança, quantas oficinas entraram e saíram da rede. */
export const toMonthlyStatus = (entries: readonly WorkshopStatusEntry[]): MonthlyStatus[] => {
  const months = new Map<string, MonthlyStatus>();
  entries.forEach((entry) => {
    const month = toMonthKey(entry.changedAt);
    const current = months.get(month) ?? { month, referenced: 0, unreferenced: 0 };
    months.set(month, {
      ...current,
      referenced: current.referenced + (entry.isReferenced ? 1 : 0),
      unreferenced: current.unreferenced + (entry.isReferenced ? 0 : 1),
    });
  });
  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
};

export class ReportsRepository {
  private readonly statusEntries: WorkshopStatusEntry[];

  private readonly credits: WorkshopCredit[];

  constructor(seed: ReportsSeed) {
    this.statusEntries = seed.statusEntries.map((entry) => ({ ...entry }));
    this.credits = seed.credits.map((credit) => ({ ...credit }));
  }

  workshopStatus(query: WorkshopStatusQuery) {
    const filtered = this.statusEntries
      .filter((entry) => matchesSearch(query.search, [entry.name, entry.legalName], [entry.document]))
      .filter((entry) => matchesList(query.states, entry.state)
        && matchesList(query.cities, toCityKey(entry.city, entry.state))
        && (query.isReferenced === undefined || entry.isReferenced === query.isReferenced)
        && isWithinDateRange(entry.changedAt, { from: query.periodFrom, to: query.periodTo }))
      // Ordem por nome, como na tela antiga.
      .sort((a, b) => comparePtBr(a.name, b.name));
    const page: PagedResult<WorkshopStatusEntry> = paginate(filtered.map((entry) => ({ ...entry })), query.offset, query.limit);
    return { ...page, monthly: toMonthlyStatus(filtered) };
  }

  workshopStatusCityOptions(): WorkshopStatusCityOption[] {
    const unique = new Map<string, WorkshopStatusCityOption>();
    this.statusEntries.forEach((entry) => unique.set(toCityKey(entry.city, entry.state), { city: entry.city, state: entry.state }));
    return [...unique.values()].sort((a, b) => comparePtBr(a.city, b.city));
  }

  workshopCredits(query: WorkshopCreditQuery) {
    // Contratações mais recentes primeiro.
    const filtered = this.credits
      .filter((credit) => matchesSearch(query.search, [credit.name, credit.legalName], [credit.document]))
      .filter((credit) => isWithinDateRange(credit.contractedAt, { from: query.contractedFrom, to: query.contractedTo }))
      .sort((a, b) => b.contractedAt.localeCompare(a.contractedAt));
    return {
      ...paginate(filtered.map((credit) => ({ ...credit })), query.offset, query.limit),
      totalAmount: filtered.reduce((sum, credit) => sum + credit.amount, 0),
    };
  }
}
