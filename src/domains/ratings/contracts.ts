import { z } from 'zod/v4';
import { csvEnumSchema, pagedSchema, pagingQuerySchema } from '#shared/paging';
import { SortOrderEnum } from '#shared/sort';
import { onlyDigits } from '#shared/text';
import { RatingChannelEnum, RatingSortFieldEnum, RatingStatusEnum, RatingTargetKindEnum } from './enums';

export const ratingAnswerSchema = z.object({
  score: z.number().int().min(0).max(10).describe('Nota de recomendação, de 0 a 10.'),
  stars: z.number().int().min(1).max(5).describe('Estrelas, de 1 a 5.'),
  comment: z.string(),
  channel: z.enum(RatingChannelEnum),
});

export const ratingRequestSchema = z.object({
  id: z.string(),
  targetKind: z.enum(RatingTargetKindEnum),
  providerName: z.string(),
  providerDocument: z.string().length(14),
  customerName: z.string(),
  customerCode: z.string(),
  status: z.enum(RatingStatusEnum),
  channels: z.array(z.enum(RatingChannelEnum)),
  sentAt: z.iso.datetime().nullable(),
  viewedAt: z.iso.datetime().nullable(),
  answer: ratingAnswerSchema.nullable(),
}).meta({ id: 'RatingRequest' });

export const ratingSummarySchema = z.object({
  total: z.number().int(),
  pending: z.number().int(),
  sent: z.number().int(),
  responded: z.number().int(),
  error: z.number().int(),
});

export const ratingRequestsQuerySchema = pagingQuerySchema.extend({
  targetKind: z.enum(RatingTargetKindEnum).describe('Tipo do alvo da pesquisa.'),
  search: z.string().optional().describe('Nome do prestador, do cliente ou código da pesquisa.'),
  statuses: csvEnumSchema(RatingStatusEnum),
  channels: csvEnumSchema(RatingChannelEnum),
  sentFrom: z.iso.date().optional(),
  sentTo: z.iso.date().optional(),
  sortField: z.enum(RatingSortFieldEnum).optional(),
  sortOrder: z.enum(SortOrderEnum).default(SortOrderEnum.Desc),
});

export type RatingRequestsQuery = z.output<typeof ratingRequestsQuerySchema>;

export const ratingRequestsPageSchema = pagedSchema(ratingRequestSchema).extend({
  summary: ratingSummarySchema,
});

export const ratingRequestCreateSchema = z.object({
  targetKind: z.enum(RatingTargetKindEnum),
  providerName: z.string().trim().min(1),
  providerDocument: z
    .string()
    .transform(onlyDigits)
    .pipe(z.string().length(14, 'O CNPJ deve ter 14 dígitos.')),
  customerName: z.string().trim().min(1),
  customerCode: z.string().trim().min(1),
  channels: z.array(z.enum(RatingChannelEnum)).min(1, 'Escolha ao menos um canal de envio.'),
});

export const ratingProviderOptionsQuerySchema = z.object({
  targetKind: z.enum(RatingTargetKindEnum),
});

export const ratingProviderOptionSchema = z.object({
  name: z.string(),
  document: z.string().length(14),
});

export type RatingRequestEntity = z.infer<typeof ratingRequestSchema>;
export type RatingRequestCreateInput = z.output<typeof ratingRequestCreateSchema>;
export type RatingAnswer = z.infer<typeof ratingAnswerSchema>;
export type RatingSummary = z.infer<typeof ratingSummarySchema>;
export type RatingProviderOption = z.infer<typeof ratingProviderOptionSchema>;
