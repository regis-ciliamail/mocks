import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, idParamsSchema, zodRouter } from '#shared/fastify';
import {
  autoCenterCityOptionSchema,
  autoCenterFormSchema,
  autoCenterSchema,
  autoCenterStatusSchema,
  autoCentersPageSchema,
  autoCentersQuerySchema,
} from './contracts';
import type { AutoCentersRepository } from './repository';

const TAG = 'Centros automotivos';

export const registerAutoCentersRoutes = (app: FastifyInstance, repository: AutoCentersRepository): void => {
  const router = zodRouter(app);

  router.get('/auto-centers', {
    schema: {
      tags: [TAG],
      summary: 'Lista centros automotivos (busca, filtros, ordenação e paginação)',
      querystring: autoCentersQuerySchema,
      response: { 200: autoCentersPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.list(request.query));

  router.get('/auto-centers/city-options', {
    schema: {
      tags: [TAG],
      summary: 'Cidades com centros automotivos, para o filtro de cidade',
      response: { 200: z.array(autoCenterCityOptionSchema) },
    },
  }, async () => repository.cityOptions());

  router.get('/auto-centers/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de um centro automotivo',
      params: idParamsSchema,
      response: { 200: autoCenterSchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findById(request.params.id));

  router.post('/auto-centers', {
    schema: {
      tags: [TAG],
      summary: 'Cadastra um centro automotivo',
      body: autoCenterFormSchema,
      response: { 201: autoCenterSchema, 400: errorResponses[400] },
    },
  }, async (request, reply) => {
    reply.code(201);
    return repository.create(request.body);
  });

  router.put('/auto-centers/:id', {
    schema: {
      tags: [TAG],
      summary: 'Atualiza um centro automotivo',
      params: idParamsSchema,
      body: autoCenterFormSchema,
      response: { 200: autoCenterSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.update(request.params.id, request.body));

  router.patch('/auto-centers/:id/status', {
    schema: {
      tags: [TAG],
      summary: 'Ativa ou inativa um centro automotivo',
      params: idParamsSchema,
      body: autoCenterStatusSchema,
      response: { 200: autoCenterSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.updateStatus(request.params.id, request.body.status));
};
