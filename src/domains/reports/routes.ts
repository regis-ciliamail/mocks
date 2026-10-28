import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, zodRouter } from '#shared/fastify';
import {
  workshopCreditQuerySchema,
  workshopCreditReportSchema,
  workshopStatusCityOptionSchema,
  workshopStatusQuerySchema,
  workshopStatusReportSchema,
} from './contracts';
import type { ReportsRepository } from './repository';

const TAG = 'Relatórios';

export const registerReportsRoutes = (app: FastifyInstance, repository: ReportsRepository): void => {
  const router = zodRouter(app);

  router.get('/reports/workshop-status', {
    schema: {
      tags: [TAG],
      summary: 'Status das oficinas na rede: lista e série mensal de entradas e saídas',
      querystring: workshopStatusQuerySchema,
      response: { 200: workshopStatusReportSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.workshopStatus(request.query));

  router.get('/reports/workshop-status/city-options', {
    schema: {
      tags: [TAG],
      summary: 'Cidades do relatório de status, para o filtro de cidade',
      response: { 200: z.array(workshopStatusCityOptionSchema) },
    },
  }, async () => repository.workshopStatusCityOptions());

  router.get('/reports/workshop-credits', {
    schema: {
      tags: [TAG],
      summary: 'Créditos contratados pelas oficinas, com o total da busca',
      querystring: workshopCreditQuerySchema,
      response: { 200: workshopCreditReportSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.workshopCredits(request.query));
};
