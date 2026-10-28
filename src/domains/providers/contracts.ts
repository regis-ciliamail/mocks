import { z } from 'zod/v4';
import { booleanQuerySchema, csvStringsSchema, pagedSchema, pagingQuerySchema } from '#shared/paging';
import { SortOrderEnum } from '#shared/sort';
import { onlyDigits } from '#shared/text';
import { ProviderKindEnum, ProviderSortFieldEnum, ProviderStatusEnum } from './enums';

export const providerSchema = z.object({
  id: z.string(),
  kind: z.enum(ProviderKindEnum),
  name: z.string().describe('Nome fantasia.'),
  legalName: z.string().describe('Razão social.'),
  document: z.string().length(14).describe('CNPJ só com dígitos.'),
  phone: z.string(),
  location: z.string().describe('Endereço em texto livre.'),
  city: z.string(),
  state: z.string().length(2),
  isOpen24h: z.boolean(),
  status: z.enum(ProviderStatusEnum),
  createdAt: z.iso.datetime(),
}).meta({ id: 'Provider' });

export const providerCityOptionSchema = z.object({
  city: z.string(),
  state: z.string().length(2),
});

export const providersQuerySchema = pagingQuerySchema.extend({
  kind: z.enum(ProviderKindEnum).describe('Tipo de prestador listado.'),
  search: z.string().optional().describe('Nome, razão social ou CNPJ.'),
  states: csvStringsSchema,
  cities: csvStringsSchema.describe('Cidades no formato `Cidade-UF`, separadas por vírgula.'),
  isOpen24h: booleanQuerySchema,
  status: z.enum(ProviderStatusEnum).optional(),
  sortField: z.enum(ProviderSortFieldEnum).optional(),
  sortOrder: z.enum(SortOrderEnum).default(SortOrderEnum.Asc),
});

export const providerCityOptionsQuerySchema = z.object({
  kind: z.enum(ProviderKindEnum),
});

export type ProvidersQuery = z.output<typeof providersQuerySchema>;

const documentInputSchema = z
  .string()
  .transform(onlyDigits)
  .pipe(z.string().length(14, 'O CNPJ deve ter 14 dígitos.'));

export const providerFormSchema = z.object({
  kind: z.enum(ProviderKindEnum),
  name: z.string().trim().min(1),
  legalName: z.string().trim().min(1),
  document: documentInputSchema,
  phone: z.string().transform(onlyDigits),
  location: z.string().trim(),
  city: z.string().trim().min(1),
  state: z.string().length(2),
  isOpen24h: z.boolean(),
  status: z.enum(ProviderStatusEnum),
});

export const providerStatusSchema = z.object({
  status: z.enum(ProviderStatusEnum),
});

export const providersPageSchema = pagedSchema(providerSchema);

export type ProviderEntity = z.infer<typeof providerSchema>;
export type ProviderCityOption = z.infer<typeof providerCityOptionSchema>;
export type ProviderFormInput = z.output<typeof providerFormSchema>;
