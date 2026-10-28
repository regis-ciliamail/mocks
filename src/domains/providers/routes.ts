import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, idParamsSchema, zodRouter } from '#shared/fastify';
import {
  providerCityOptionSchema,
  providerCityOptionsQuerySchema,
  providerFormSchema,
  providerSchema,
  providerStatusSchema,
  providersPageSchema,
  providersQuerySchema,
} from './contracts';
import type { ProvidersRepository } from './repository';

const TAG = 'Prestadores';

export const registerProvidersRoutes = (app: FastifyInstance, repository: ProvidersRepository): void => {
  const router = zodRouter(app);

  router.get('/providers', {
    schema: {
      tags: [TAG],
      summary: 'Lista prestadores de um tipo (busca, filtros, ordenação e paginação)',
      querystring: providersQuerySchema,
      response: { 200: providersPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.list(request.query));

  router.get('/providers/city-options', {
    schema: {
      tags: [TAG],
      summary: 'Cidades com prestadores de um tipo, para o filtro de cidade',
      querystring: providerCityOptionsQuerySchema,
      response: { 200: z.array(providerCityOptionSchema), 400: errorResponses[400] },
    },
  }, async (request) => repository.cityOptions(request.query.kind));

  router.get('/providers/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de um prestador',
      params: idParamsSchema,
      response: { 200: providerSchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findById(request.params.id));

  router.post('/providers', {
    schema: {
      tags: [TAG],
      summary: 'Cadastra um prestador',
      body: providerFormSchema,
      response: { 201: providerSchema, 400: errorResponses[400] },
    },
  }, async (request, reply) => {
    reply.code(201);
    return repository.create(request.body);
  });

  router.put('/providers/:id', {
    schema: {
      tags: [TAG],
      summary: 'Atualiza um prestador',
      params: idParamsSchema,
      body: providerFormSchema,
      response: { 200: providerSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.update(request.params.id, request.body));

  router.patch('/providers/:id/status', {
    schema: {
      tags: [TAG],
      summary: 'Ativa ou inativa um prestador',
      params: idParamsSchema,
      body: providerStatusSchema,
      response: { 200: providerSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.updateStatus(request.params.id, request.body.status));
};
