import type { FastifyInstance } from 'fastify';
import { errorResponses, idParamsSchema, zodRouter } from '#shared/fastify';
import { companiesPageSchema, companiesQuerySchema, companySchema } from './contracts';
import type { AccountRepository } from './repository';

const TAG = 'Conta';

export const registerAccountRoutes = (app: FastifyInstance, repository: AccountRepository): void => {
  const router = zodRouter(app);

  router.get('/account/companies', {
    schema: {
      tags: [TAG],
      summary: 'Empresas disponíveis para o usuário, com módulos e recursos da Cilia',
      querystring: companiesQuerySchema,
      response: { 200: companiesPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.listCompanies(request.query));

  router.get('/account/companies/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de uma empresa',
      params: idParamsSchema,
      response: { 200: companySchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findCompany(request.params.id));
};
