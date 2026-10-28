import { SYSTEMS, WORKSHOP_PREFIXES, WORKSHOP_SUFFIXES } from '#seed/names';
import { between, chance, cnpj, createRandom, isoBetween, pick } from '#seed/random';
import type {
  IntegrationLogEntity,
  PrvImportEntity,
  RatingImportEntity,
  RemunerationEntity,
  WorkshopSyncEntity,
} from './contracts';
import {
  HttpMethodEnum,
  LogDirectionEnum,
  PrvImportStatusEnum,
  RatingImportKindEnum,
  RatingImportStatusEnum,
  WorkshopSyncStatusEnum,
  WorkshopSyncTypeEnum,
} from './enums';

const GENERATION_SEED = 20261032;
const TOTAL_WORKSHOP_SYNCS = 150;
const TOTAL_RATING_IMPORTS = 30;
const TOTAL_PRV_IMPORTS = 24;
const TOTAL_REMUNERATIONS = 12;
const TOTAL_LOGS = 800;
const LOG_START = '2026-10-20T04:14:00.000Z';
const LOG_STEP_MS = 3 * 60 * 1000;
const INSURERS = ['Porto Seguro', 'Allianz', 'Tokio Marine', 'HDI'];
const CHANGED_BY = ['Regis Adriano', 'Camila Rocha', 'Rotina automática', 'Igor Costa', 'Fernanda Alves'];
const SYNC_ERRORS = [
  'CNPJ não encontrado no sistema de destino.',
  'Tempo de resposta excedido (timeout).',
  'Campo "telefone" inválido.',
  'Tabela de preços sem vigência.',
];

/** Datas do protótipo vêm sem segundos e sem fuso (`AAAA-MM-DDTHH:mm`), em UTC. */
const toIso = (value: string): string => `${value}:00.000Z`;
const toIsoOrNull = (value: string | null): string | null => (value ? toIso(value) : null);

