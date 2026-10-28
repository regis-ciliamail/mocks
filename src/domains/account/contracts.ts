import { z } from 'zod/v4';
import { pagedSchema, pagingQuerySchema } from '#shared/paging';
import { CiliaModuleKindEnum, FeatureKindEnum } from './enums';

export const ciliaModuleSchema = z.object({
  id: z.string(),
  kind: z.enum(CiliaModuleKindEnum),
  name: z.string(),
  shortName: z.string(),
}).meta({ id: 'CiliaModule' });

export const featureSchema = z.object({
  id: z.string(),
  kind: z.enum(FeatureKindEnum),
  name: z.string(),
}).meta({ id: 'Feature' });

export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  document: z.string().length(14),
  logoUrl: z.string().nullable(),
  modules: z.array(ciliaModuleSchema),
  features: z.array(featureSchema),
}).meta({ id: 'Company' });

export const companiesQuerySchema = pagingQuerySchema.extend({
  search: z.string().optional().describe('Nome ou CNPJ da empresa.'),
});

export const companiesPageSchema = pagedSchema(companySchema);

export type CiliaModuleEntity = z.infer<typeof ciliaModuleSchema>;
export type FeatureEntity = z.infer<typeof featureSchema>;
export type CompanyEntity = z.infer<typeof companySchema>;
export type CompaniesQuery = z.output<typeof companiesQuerySchema>;
