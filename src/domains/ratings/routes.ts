import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, idParamsSchema, zodRouter } from '#shared/fastify';
import {
  ratingProviderOptionSchema,
  ratingProviderOptionsQuerySchema,
  ratingRequestCreateSchema,
  ratingRequestSchema,
  ratingRequestsPageSchema,
  ratingRequestsQuerySchema,
} from './contracts';
import type { RatingsRepository } from './repository';

const TAG = 'Avaliações';

export const registerRatingsRoutes = (app: FastifyInstance, repository: RatingsRepository): void => {
  const router = zodRouter(app);

  router.get('/ratings', {
    schema: {
      tags: [TAG],
      summary: 'Lista pesquisas de satisfação, com resumo por status',
      querystring: ratingRequestsQuerySchema,
      response: { 200: ratingRequestsPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.list(request.query));

  router.get('/ratings/provider-options', {
    schema: {
      tags: [TAG],
      summary: 'Estabelecimentos com pesquisas, para o campo de seleção de prestador',
      querystring: ratingProviderOptionsQuerySchema,
      response: { 200: z.array(ratingProviderOptionSchema), 400: errorResponses[400] },
    },
  }, async (request) => repository.providerOptions(request.query.targetKind));

  router.get('/ratings/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de uma pesquisa de satisfação',
      params: idParamsSchema,
      response: { 200: ratingRequestSchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findById(request.params.id));

  router.post('/ratings', {
    schema: {
      tags: [TAG],
      summary: 'Cria e envia uma pesquisa de satisfação',
      body: ratingRequestCreateSchema,
      response: { 201: ratingRequestSchema, 400: errorResponses[400] },
    },
  }, async (request, reply) => {
    reply.code(201);
    return repository.create(request.body);
  });

  router.post('/ratings/:id/resend', {
    schema: {
      tags: [TAG],
      summary: 'Reenvia uma pesquisa que ainda não foi respondida',
      params: idParamsSchema,
      response: { 200: ratingRequestSchema, 404: errorResponses[404], 422: errorResponses[422] },
    },
  }, async (request) => repository.resend(request.params.id));
};
