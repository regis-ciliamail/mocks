import type { FastifyInstance } from 'fastify';
import { errorResponses, idParamsSchema, zodRouter } from '#shared/fastify';
import {
  administrationQuerySchema,
  catalogItemActiveSchema,
  catalogItemFormSchema,
  catalogItemParamsSchema,
  catalogItemSchema,
  catalogItemsPageSchema,
  catalogParamsSchema,
  gsreCitiesPageSchema,
  gsreCityFormSchema,
  gsreCitySchema,
  prvRangesFormSchema,
  prvRuleFormSchema,
  prvRuleSchema,
  prvRulesPageSchema,
} from './contracts';
import type { AdministrationRepository } from './repository';

const TAG = 'Administração';

export const registerAdministrationRoutes = (app: FastifyInstance, repository: AdministrationRepository): void => {
  const router = zodRouter(app);

  router.get(
    '/administration/catalogs/:kind',
    {
      schema: {
        tags: [TAG],
        summary: 'Lista um cadastro auxiliar (filiais, motivos de ocorrência, benefícios etc.)',
        params: catalogParamsSchema,
        querystring: administrationQuerySchema,
        response: { 200: catalogItemsPageSchema, 400: errorResponses[400] },
      },
    },
    async (request) => repository.listCatalogItems(request.params.kind, request.query),
  );

  router.get(
    '/administration/catalogs/:kind/:id',
    {
      schema: {
        tags: [TAG],
        summary: 'Detalhe de um item de cadastro auxiliar',
        params: catalogItemParamsSchema,
        response: { 200: catalogItemSchema, 404: errorResponses[404] },
      },
    },
    async (request) => repository.findCatalogItem(request.params.kind, request.params.id),
  );

  router.post(
    '/administration/catalogs/:kind',
    {
      schema: {
        tags: [TAG],
        summary: 'Cadastra um item em um cadastro auxiliar',
        params: catalogParamsSchema,
        body: catalogItemFormSchema,
        response: { 201: catalogItemSchema, 400: errorResponses[400] },
      },
    },
    async (request, reply) => {
      reply.code(201);
      return repository.createCatalogItem(request.params.kind, request.body);
    },
  );

  router.put(
    '/administration/catalogs/:kind/:id',
    {
      schema: {
        tags: [TAG],
        summary: 'Atualiza um item de cadastro auxiliar',
        params: catalogItemParamsSchema,
        body: catalogItemFormSchema,
        response: { 200: catalogItemSchema, 400: errorResponses[400], 404: errorResponses[404] },
      },
    },
    async (request) => repository.updateCatalogItem(request.params.kind, request.params.id, request.body),
  );

  router.patch(
    '/administration/catalogs/:kind/:id/active',
    {
      schema: {
        tags: [TAG],
        summary: 'Ativa ou inativa um item de cadastro auxiliar',
        params: catalogItemParamsSchema,
        body: catalogItemActiveSchema,
        response: { 200: catalogItemSchema, 400: errorResponses[400], 404: errorResponses[404] },
      },
    },
    async (request) => repository.setCatalogItemActive(request.params.kind, request.params.id, request.body.isActive),
  );

  router.get(
    '/administration/gsre-cities',
    {
      schema: {
        tags: [TAG],
        summary: 'Cidades da tabela GSRE (nome, código e estado)',
        querystring: administrationQuerySchema,
        response: { 200: gsreCitiesPageSchema, 400: errorResponses[400] },
      },
    },
    async (request) => repository.listGsreCities(request.query),
  );

  router.post(
    '/administration/gsre-cities',
    {
      schema: {
        tags: [TAG],
        summary: 'Cadastra uma cidade na tabela GSRE',
        body: gsreCityFormSchema,
        response: { 201: gsreCitySchema, 400: errorResponses[400] },
      },
    },
    async (request, reply) => {
      reply.code(201);
      return repository.createGsreCity(request.body);
    },
  );

  router.get(
    '/administration/prv-rules',
    {
      schema: {
        tags: [TAG],
        summary: 'Regras de cálculo PRV (honorários, bônus de prazo, desconto em peças)',
        querystring: administrationQuerySchema,
        response: { 200: prvRulesPageSchema, 400: errorResponses[400] },
      },
    },
    async (request) => repository.listPrvRules(request.query),
  );

  router.get(
    '/administration/prv-rules/:id',
    {
      schema: {
        tags: [TAG],
        summary: 'Detalhe de uma regra PRV, com as faixas',
        params: idParamsSchema,
        response: { 200: prvRuleSchema, 404: errorResponses[404] },
      },
    },
    async (request) => repository.findPrvRule(request.params.id),
  );

  router.post(
    '/administration/prv-rules',
    {
      schema: {
        tags: [TAG],
        summary: 'Cadastra uma regra PRV (nasce com uma faixa aberta)',
        body: prvRuleFormSchema,
        response: { 201: prvRuleSchema, 400: errorResponses[400] },
      },
    },
    async (request, reply) => {
      reply.code(201);
      return repository.createPrvRule(request.body);
    },
  );

  router.put(
    '/administration/prv-rules/:id',
    {
      schema: {
        tags: [TAG],
        summary: 'Atualiza nome, tipo e cálculo de uma regra PRV',
        params: idParamsSchema,
        body: prvRuleFormSchema,
        response: { 200: prvRuleSchema, 400: errorResponses[400], 404: errorResponses[404] },
      },
    },
    async (request) => repository.updatePrvRule(request.params.id, request.body),
  );

  router.put(
    '/administration/prv-rules/:id/ranges',
    {
      schema: {
        tags: [TAG],
        summary: 'Substitui as faixas de uma regra PRV (valida limites, ordem e sobreposição)',
        params: idParamsSchema,
        body: prvRangesFormSchema,
        response: {
          200: prvRuleSchema,
          400: errorResponses[400],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    async (request) => repository.savePrvRuleRanges(request.params.id, request.body.ranges),
  );
};