// Sincronizações com oficinas do protótipo (tela antiga de integrações de oficinas).
const prototypeWorkshopSyncs: [
  string,
  string,
  WorkshopSyncTypeEnum,
  WorkshopSyncStatusEnum,
  string,
  string,
  string | null,
  string,
  string | null,
][] = [
  [
    '10012 Reparações',
    '36319197000173',
    WorkshopSyncTypeEnum.Registration,
    WorkshopSyncStatusEnum.Success,
    'Regis Adriano',
    '2026-10-20T09:12',
    '2026-10-20T09:12',
    'Cilia',
    null,
  ],
  [
    'Bahia Oficinas',
    '24674271000190',
    WorkshopSyncTypeEnum.Accreditation,
    WorkshopSyncStatusEnum.Error,
    'Rotina automática',
    '2026-10-20T08:40',
    '2026-10-20T08:40',
    'Audatex',
    'CNPJ não encontrado no sistema de destino.',
  ],
  [
    'Sincar Funilaria e Pintura',
    '36445060000165',
    WorkshopSyncTypeEnum.PriceTable,
    WorkshopSyncStatusEnum.Pending,
    'Camila Rocha',
    '2026-10-20T08:05',
    null,
    'Cilia',
    null,
  ],
  [
    'Box Car Reparos Automotivos',
    '23816504000157',
    WorkshopSyncTypeEnum.Registration,
    WorkshopSyncStatusEnum.Success,
    'Rotina automática',
    '2026-10-19T22:30',
    '2026-10-19T22:30',
    'SAP',
    null,
  ],
  [
    'Elite Funilaria e Pintura',
    '42593871000164',
    WorkshopSyncTypeEnum.PriceTable,
    WorkshopSyncStatusEnum.Error,
    'Rotina automática',
    '2026-10-19T22:30',
    '2026-10-19T22:31',
    'Cilia',
    'Tempo de resposta excedido (timeout).',
  ],
  [
    'Forte Car Oficina',
    '16985237000148',
    WorkshopSyncTypeEnum.Accreditation,
    WorkshopSyncStatusEnum.Success,
    'Regis Adriano',
    '2026-10-19T17:48',
    '2026-10-19T17:48',
    'Audatex',
    null,
  ],
  [
    'Garagem Auto Center',
    '53921640000108',
    WorkshopSyncTypeEnum.Registration,
    WorkshopSyncStatusEnum.Success,
    'Camila Rocha',
    '2026-10-19T15:20',
    '2026-10-19T15:21',
    'Cilia',
    null,
  ],
  [
    'Master Auto Service',
    '27148956000132',
    WorkshopSyncTypeEnum.Accreditation,
    WorkshopSyncStatusEnum.Pending,
    'Rotina automática',
    '2026-10-19T12:00',
    null,
    'SAP',
    null,
  ],
  [
    'Nova Era Funilaria e Pintura',
    '28614975000141',
    WorkshopSyncTypeEnum.Registration,
    WorkshopSyncStatusEnum.Error,
    'Regis Adriano',
    '2026-10-18T19:10',
    '2026-10-18T19:10',
    'SAP',
    'Campo "telefone" inválido.',
  ],
  [
    'Oficina Mecânica Horizonte',
    '42763851000126',
    WorkshopSyncTypeEnum.PriceTable,
    WorkshopSyncStatusEnum.Success,
    'Rotina automática',
    '2026-10-18T22:30',
    '2026-10-18T22:30',
    'Cilia',
    null,
  ],
  [
    'Prime Motors Oficina',
    '35609412000195',
    WorkshopSyncTypeEnum.Registration,
    WorkshopSyncStatusEnum.Success,
    'Camila Rocha',
    '2026-10-18T10:02',
    '2026-10-18T10:03',
    'Audatex',
    null,
  ],
  [
    'Speed Car Reparações',
    '19485327000174',
    WorkshopSyncTypeEnum.Accreditation,
    WorkshopSyncStatusEnum.Success,
    'Rotina automática',
    '2026-10-17T22:30',
    '2026-10-17T22:30',
    'Cilia',
    null,
  ],
  [
    'Centro Automotivo Diamante',
    '31274689000109',
    WorkshopSyncTypeEnum.PriceTable,
    WorkshopSyncStatusEnum.Error,
    'Rotina automática',
    '2026-10-17T22:30',
    '2026-10-17T22:32',
    'Audatex',
    'Tabela de preços sem vigência.',
  ],
  [
    'Auto Center Aliança',
    '12345678000121',
    WorkshopSyncTypeEnum.Registration,
    WorkshopSyncStatusEnum.Success,
    'Regis Adriano',
    '2026-10-16T14:44',
    '2026-10-16T14:44',
    'Cilia',
    null,
  ],
];

// Importações de NPS do protótipo.
const prototypeRatingImports: [
  string,
  number | null,
  number,
  RatingImportKindEnum,
  string,
  string,
  RatingImportStatusEnum,
  string | null,
][] = [
  [
    'teste.csv',
    null,
    0,
    RatingImportKindEnum.Workshop,
    '2023-11-21T16:18',
    '2023-11-21T16:18',
    RatingImportStatusEnum.Sent,
    null,
  ],
  [
    'NPS teste cilia - NPS teste cilia.csv',
    null,
    0,
    RatingImportKindEnum.Workshop,
    '2023-11-21T16:18',
    '2023-11-21T16:18',
    RatingImportStatusEnum.Sent,
    null,
  ],
  [
    'nps-oficinas-setembro.csv',
    248,
    248,
    RatingImportKindEnum.Workshop,
    '2026-10-02T09:30',
    '2026-10-02T09:41',
    RatingImportStatusEnum.Processed,
    null,
  ],
  [
    'nps-centros-setembro.csv',
    96,
    91,
    RatingImportKindEnum.AutoCenter,
    '2026-10-02T09:35',
    '2026-10-02T09:44',
    RatingImportStatusEnum.Processed,
    null,
  ],
  [
    'nps-oficinas-agosto.csv',
    0,
    0,
    RatingImportKindEnum.Workshop,
    '2026-09-01T10:00',
    '2026-09-01T10:01',
    RatingImportStatusEnum.Error,
    'Arquivo sem linhas de dados.',
  ],
];

