import { z } from 'zod/v4';
import { booleanQuerySchema, csvStringsSchema, pagedSchema, pagingQuerySchema } from '#shared/paging';

export const workshopStatusEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  legalName: z.string(),
  document: z.string().length(14).describe('CNPJ só com dígitos.'),
  city: z.string(),
  state: z.string().length(2),
  isReferenced: z.boolean(),
  changedAt: z.iso.datetime().describe('Data da última mudança de situação na rede.'),
}).meta({ id: 'WorkshopStatusEntry' });

export const monthlyStatusSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).describe('Mês no formato AAAA-MM.'),
  referenced: z.number().int().min(0),
  unreferenced: z.number().int().min(0),
});

export const workshopStatusReportSchema = pagedSchema(workshopStatusEntrySchema).extend({
  monthly: z.array(monthlyStatusSchema),
});

export const workshopStatusCityOptionSchema = z.object({
  city: z.string(),
  state: z.string().length(2),
});

export const workshopStatusQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional().describe('Nome, razão social ou CNPJ.'),
  states: csvStringsSchema,
  cities: csvStringsSchema.describe('Cidades no formato `Cidade-UF`, separadas por vírgula.'),
  isReferenced: booleanQuerySchema,
  periodFrom: z.iso.date().optional(),
  periodTo: z.iso.date().optional(),
});

export const workshopCreditSchema = z.object({
  id: z.string(),
  name: z.string(),
  legalName: z.string(),
  document: z.string().length(14),
  amount: z.number().min(0).describe('Valor do crédito contratado, em reais.'),
  contractedAt: z.iso.datetime(),
  lastInstallmentAt: z.iso.datetime(),
  hasPowerOfAttorney: z.boolean().describe('Possui procuração.'),
}).meta({ id: 'WorkshopCredit' });

export const workshopCreditReportSchema = pagedSchema(workshopCreditSchema).extend({
  totalAmount: z.number().min(0).describe('Soma dos créditos que casam com a busca (não só da página).'),
});

export const workshopCreditQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional(),
  contractedFrom: z.iso.date().optional(),
  contractedTo: z.iso.date().optional(),
});

export type WorkshopStatusEntry = z.infer<typeof workshopStatusEntrySchema>;
export type WorkshopCredit = z.infer<typeof workshopCreditSchema>;
export type WorkshopStatusQuery = z.output<typeof workshopStatusQuerySchema>;
export type WorkshopCreditQuery = z.output<typeof workshopCreditQuerySchema>;
export type WorkshopStatusCityOption = z.infer<typeof workshopStatusCityOptionSchema>;
export type MonthlyStatus = z.infer<typeof monthlyStatusSchema>;
