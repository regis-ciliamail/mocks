import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Fastify, { type FastifyInstance, type FastifyReply } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { AppError } from '#shared/errors';
import { AccountRepository } from '#domains/account/repository';
import { registerAccountRoutes } from '#domains/account/routes';
import { buildCompanySeed } from '#domains/account/seed';
import { registerAdministrationRoutes } from '#domains/administration/routes';
import { AdministrationRepository } from '#domains/administration/repository';
import { buildAdministrationSeed } from '#domains/administration/seed';
import { AuthRepository } from '#domains/auth/repository';
import { registerAuthRoutes } from '#domains/auth/routes';
import { AutoCentersRepository } from '#domains/auto-centers/repository';
import { registerAutoCentersRoutes } from '#domains/auto-centers/routes';
import { buildAutoCenterSeed } from '#domains/auto-centers/seed';
import { DashboardRepository } from '#domains/dashboard/repository';
import { registerDashboardRoutes } from '#domains/dashboard/routes';
import { GeolocationRepository } from '#domains/geolocation/repository';
import { registerGeolocationRoutes } from '#domains/geolocation/routes';
import { buildMapProviderSeed, referenceAddresses } from '#domains/geolocation/seed';
import { IntegrationsRepository } from '#domains/integrations/repository';
import { registerIntegrationsRoutes } from '#domains/integrations/routes';
import { buildIntegrationsSeed } from '#domains/integrations/seed';
import { NetworkRepository } from '#domains/network/repository';
import { registerNetworkRoutes } from '#domains/network/routes';
import { buildServiceProviderSeed } from '#domains/network/seed';
import { ProvidersRepository } from '#domains/providers/repository';
import { registerProvidersRoutes } from '#domains/providers/routes';
import { buildProviderSeed } from '#domains/providers/seed';
import { RatingsRepository } from '#domains/ratings/repository';
import { registerRatingsRoutes } from '#domains/ratings/routes';
import { buildRatingSeed } from '#domains/ratings/seed';
import { RegistrationsRepository } from '#domains/registrations/repository';
import { registerRegistrationsRoutes } from '#domains/registrations/routes';
import { buildRegistrationsSeed } from '#domains/registrations/seed';
import { ReportsRepository } from '#domains/reports/repository';
import { registerReportsRoutes } from '#domains/reports/routes';
import { buildReportsSeed } from '#domains/reports/seed';

/** Prefixo das rotas: segue o BFF do GERE (`/v2/api/bff/...`). */
export const API_PREFIX = '/v2/api/bff';

export type AppOptions = {
  /** Relógio injetável: os testes fixam a data sem depender da hora da máquina. */
  now?: () => Date;
};

const createRepositories = (options: AppOptions) => {
  const now = options.now ?? (() => new Date());
  const reports = buildReportsSeed();
  return {
    network: new NetworkRepository(buildServiceProviderSeed(), now),
    providers: new ProvidersRepository(buildProviderSeed(), now),
    autoCenters: new AutoCentersRepository(buildAutoCenterSeed(), now),
    ratings: new RatingsRepository(buildRatingSeed(), now),
    integrations: new IntegrationsRepository(buildIntegrationsSeed(), now),
    registrations: new RegistrationsRepository(buildRegistrationsSeed(), now),
    administration: new AdministrationRepository(buildAdministrationSeed()),
    geolocation: new GeolocationRepository(buildMapProviderSeed(), referenceAddresses),
    reports: new ReportsRepository(reports),
    dashboard: new DashboardRepository(now),
    account: new AccountRepository(buildCompanySeed()),
    auth: new AuthRepository(),
  };
};

const handleError = (error: unknown, reply: FastifyReply) => {
  if (error instanceof AppError) {
    return reply
      .status(error.statusCode)
      .send({ statusCode: error.statusCode, code: error.code, message: error.message });
  }
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Requisição inválida. Confira os campos enviados.',
      details: error.validation,
    });
  }
  const fastifyStatus = error instanceof Error && 'statusCode' in error ? error.statusCode : undefined;
  const statusCode = typeof fastifyStatus === 'number' ? fastifyStatus : 500;
  if (statusCode >= 500) console.error(error);
  return reply.status(statusCode).send({
    statusCode,
    code: statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
    message: statusCode >= 500 || !(error instanceof Error) ? 'Erro interno do servidor.' : error.message,
  });
};

const registerDocumentation = async (app: FastifyInstance): Promise<void> => {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'API GERE (mock)',
        description:
          'Mock da API do GERE com os mesmos domínios, filtros e formulários do frontend, e seeds determinísticos.',
        version: '0.1.0',
      },
      servers: [{ url: 'http://localhost:3000', description: 'Ambiente local' }],
      tags: [
        { name: 'Autenticação', description: 'Login dual, SSO do Cilia Web e sessão' },
        { name: 'Rede', description: 'Oficinas da rede referenciada' },
        {
          name: 'Prestadores',
          description: 'Estacionamentos, locadoras, rastreadores, vidraçarias, autopeças e assistências',
        },
        { name: 'Centros automotivos', description: 'Centros de pneus, troca rápida, alinhamento e estética' },
        { name: 'Avaliações', description: 'Pesquisas de satisfação enviadas a clientes' },
        { name: 'Integrações', description: 'Sincronizações, importações de NPS e PRV, remuneração e logs' },
        { name: 'Cadastros', description: 'Contas, usuários, perfis e tokens de integração' },
        { name: 'Administração', description: 'Cadastros auxiliares, cidades GSRE e regras PRV' },
        { name: 'Geolocalização', description: 'Prestadores no mapa, endereços de referência e busca por raio' },
        { name: 'Relatórios', description: 'Status das oficinas e créditos contratados' },
        { name: 'Dashboard', description: 'Indicadores, NPS e séries da rede' },
        { name: 'Conta', description: 'Empresas, módulos e recursos da Cilia' },
      ],
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  });
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });
};

export const buildApp = async (options: AppOptions = {}): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler((error, _request, reply) => handleError(error, reply));

  await registerDocumentation(app);

  app.get('/health', { schema: { hide: true } }, async () => ({ status: 'ok' }));
  app.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger());

  const repositories = createRepositories(options);
  await app.register(
    async (api) => {
      registerAuthRoutes(api, repositories.auth);
      registerNetworkRoutes(api, repositories.network);
      registerProvidersRoutes(api, repositories.providers);
      registerAutoCentersRoutes(api, repositories.autoCenters);
      registerRatingsRoutes(api, repositories.ratings);
      registerIntegrationsRoutes(api, repositories.integrations);
      registerRegistrationsRoutes(api, repositories.registrations);
      registerAdministrationRoutes(api, repositories.administration);
      registerGeolocationRoutes(api, repositories.geolocation);
      registerReportsRoutes(api, repositories.reports);
      registerDashboardRoutes(api, repositories.dashboard);
      registerAccountRoutes(api, repositories.account);
    },
    { prefix: API_PREFIX },
  );

  return app;
};
