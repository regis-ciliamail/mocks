import { z } from 'zod/v4';
import { csvEnumSchema, csvStringsSchema, pagedSchema, pagingQuerySchema } from '#shared/paging';
import {
  HttpMethodEnum,
  LogDirectionEnum,
  LogStatusGroupEnum,
  PrvImportStatusEnum,
  RatingImportKindEnum,
  RatingImportStatusEnum,
  WorkshopSyncStatusEnum,
  WorkshopSyncTypeEnum,
} from './enums';

const referenceMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use o formato AAAA-MM.');

export const workshopSyncSchema = z
  .object({
    id: z.string(),
    workshopName: z.string(),
    workshopDocument: z.string().length(14),
    type: z.enum(WorkshopSyncTypeEnum),
    status: z.enum(WorkshopSyncStatusEnum),
    changedBy: z.string(),
    changedAt: z.iso.datetime(),
    sentAt: z.iso.datetime().nullable(),
    system: z.string().describe('Sistema de destino da sincronização.'),
    error: z.string().nullable(),
  })
  .meta({ id: 'WorkshopSync' });

export const ratingImportSchema = z
  .object({
    id: z.string(),
    fileName: z.string(),
    total: z.number().int().min(0).nullable(),
    processed: z.number().int().min(0),
    kind: z.enum(RatingImportKindEnum),
    sentAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    status: z.enum(RatingImportStatusEnum),
    error: z.string().nullable(),
  })
  .meta({ id: 'RatingImport' });

export const prvImportSchema = z
  .object({
    id: z.string(),
    referenceMonth: referenceMonthSchema.describe('Mês de referência no formato AAAA-MM.'),
    fileName: z.string(),
    status: z.enum(PrvImportStatusEnum),
    error: z.string().nullable(),
    info: z.string().nullable(),
    sentAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'PrvImport' });

export const remunerationSchema = z
  .object({
    id: z.string(),
    referenceMonth: referenceMonthSchema,
    fileName: z.string(),
    sentAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'Remuneration' });

export const remunerationSettingsSchema = z
  .object({
    amountPerRegulation: z.number().min(0).describe('Valor pago por regulação, em reais.'),
    onTimeBonusPercent: z.number().min(0).max(100).describe('Bônus, em %, para regulações feitas no prazo.'),
    onTimeDays: z.number().int().min(0).describe('Prazo, em dias, para ganhar o bônus.'),
  })
  .meta({ id: 'RemunerationSettings' });

export const integrationLogSchema = z
  .object({
    id: z.string(),
    insurer: z.string().nullable().describe('Seguradora da requisição (só nas recebidas).'),
    direction: z.enum(LogDirectionEnum),
    date: z.iso.datetime(),
    ip: z.string().nullable(),
    method: z.enum(HttpMethodEnum),
    url: z.string(),
    statusCode: z.number().int(),
    integration: z.string(),
  })
  .meta({ id: 'IntegrationLog' });

export const integrationLogFilterOptionsSchema = z.object({
  insurers: z.array(z.string()),
  integrations: z.array(z.string()),
});

const periodQuery = {
  periodFrom: z.iso.date().optional(),
  periodTo: z.iso.date().optional(),
};

export const workshopSyncsQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional().describe('Nome ou CNPJ da oficina.'),
  types: csvEnumSchema(WorkshopSyncTypeEnum),
  statuses: csvEnumSchema(WorkshopSyncStatusEnum),
  ...periodQuery,
});

export const ratingImportsQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional().describe('Nome do arquivo.'),
  statuses: csvEnumSchema(RatingImportStatusEnum),
  kinds: csvEnumSchema(RatingImportKindEnum),
});

export const prvImportsQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional().describe('Mês (AAAA-MM ou MM/AAAA) ou nome do arquivo.'),
});

export const integrationLogsQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional().describe('Trecho da URL.'),
  insurers: csvStringsSchema,
  statuses: csvEnumSchema(LogStatusGroupEnum),
  directions: csvEnumSchema(LogDirectionEnum),
  methods: csvEnumSchema(HttpMethodEnum),
  integrations: csvStringsSchema,
  ...periodQuery,
});

export const workshopSyncsReprocessSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Selecione ao menos uma sincronização.'),
});

export const ratingImportCreateSchema = z.object({
  fileName: z.string().trim().min(1),
  kind: z.enum(RatingImportKindEnum),
  total: z.number().int().min(0),
});

export const monthlyFileCreateSchema = z.object({
  referenceMonth: referenceMonthSchema,
  fileName: z.string().trim().min(1),
});

export const remunerationParamsSchema = z.object({
  referenceMonth: referenceMonthSchema,
});

export const remunerationUploadSchema = z.object({
  fileName: z.string().trim().min(1),
});

export const remunerationSettingsUpdateSchema = remunerationSettingsSchema;

export const workshopSyncsPageSchema = pagedSchema(workshopSyncSchema);
export const ratingImportsPageSchema = pagedSchema(ratingImportSchema);
export const prvImportsPageSchema = pagedSchema(prvImportSchema);
export const remunerationsPageSchema = pagedSchema(remunerationSchema);
export const integrationLogsPageSchema = pagedSchema(integrationLogSchema);

export type WorkshopSyncEntity = z.infer<typeof workshopSyncSchema>;
export type RatingImportEntity = z.infer<typeof ratingImportSchema>;
export type PrvImportEntity = z.infer<typeof prvImportSchema>;
export type RemunerationEntity = z.infer<typeof remunerationSchema>;
export type RemunerationSettings = z.infer<typeof remunerationSettingsSchema>;
export type IntegrationLogEntity = z.infer<typeof integrationLogSchema>;
export type IntegrationLogFilterOptions = z.infer<typeof integrationLogFilterOptionsSchema>;
export type WorkshopSyncsQuery = z.output<typeof workshopSyncsQuerySchema>;
export type RatingImportsQuery = z.output<typeof ratingImportsQuerySchema>;
export type PrvImportsQuery = z.output<typeof prvImportsQuerySchema>;
export type IntegrationLogsQuery = z.output<typeof integrationLogsQuerySchema>;
export type RatingImportCreateInput = z.output<typeof ratingImportCreateSchema>;
export type MonthlyFileCreateInput = z.output<typeof monthlyFileCreateSchema>;
export type RemunerationSettingsInput = z.output<typeof remunerationSettingsUpdateSchema>;
