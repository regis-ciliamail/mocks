import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';

/** Erro padrão da API, usado em todas as respostas de falha. */
export const errorSchema = z.object({
  statusCode: z.number().int(),
  code: z.string().describe('Código estável do erro, para o cliente tratar.'),
  message: z.string(),
});

/** Respostas de erro documentadas em toda rota com regra de negócio. */
export const errorResponses = {
  400: errorSchema.describe('Requisição inválida (validação do corpo ou da query).'),
  401: errorSchema.describe('Sessão ausente ou expirada.'),
  404: errorSchema.describe('Registro não encontrado.'),
  409: errorSchema.describe('Conflito com um registro existente (ex.: documento duplicado).'),
  422: errorSchema.describe('Regra de negócio violada.'),
};

/** Parâmetro de rota `:id`. */
export const idParamsSchema = z.object({
  id: z.string().min(1),
});

export const zodRouter = (app: FastifyInstance) => app.withTypeProvider<ZodTypeProvider>();

export type ZodRouter = ReturnType<typeof zodRouter>;
