import type { DashboardSummary } from './contracts';
import { DashboardIndicatorEnum, DashboardPeriodEnum } from './enums';

type PeriodConfig = {
  buckets: number;
  unit: 'week' | 'month';
  /** Quantas vezes o período é maior que 30 dias, para escalar os números "do período". */
  scale: number;
};

const PERIODS: Record<DashboardPeriodEnum, PeriodConfig> = {
  [DashboardPeriodEnum.Last30Days]: { buckets: 5, unit: 'week', scale: 1 },
  [DashboardPeriodEnum.Last90Days]: { buckets: 3, unit: 'month', scale: 3 },
  [DashboardPeriodEnum.Last12Months]: { buckets: 12, unit: 'month', scale: 12 },
};

/** Números da rede do sistema antigo, base do protótipo. */
const NETWORK = {
  registered: 4976,
  referenced: 515,
  supply: 444,
  independent: 3876,
  dealership: 781,
};

/** Série de referência (referenciadas, desreferenciadas), repetida em ciclo pelos intervalos. */
const STATUS_PATTERN: [number, number][] = [[3, 0], [19, 1], [6, 0], [2, 1], [8, 2], [4, 0], [11, 1], [3, 0], [7, 1], [5, 0], [9, 2], [6, 1]];

const startOfBucket = (reference: Date, unit: PeriodConfig['unit'], stepsBack: number): Date => {
  if (unit === 'month') return new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - stepsBack, 1));
  const day = Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate());
  // Semanas começam na segunda-feira.
  const weekday = (new Date(day).getUTCDay() + 6) % 7;
  return new Date(day - (weekday + stepsBack * 7) * 86400000);
};

const buildSeries = (config: PeriodConfig, reference: Date) => Array.from({ length: config.buckets }, (_, index) => {
  const stepsBack = config.buckets - 1 - index;
  const [referenced, unreferenced] = STATUS_PATTERN[index % STATUS_PATTERN.length] ?? [0, 0];
  const multiplier = config.unit === 'month' ? 4 : 1;
  return {
    startsAt: startOfBucket(reference, config.unit, stepsBack).toISOString(),
    referenced: referenced * multiplier,
    unreferenced: unreferenced * multiplier,
  };
});

export class DashboardRepository {
  constructor(private readonly now: () => Date = () => new Date()) {}

  summary(period: DashboardPeriodEnum): DashboardSummary {
    const config = PERIODS[period];
    const statusSeries = buildSeries(config, this.now());
    const newReferenced = statusSeries.reduce((sum, point) => sum + point.referenced, 0);
    const newUnreferenced = statusSeries.reduce((sum, point) => sum + point.unreferenced, 0);
    const growth = config.scale * 9;
    return {
      indicators: [
        { kind: DashboardIndicatorEnum.Registered, value: NETWORK.registered, previousValue: NETWORK.registered - growth },
        {
          kind: DashboardIndicatorEnum.Referenced,
          value: NETWORK.referenced,
          previousValue: NETWORK.referenced - Math.round((newReferenced - newUnreferenced) / 4),
        },
        { kind: DashboardIndicatorEnum.Supply, value: NETWORK.supply, previousValue: NETWORK.supply + config.scale * 2 },
        { kind: DashboardIndicatorEnum.Rating, value: 5, previousValue: 4.8 },
      ],
      averageRating: 5,
      nps: 100,
      statusSeries,
      workshopTypes: [
        { key: 'independent', value: NETWORK.independent },
        { key: 'dealership', value: NETWORK.dealership },
        { key: 'other', value: NETWORK.registered - NETWORK.independent - NETWORK.dealership },
      ],
      imageInspection: [
        { key: 'cilia', value: 45 },
        { key: 'audatex', value: 0 },
        { key: 'none', value: 10 },
      ],
      transmissions: [
        { key: 'normal', value: 18 * config.scale },
        { key: 'pass', value: 22 * config.scale },
        { key: 'subsidized', value: config.scale },
      ],
      situations: [
        { key: 'full', value: 1 },
        { key: 'blocked', value: 0 },
        { key: 'refund', value: 0 },
      ],
      zones: [
        { key: 'referencing', value: 4972 },
        { key: 'unreferencing', value: 4 },
        { key: 'laborAgreement', value: 3 },
        { key: 'certified', value: 0 },
      ],
    };
  }
}