// Arquivos PRV do protótipo (tela antiga de integrações PRV).
const prototypePrvImports: [string, string, PrvImportStatusEnum, string | null, string | null, string, string][] = [
  ['2026-06', 'prv-06-2026.zip', PrvImportStatusEnum.Sent, null, null, '2025-06-23T16:08', '2025-06-23T16:08'],
  ['2025-04', 'prv-04-2025.zip', PrvImportStatusEnum.Sent, null, null, '2025-03-31T10:57', '2025-03-31T10:57'],
  [
    '2025-03',
    'prv-03-2025.zip',
    PrvImportStatusEnum.ResultGenerated,
    null,
    'Resultado disponível para as oficinas.',
    '2025-03-07T10:10',
    '2025-03-07T10:12',
  ],
  ['1990-02', 'prv-02-1990.zip', PrvImportStatusEnum.Sent, null, null, '2024-08-30T14:12', '2024-08-30T14:12'],
  ['1990-01', 'prv-01-1990.zip', PrvImportStatusEnum.Sent, null, null, '2024-07-05T09:17', '2024-07-05T09:17'],
  ['1980-01', 'prv-01-1980.zip', PrvImportStatusEnum.Sent, null, null, '2024-04-08T11:28', '2024-04-08T11:28'],
  ['2019-04', 'prv-04-2019.zip', PrvImportStatusEnum.Sent, null, null, '2024-03-19T16:26', '2024-03-19T16:26'],
  ['2019-03', 'prv-03-2019.zip', PrvImportStatusEnum.Sent, null, null, '2024-03-19T16:21', '2024-03-19T16:21'],
  [
    '2019-02',
    'prv-02-2019.zip',
    PrvImportStatusEnum.ResultGenerated,
    null,
    null,
    '2024-03-18T09:33',
    '2024-03-19T16:20',
  ],
  [
    '2019-01',
    'prv-01-2019.zip',
    PrvImportStatusEnum.ResultGenerated,
    null,
    null,
    '2024-02-14T10:14',
    '2024-03-13T10:19',
  ],
];

// Remunerações de reguladoras do protótipo.
const prototypeRemunerations: [string, string, string, string][] = [
  ['2025-12', 'remuneracao-12-2025.csv', '2025-12-09T11:03', '2025-12-09T11:03'],
  ['2025-11', 'remuneracao-11-2025.csv', '2025-12-16T09:11', '2025-12-16T09:11'],
  ['2025-04', 'remuneracao-04-2025.csv', '2025-11-20T21:27', '2025-11-20T21:27'],
  ['2025-02', 'remuneracao-02-2025.csv', '2025-04-25T10:39', '2025-04-25T10:39'],
];

const LOG_ENDPOINTS: { integration: string; method: HttpMethodEnum; url: string; direction: LogDirectionEnum }[] = [
  {
    integration: 'Geolocalização',
    method: HttpMethodEnum.Get,
    url: 'https://sls-dev-whatsapp.cilia.com.br/dev/geolocation/search?radius=50',
    direction: LogDirectionEnum.Outbound,
  },
  {
    integration: 'WhatsApp',
    method: HttpMethodEnum.Post,
    url: 'https://sls-dev-whatsapp.cilia.com.br/dev/messages/send',
    direction: LogDirectionEnum.Outbound,
  },
  {
    integration: 'Sinistros',
    method: HttpMethodEnum.Post,
    url: 'https://api.gere.cilia.com.br/v1/claims',
    direction: LogDirectionEnum.Inbound,
  },
  {
    integration: 'Sinistros',
    method: HttpMethodEnum.Put,
    url: 'https://api.gere.cilia.com.br/v1/claims/status',
    direction: LogDirectionEnum.Inbound,
  },
  {
    integration: 'Vistoria',
    method: HttpMethodEnum.Get,
    url: 'https://api.gere.cilia.com.br/v1/inspections',
    direction: LogDirectionEnum.Inbound,
  },
];

