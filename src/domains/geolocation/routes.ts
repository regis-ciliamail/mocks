import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, idParamsSchema, zodRouter } from '#shared/fastify';
import {
  mapProviderSchema,
  nearbyMapProviderSchema,
  nearbyMapProvidersQuerySchema,
  referenceAddressSchema,
  referenceAddressesQuerySchema,
} from './contracts';
import type { GeolocationRepository } from './repository';

const TAG = 'Geolocalização';

export const registerGeolocationRoutes = (app: FastifyInstance, repository: GeolocationRepository): void => {
  const router = zodRouter(app);

  router.get('/geolocation/reference-addresses', {
    schema: {
      tags: [TAG],
      summary: 'Endereços de referência para centralizar o mapa (busca por trecho)',
      querystring: referenceAddressesQuerySchema,
      response: { 200: z.array(referenceAddressSchema), 400: errorResponses[400] },
    },
  }, async (request) => repository.searchReferenceAddresses(request.query.term));

  router.get('/geolocation/map-providers/nearby', {
    schema: {
      tags: [TAG],
      summary: 'Prestadores num raio do ponto de busca, com distância, ordenados do mais próximo',
      querystring: nearbyMapProvidersQuerySchema,
      response: { 200: z.array(nearbyMapProviderSchema), 400: errorResponses[400] },
    },
  }, async (request) => repository.nearbyProviders(request.query));

  router.get('/geolocation/map-providers/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de um prestador no mapa',
      params: idParamsSchema,
      response: { 200: mapProviderSchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findProvider(request.params.id));
};
