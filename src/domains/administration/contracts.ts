import { z } from 'zod/v4';
import { pagedSchema, pagingQuerySchema } from '#shared/paging';
import { onlyDigits } from '#shared/text';
import { CatalogKindEnum, OccurrenceSeverityEnum, PrvCalculationEnum, PrvRuleTypeEnum } from './enums';

export const catalogItemSchema = z.object({
  id: z.string(),
  kind: z.enum(CatalogKindEnum),
  name: z.string(),
  code: z.string(),
  isActive: z.boolean(),
  document: z.string().describe('CNPJ só com dígitos. Vazio fora do cadastro de filiais.'),
  severity: z.enum(OccurrenceSeverityEnum).nullable().describe('Gravidade. Só nos motivos de ocorrência.'),
}).meta({ id: 'CatalogItem' });

export const catalogItemFormSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim(),
  isActive: z.boolean(),
  document: z
    .string()
    .transform(onlyDigits)
    .pipe(z.string().regex(/^(\d{14})?$/, 'O CNPJ deve ter 14 dígitos.')),
  severity: z.enum(OccurrenceSeverityEnum).nullable(),
});

export const catalogItemActiveSchema = z.object({
  isActive: z.boolean(),
});

export const catalogParamsSchema = z.object({
  kind: z.enum(CatalogKindEnum),
});

export const catalogItemParamsSchema = z.object({
  kind: z.enum(CatalogKindEnum),
  id: z.string().min(1),
});

export const gsreCitySchema = z.object({
  id: z.string(),
  name: z.string().describe('Nome da cidade em maiúsculas, sem acento.'),
  code: z.string().describe('Código IBGE da cidade (ou código interno, quando não há).'),
  state: z.string().describe('Estado em maiúsculas, sem acento (ex.: SAO PAULO).'),
}).meta({ id: 'GsreCity' });

export const gsreCityFormSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  state: z.string().trim().min(1),
});

export const prvRangeSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0).nullable().describe('`null` na faixa aberta ("daí para cima").'),
  value: z.number().min(0),
});

export const prvRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(PrvRuleTypeEnum),
  calculation: z.enum(PrvCalculationEnum),
  ranges: z.array(prvRangeSchema),
}).meta({ id: 'PrvRule' });

export const prvRuleFormSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(PrvRuleTypeEnum),
  calculation: z.enum(PrvCalculationEnum),
});

export const prvRangesFormSchema = z.object({
  ranges: z.array(prvRangeSchema).min(1, 'Informe ao menos uma faixa.'),
});

export const administrationQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional(),
});

export const catalogItemsPageSchema = pagedSchema(catalogItemSchema);
export const gsreCitiesPageSchema = pagedSchema(gsreCitySchema);
export const prvRulesPageSchema = pagedSchema(prvRuleSchema);

export type CatalogItemEntity = z.infer<typeof catalogItemSchema>;
export type CatalogItemFormInput = z.output<typeof catalogItemFormSchema>;
export type GsreCityEntity = z.infer<typeof gsreCitySchema>;
export type GsreCityFormInput = z.output<typeof gsreCityFormSchema>;
export type PrvRange = z.infer<typeof prvRangeSchema>;
export type PrvRuleEntity = z.infer<typeof prvRuleSchema>;
export type PrvRuleFormInput = z.output<typeof prvRuleFormSchema>;
export type AdministrationQuery = z.output<typeof administrationQuerySchema>;
