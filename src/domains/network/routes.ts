import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, idParamsSchema, zodRouter } from '#shared/fastify';
import {
  serviceProviderCityOptionSchema,
  serviceProviderFormSchema,
  serviceProviderSchema,
  serviceProviderStatusSchema,
  serviceProvidersPageSchema,
  serviceProvidersQuerySchema,
} from './contracts';
import type { NetworkRepository } from './repository';

const TAG = 'Rede';

export const registerNetworkRoutes = (app: FastifyInstance, repository: NetworkRepository): void => {
  const router = zodRouter(app);

  router.get('/service-providers', {
    schema: {
      tags: [TAG],
      summary: 'Lista oficinas da rede (busca, filtros, ordenação e paginação)',
      querystring: serviceProvidersQuerySchema,
      response: { 200: serviceProvidersPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.list(request.query));

  router.get('/service-providers/city-options', {
    schema: {
      tags: [TAG],
      summary: 'Cidades com oficinas cadastradas, para o filtro de cidade',
      response: { 200: z.array(serviceProviderCityOptionSchema) },
    },
  }, async () => repository.cityOptions());

  router.get('/service-providers/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de uma oficina',
      params: idParamsSchema,
      response: { 200: serviceProviderSchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findById(request.params.id));

  router.post('/service-providers', {
    schema: {
      tags: [TAG],
      summary: 'Cadastra uma oficina',
      body: serviceProviderFormSchema,
      response: { 201: serviceProviderSchema, 400: errorResponses[400], 409: errorResponses[409] },
    },
  }, async (request, reply) => {
    reply.code(201);
    return repository.create(request.body);
  });

  router.put('/service-providers/:id', {
    schema: {
      tags: [TAG],
      summary: 'Atualiza os dados de uma oficina',
      params: idParamsSchema,
      body: serviceProviderFormSchema,
      response: {
        200: serviceProviderSchema,
        400: errorResponses[400],
        404: errorResponses[404],
        409: errorResponses[409],
      },
    },
  }, async (request) => repository.update(request.params.id, request.body));

  router.patch('/service-providers/:id/status', {
    schema: {
      tags: [TAG],
      summary: 'Altera o status de uma oficina (ativa, suspensa ou inativa)',
      params: idParamsSchema,
      body: serviceProviderStatusSchema,
      response: { 200: serviceProviderSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.updateStatus(request.params.id, request.body.status));
};
