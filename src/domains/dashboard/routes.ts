import type { FastifyInstance } from 'fastify';
import { dashboardSummaryQuerySchema, dashboardSummarySchema } from './contracts';
import { errorResponses, zodRouter } from '#shared/fastify';
import type { DashboardRepository } from './repository';

const TAG = 'Dashboard';

export const registerDashboardRoutes = (app: FastifyInstance, repository: DashboardRepository): void => {
  const router = zodRouter(app);

  router.get('/dashboard/summary', {
    schema: {
      tags: [TAG],
      summary: 'Indicadores da rede, NPS, série de status e distribuições para o dashboard',
      querystring: dashboardSummaryQuerySchema,
      response: { 200: dashboardSummarySchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.summary(request.query.period));
};