const byIndex = <T>(values: readonly T[], index: number): T => {
  const value = values[index % values.length];
  if (value === undefined) throw new Error('byIndex: lista vazia.');
  return value;
};

const buildWorkshopSyncs = (): WorkshopSyncEntity[] => {
  const random = createRandom(GENERATION_SEED);
  const prototype = prototypeWorkshopSyncs.map(
    ([workshopName, workshopDocument, type, status, changedBy, changedAt, sentAt, system, error]) => ({
      workshopName,
      workshopDocument,
      type,
      status,
      changedBy,
      changedAt: toIso(changedAt),
      sentAt: toIsoOrNull(sentAt),
      system,
      error,
    }),
  );
  const generated = Array.from({ length: TOTAL_WORKSHOP_SYNCS - prototype.length }, () => {
    const roll = random();
    const status =
      roll < 0.1
        ? WorkshopSyncStatusEnum.Pending
        : roll < 0.85
          ? WorkshopSyncStatusEnum.Success
          : WorkshopSyncStatusEnum.Error;
    const changedAt = isoBetween(random, '2026-01-05T08:00:00.000Z', '2026-10-20T08:00:00.000Z');
    return {
      workshopName: `${pick(random, WORKSHOP_PREFIXES)} ${pick(random, WORKSHOP_SUFFIXES)}`,
      workshopDocument: cnpj(random),
      type: pick(random, Object.values(WorkshopSyncTypeEnum)),
      status,
      changedBy: pick(random, CHANGED_BY),
      changedAt,
      sentAt: status === WorkshopSyncStatusEnum.Pending ? null : changedAt,
      system: pick(random, SYSTEMS),
      error: status === WorkshopSyncStatusEnum.Error ? pick(random, SYNC_ERRORS) : null,
    };
  });
  return [...prototype, ...generated].map(
    (item, index): WorkshopSyncEntity => ({ id: `workshop-sync-${index + 1}`, ...item }),
  );
};

const buildRatingImports = (): RatingImportEntity[] => {
  const random = createRandom(GENERATION_SEED + 1);
  const prototype = prototypeRatingImports.map(
    ([fileName, total, processed, kind, sentAt, updatedAt, status, error]) => ({
      fileName,
      total,
      processed,
      kind,
      sentAt: toIso(sentAt),
      updatedAt: toIso(updatedAt),
      status,
      error,
    }),
  );
  const generated = Array.from({ length: TOTAL_RATING_IMPORTS - prototype.length }, () => {
    const kind = pick(random, Object.values(RatingImportKindEnum));
    const total = between(random, 20, 400);
    const status = pick(random, [
      RatingImportStatusEnum.Processed,
      RatingImportStatusEnum.Processed,
      RatingImportStatusEnum.Sent,
      RatingImportStatusEnum.Error,
    ]);
    const sentAt = isoBetween(random, '2026-01-05T08:00:00.000Z', '2026-10-18T08:00:00.000Z');
    return {
      fileName: `nps-${kind === RatingImportKindEnum.Workshop ? 'oficinas' : 'centros'}-${between(random, 1, 999)}.csv`,
      total: status === RatingImportStatusEnum.Error ? 0 : total,
      processed: status === RatingImportStatusEnum.Processed ? total : 0,
      kind,
      sentAt,
      updatedAt: sentAt,
      status,
      error: status === RatingImportStatusEnum.Error ? 'Arquivo sem linhas de dados.' : null,
    };
  });
  return [...prototype, ...generated].map(
    (item, index): RatingImportEntity => ({ id: `rating-import-${index + 1}`, ...item }),
  );
};

