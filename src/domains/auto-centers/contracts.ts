import { z } from 'zod/v4';
import { booleanQuerySchema, csvEnumSchema, csvStringsSchema, pagedSchema, pagingQuerySchema } from '#shared/paging';
import { SortOrderEnum } from '#shared/sort';
import { onlyDigits } from '#shared/text';
import { AutoCenterCategoryEnum, AutoCenterSortFieldEnum, AutoCenterStatusEnum } from './enums';

export const autoCenterSchema = z.object({
  id: z.string(),
  name: z.string(),
  legalName: z.string(),
  document: z.string().length(14).describe('CNPJ só com dígitos.'),
  phone: z.string(),
  city: z.string(),
  state: z.string().length(2),
  category: z.enum(AutoCenterCategoryEnum),
  rating: z.number().min(0).max(5).nullable().describe('Avaliação de 0 a 5; `null` quando ainda não há avaliações.'),
  acceptsTowing: z.boolean().describe('Aceita veículos trazidos por guincho.'),
  status: z.enum(AutoCenterStatusEnum),
  createdAt: z.iso.datetime(),
}).meta({ id: 'AutoCenter' });

export const autoCenterCityOptionSchema = z.object({
  city: z.string(),
  state: z.string().length(2),
});

export const autoCentersQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional().describe('Nome, razão social ou CNPJ.'),
  states: csvStringsSchema,
  cities: csvStringsSchema.describe('Cidades no formato `Cidade-UF`, separadas por vírgula.'),
  categories: csvEnumSchema(AutoCenterCategoryEnum),
  status: z.enum(AutoCenterStatusEnum).optional(),
  acceptsTowing: booleanQuerySchema,
  sortField: z.enum(AutoCenterSortFieldEnum).optional(),
  sortOrder: z.enum(SortOrderEnum).default(SortOrderEnum.Asc),
});

export type AutoCentersQuery = z.output<typeof autoCentersQuerySchema>;

const documentInputSchema = z
  .string()
  .transform(onlyDigits)
  .pipe(z.string().length(14, 'O CNPJ deve ter 14 dígitos.'));

export const autoCenterFormSchema = z.object({
  name: z.string().trim().min(1),
  legalName: z.string().trim().min(1),
  document: documentInputSchema,
  phone: z.string().transform(onlyDigits),
  city: z.string().trim().min(1),
  state: z.string().length(2),
  category: z.enum(AutoCenterCategoryEnum),
  acceptsTowing: z.boolean(),
  status: z.enum(AutoCenterStatusEnum),
});

export const autoCenterStatusSchema = z.object({
  status: z.enum(AutoCenterStatusEnum),
});

export const autoCentersPageSchema = pagedSchema(autoCenterSchema);

export type AutoCenterEntity = z.infer<typeof autoCenterSchema>;
export type AutoCenterCityOption = z.infer<typeof autoCenterCityOptionSchema>;
export type AutoCenterFormInput = z.output<typeof autoCenterFormSchema>;
