import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, zodRouter } from '#shared/fastify';
import {
  integrationLogFilterOptionsSchema,
  integrationLogsPageSchema,
  integrationLogsQuerySchema,
  monthlyFileCreateSchema,
  prvImportSchema,
  prvImportsPageSchema,
  prvImportsQuerySchema,
  ratingImportCreateSchema,
  ratingImportSchema,
  ratingImportsPageSchema,
  ratingImportsQuerySchema,
  remunerationParamsSchema,
  remunerationSchema,
  remunerationSettingsSchema,
  remunerationSettingsUpdateSchema,
  remunerationUploadSchema,
  remunerationsPageSchema,
  workshopSyncSchema,
  workshopSyncsPageSchema,
  workshopSyncsQuerySchema,
  workshopSyncsReprocessSchema,
} from './contracts';
import type { IntegrationsRepository } from './repository';

const TAG = 'Integrações';
const REPROCESSED_BY = 'Usuário do protótipo';

export const registerIntegrationsRoutes = (app: FastifyInstance, repository: IntegrationsRepository): void => {
  const router = zodRouter(app);

  router.get(
    '/integrations/workshop-syncs',
    {
      schema: {
        tags: [TAG],
        summary: 'Histórico de sincronizações de oficinas com os sistemas de destino',
        querystring: workshopSyncsQuerySchema,
        response: { 200: workshopSyncsPageSchema, 400: errorResponses[400] },
      },
    },
    async (request) => repository.listWorkshopSyncs(request.query),
  );

  router.post(
    '/integrations/workshop-syncs/reprocess',
    {
      schema: {
        tags: [TAG],
        summary: 'Reprocessa sincronizações selecionadas (voltam para pendente)',
        body: workshopSyncsReprocessSchema,
        response: { 200: z.array(workshopSyncSchema), 400: errorResponses[400] },
      },
    },
    async (request) => repository.reprocessWorkshopSyncs(request.body.ids, REPROCESSED_BY),
  );

  router.get(
    '/integrations/rating-imports',
    {
      schema: {
        tags: [TAG],
        summary: 'Importações de arquivos de NPS (oficinas e centros automotivos)',
        querystring: ratingImportsQuerySchema,
        response: { 200: ratingImportsPageSchema, 400: errorResponses[400] },
      },
    },
    async (request) => repository.listRatingImports(request.query),
  );

  router.post(
    '/integrations/rating-imports',
    {
      schema: {
        tags: [TAG],
        summary: 'Registra o envio de um arquivo de NPS',
        body: ratingImportCreateSchema,
        response: { 201: ratingImportSchema, 400: errorResponses[400] },
      },
    },
    async (request, reply) => {
      reply.code(201);
      return repository.createRatingImport(request.body);
    },
  );

  router.get(
    '/integrations/prv-imports',
    {
      schema: {
        tags: [TAG],
        summary: 'Arquivos PRV enviados e resultados gerados',
        querystring: prvImportsQuerySchema,
        response: { 200: prvImportsPageSchema, 400: errorResponses[400] },
      },
    },
    async (request) => repository.listPrvImports(request.query),
  );

  router.post(
    '/integrations/prv-imports',
    {
      schema: {
        tags: [TAG],
        summary: 'Envia um arquivo PRV de um mês de referência',
        body: monthlyFileCreateSchema,
        response: { 201: prvImportSchema, 400: errorResponses[400] },
      },
    },
    async (request, reply) => {
      reply.code(201);
      return repository.createPrvImport(request.body);
    },
  );

  router.get(
    '/integrations/remunerations',
    {
      schema: {
        tags: [TAG],
        summary: 'Arquivos de remuneração de reguladoras, por mês',
        response: { 200: remunerationsPageSchema },
      },
    },
    async () => repository.listRemunerations(),
  );

  router.put(
    '/integrations/remunerations/:referenceMonth',
    {
      schema: {
        tags: [TAG],
        summary: 'Envia (ou substitui) o arquivo de remuneração de um mês',
        params: remunerationParamsSchema,
        body: remunerationUploadSchema,
        response: { 200: remunerationSchema, 400: errorResponses[400] },
      },
    },
    async (request) =>
      repository.saveRemuneration({
        referenceMonth: request.params.referenceMonth,
        fileName: request.body.fileName,
      }),
  );

  router.get(
    '/integrations/remuneration-settings',
    {
      schema: {
        tags: [TAG],
        summary: 'Parâmetros de remuneração (valor por regulação e bônus de prazo)',
        response: { 200: remunerationSettingsSchema },
      },
    },
    async () => repository.getRemunerationSettings(),
  );

  router.put(
    '/integrations/remuneration-settings',
    {
      schema: {
        tags: [TAG],
        summary: 'Atualiza os parâmetros de remuneração',
        body: remunerationSettingsUpdateSchema,
        response: { 200: remunerationSettingsSchema, 400: errorResponses[400] },
      },
    },
    async (request) => repository.updateRemunerationSettings(request.body),
  );

  router.get(
    '/integrations/logs',
    {
      schema: {
        tags: [TAG],
        summary: 'Logs das integrações (entrada e saída), com filtros e paginação',
        querystring: integrationLogsQuerySchema,
        response: { 200: integrationLogsPageSchema, 400: errorResponses[400] },
      },
    },
    async (request) => repository.listLogs(request.query),
  );

  router.get(
    '/integrations/logs/filter-options',
    {
      schema: {
        tags: [TAG],
        summary: 'Seguradoras e integrações presentes nos logs, para os filtros',
        response: { 200: integrationLogFilterOptionsSchema },
      },
    },
    async () => repository.logFilterOptions(),
  );
};
