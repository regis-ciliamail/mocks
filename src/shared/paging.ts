import { z } from 'zod/v4';

/** Resposta paginada: `items` é a página pedida; `total` conta todos os registros que casam com a busca. */
export type PagedResult<T> = {
  items: T[];
  total: number;
};

export const paginate = <T>(items: readonly T[], offset: number, limit: number): PagedResult<T> => ({
  items: items.slice(offset, offset + limit),
  total: items.length,
});

export const pagingQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0).describe('Quantidade de registros a pular.'),
  limit: z.coerce.number().int().min(1).max(200).default(20).describe('Tamanho da página (1 a 200).'),
});

export const pagedSchema = <T extends z.ZodType>(item: T) => z.object({
  items: z.array(item),
  total: z.number().int().min(0),
});

/** Lista em CSV na query string: `states=GO,SP`. Vazio vira `undefined`. */
const parseCsv = (value: string | undefined): string[] | undefined => {
  const items = value?.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
  return items && items.length > 0 ? items : undefined;
};

export const csvStringsSchema = z.string().optional().transform(parseCsv).describe('Valores separados por vírgula.');

export const csvEnumSchema = <E extends Record<string, string>>(enumObject: E) => z
  .string()
  .optional()
  .transform(parseCsv)
  .pipe(z.array(z.enum(enumObject)).optional())
  .describe(`Valores separados por vírgula: ${Object.values(enumObject).join(', ')}.`);

export const booleanQuerySchema = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));
