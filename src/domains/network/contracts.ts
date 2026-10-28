import { z } from 'zod/v4';
import { booleanQuerySchema, csvEnumSchema, csvStringsSchema, pagedSchema, pagingQuerySchema } from '#shared/paging';
import { SortOrderEnum } from '#shared/sort';
import { onlyDigits } from '#shared/text';
import {
  BudgetingSystemEnum,
  OccupationLevelEnum,
  ServiceProviderKindEnum,
  ServiceProviderSortFieldEnum,
  ServiceProviderStatusEnum,
  SpecialProgramEnum,
  WorkshopTypeEnum,
} from './enums';

export const serviceProviderLocationSchema = z.object({
  country: z.string().length(2).describe('País no padrão ISO 3166-1 alfa-2.'),
  city: z.string(),
  state: z.string().length(2).describe('UF com duas letras.'),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

export const serviceProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  document: z.string().length(14).describe('CNPJ só com dígitos.'),
  phone: z.string().describe('Telefone com DDI e DDD, só com dígitos.'),
  kind: z.enum(ServiceProviderKindEnum),
  status: z.enum(ServiceProviderStatusEnum),
  location: serviceProviderLocationSchema,
  isReferenced: z.boolean().describe('Faz parte da rede referenciada da empresa.'),
  rating: z.number().min(0).max(5),
  currentScore: z.number().int(),
  totalScore: z.number().int(),
  workshopTypes: z.array(z.enum(WorkshopTypeEnum)),
  occupation: z.enum(OccupationLevelEnum),
  budgetingSystem: z.enum(BudgetingSystemEnum),
  specialProgram: z.enum(SpecialProgramEnum).nullable(),
  hasImageInspection: z.boolean(),
  hasSupply: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).meta({ id: 'ServiceProvider' });

export const serviceProviderCityOptionSchema = z.object({
  city: z.string(),
  state: z.string().length(2),
});

export const serviceProvidersQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional().describe('Nome ou CNPJ, com ou sem pontuação.'),
  kind: z.enum(ServiceProviderKindEnum).optional(),
  countries: csvStringsSchema,
  states: csvStringsSchema,
  cities: csvStringsSchema.describe('Cidades no formato `Cidade-UF`, separadas por vírgula.'),
  createdFrom: z.iso.date().optional(),
  createdTo: z.iso.date().optional(),
  updatedFrom: z.iso.date().optional(),
  updatedTo: z.iso.date().optional(),
  workshopTypes: csvEnumSchema(WorkshopTypeEnum),
  occupations: csvEnumSchema(OccupationLevelEnum),
  budgetingSystem: z.enum(BudgetingSystemEnum).optional(),
  specialProgram: z.enum(SpecialProgramEnum).optional(),
  status: z.enum(ServiceProviderStatusEnum).optional(),
  hasImageInspection: booleanQuerySchema,
  hasSupply: booleanQuerySchema,
  isReferenced: booleanQuerySchema,
  sortField: z.enum(ServiceProviderSortFieldEnum).optional(),
  sortOrder: z.enum(SortOrderEnum).default(SortOrderEnum.Asc),
});

export type ServiceProvidersQuery = z.output<typeof serviceProvidersQuerySchema>;

const documentInputSchema = z
  .string()
  .transform(onlyDigits)
  .pipe(z.string().length(14, 'O CNPJ deve ter 14 dígitos.'));

const phoneInputSchema = z
  .string()
  .transform(onlyDigits)
  .pipe(z.string().regex(/^\d{10,13}$/, 'Telefone inválido.'));

/** Corpo do cadastro e da edição. Documento e telefone chegam formatados e saem só com dígitos. */
export const serviceProviderFormSchema = z.object({
  name: z.string().trim().min(1),
  document: documentInputSchema,
  phone: phoneInputSchema,
  country: z.string().length(2),
  state: z.string().length(2),
  city: z.string().trim().min(1),
  isReferenced: z.boolean(),
  rating: z.number().min(0).max(5),
  workshopTypes: z.array(z.enum(WorkshopTypeEnum)),
  occupation: z.enum(OccupationLevelEnum),
  budgetingSystem: z.enum(BudgetingSystemEnum),
  specialProgram: z.enum(SpecialProgramEnum).nullable(),
  hasImageInspection: z.boolean(),
  hasSupply: z.boolean(),
  status: z.enum(ServiceProviderStatusEnum),
});

export type ServiceProviderFormInput = z.output<typeof serviceProviderFormSchema>;

export const serviceProviderStatusSchema = z.object({
  status: z.enum(ServiceProviderStatusEnum),
});

export const serviceProvidersPageSchema = pagedSchema(serviceProviderSchema);

export type ServiceProviderEntity = z.infer<typeof serviceProviderSchema>;
export type ServiceProviderCityOption = z.infer<typeof serviceProviderCityOptionSchema>;