const buildPrvImports = (): PrvImportEntity[] => {
  const random = createRandom(GENERATION_SEED + 2);
  const prototype = prototypePrvImports.map(([referenceMonth, fileName, status, error, info, sentAt, updatedAt]) => ({
    referenceMonth,
    fileName,
    status,
    error,
    info,
    sentAt: toIso(sentAt),
    updatedAt: toIso(updatedAt),
  }));
  const generated = Array.from({ length: TOTAL_PRV_IMPORTS - prototype.length }, () => {
    const year = between(random, 2024, 2026);
    const month = String(between(random, 1, 12)).padStart(2, '0');
    const referenceMonth = `${year}-${month}`;
    const sentAt = isoBetween(random, '2024-01-05T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
    return {
      referenceMonth,
      fileName: `prv-${month}-${year}.zip`,
      status: pick(random, Object.values(PrvImportStatusEnum)),
      error: null,
      info: null,
      sentAt,
      updatedAt: sentAt,
    };
  });
  return [...prototype, ...generated].map((item, index): PrvImportEntity => ({ id: `prv-${index + 1}`, ...item }));
};

const buildRemunerations = (): RemunerationEntity[] => {
  const random = createRandom(GENERATION_SEED + 3);
  const prototype = prototypeRemunerations.map(([referenceMonth, fileName, sentAt, updatedAt]) => ({
    referenceMonth,
    fileName,
    sentAt: toIso(sentAt),
    updatedAt: toIso(updatedAt),
  }));
  const usedMonths = new Set(prototype.map((item) => item.referenceMonth));
  const generated: Omit<RemunerationEntity, 'id'>[] = [];
  let year = 2024;
  let month = 1;
  while (generated.length < TOTAL_REMUNERATIONS - prototype.length) {
    const referenceMonth = `${year}-${String(month).padStart(2, '0')}`;
    if (!usedMonths.has(referenceMonth) && chance(random, 0.9)) {
      const sentAt = isoBetween(random, `${referenceMonth}-05T08:00:00.000Z`, `${referenceMonth}-25T18:00:00.000Z`);
      generated.push({
        referenceMonth,
        fileName: `remuneracao-${referenceMonth.slice(5)}-${year}.csv`,
        sentAt,
        updatedAt: sentAt,
      });
    }
    month = month === 12 ? 1 : month + 1;
    year = month === 1 ? year + 1 : year;
  }
  return [...prototype, ...generated].map((item, index) => ({ id: `remuneration-${index + 1}`, ...item }));
};

const buildLogs = (): IntegrationLogEntity[] => {
  const start = Date.parse(LOG_START);
  return Array.from({ length: TOTAL_LOGS }, (_, index): IntegrationLogEntity => {
    const endpoint = index < 10 ? byIndex(LOG_ENDPOINTS, 0) : byIndex(LOG_ENDPOINTS, index);
    const isInbound = endpoint.direction === LogDirectionEnum.Inbound;
    let statusCode = endpoint.method === HttpMethodEnum.Post ? 201 : 200;
    if (index % 11 === 7) statusCode = 404;
    if (index % 13 === 5) statusCode = 400;
    if (index % 17 === 13) statusCode = 500;
    return {
      id: `log-${index + 1}`,
      insurer: isInbound ? byIndex(INSURERS, index) : null,
      direction: endpoint.direction,
      date: new Date(start - index * LOG_STEP_MS).toISOString(),
      ip: isInbound ? `200.155.10.${10 + (index % 40)}` : null,
      method: endpoint.method,
      url: endpoint.url,
      statusCode,
      integration: endpoint.integration,
    };
  });
};

/** Sincronizações, importações, remunerações e logs. Protótipo primeiro, depois dados gerados. */
export const buildIntegrationsSeed = () => ({
  workshopSyncs: buildWorkshopSyncs(),
  ratingImports: buildRatingImports(),
  prvImports: buildPrvImports(),
  remunerations: buildRemunerations(),
  logs: buildLogs(),
});
