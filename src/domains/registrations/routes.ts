import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, idParamsSchema, zodRouter } from '#shared/fastify';
import {
  accountFormSchema,
  accountOptionSchema,
  accountSchema,
  accountsPageSchema,
  accountsQuerySchema,
  integrationTokenActiveSchema,
  integrationTokenCreateSchema,
  integrationTokenSchema,
  profileFormSchema,
  profileOptionSchema,
  profileSchema,
  profilesPageSchema,
  profilesQuerySchema,
  tokensPageSchema,
  tokensQuerySchema,
  userFormSchema,
  userSchema,
  usersPageSchema,
  usersQuerySchema,
} from './contracts';
import type { RegistrationsRepository } from './repository';

const TAG = 'Cadastros';

export const registerRegistrationsRoutes = (app: FastifyInstance, repository: RegistrationsRepository): void => {
  const router = zodRouter(app);

  router.get('/registrations/accounts', {
    schema: {
      tags: [TAG],
      summary: 'Contas (seguradoras, locadoras e demais clientes) com busca e paginação',
      querystring: accountsQuerySchema,
      response: { 200: accountsPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.listAccounts(request.query));

  router.get('/registrations/accounts/options', {
    schema: {
      tags: [TAG],
      summary: 'Contas para campos de seleção',
      response: { 200: z.array(accountOptionSchema) },
    },
  }, async () => repository.accountOptions());

  router.get('/registrations/accounts/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de uma conta',
      params: idParamsSchema,
      response: { 200: accountSchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findAccount(request.params.id));

  router.post('/registrations/accounts', {
    schema: {
      tags: [TAG],
      summary: 'Cadastra uma conta',
      body: accountFormSchema,
      response: { 201: accountSchema, 400: errorResponses[400] },
    },
  }, async (request, reply) => {
    reply.code(201);
    return repository.saveAccount(null, request.body);
  });

  router.put('/registrations/accounts/:id', {
    schema: {
      tags: [TAG],
      summary: 'Atualiza uma conta',
      params: idParamsSchema,
      body: accountFormSchema,
      response: { 200: accountSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.saveAccount(request.params.id, request.body));

  router.get('/registrations/users', {
    schema: {
      tags: [TAG],
      summary: 'Usuários do GERE, com filtros por status, perfil e conta',
      querystring: usersQuerySchema,
      response: { 200: usersPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.listUsers(request.query));

  router.get('/registrations/users/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de um usuário',
      params: idParamsSchema,
      response: { 200: userSchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findUser(request.params.id));

  router.post('/registrations/users', {
    schema: {
      tags: [TAG],
      summary: 'Cadastra um usuário (ele entra como convidado)',
      body: userFormSchema,
      response: { 201: userSchema, 400: errorResponses[400] },
    },
  }, async (request, reply) => {
    reply.code(201);
    return repository.saveUser(null, request.body);
  });

  router.put('/registrations/users/:id', {
    schema: {
      tags: [TAG],
      summary: 'Atualiza um usuário',
      params: idParamsSchema,
      body: userFormSchema,
      response: { 200: userSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.saveUser(request.params.id, request.body));

  router.get('/registrations/profiles', {
    schema: {
      tags: [TAG],
      summary: 'Perfis de acesso, com a quantidade de usuários em cada um',
      querystring: profilesQuerySchema,
      response: { 200: profilesPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.listProfiles(request.query));

  router.get('/registrations/profiles/options', {
    schema: {
      tags: [TAG],
      summary: 'Perfis para campos de seleção',
      response: { 200: z.array(profileOptionSchema) },
    },
  }, async () => repository.profileOptions());

  router.get('/registrations/profiles/:id', {
    schema: {
      tags: [TAG],
      summary: 'Detalhe de um perfil',
      params: idParamsSchema,
      response: { 200: profileSchema, 404: errorResponses[404] },
    },
  }, async (request) => repository.findProfile(request.params.id));

  router.post('/registrations/profiles', {
    schema: {
      tags: [TAG],
      summary: 'Cadastra um perfil com as permissões de acesso',
      body: profileFormSchema,
      response: { 201: profileSchema, 400: errorResponses[400] },
    },
  }, async (request, reply) => {
    reply.code(201);
    return repository.saveProfile(null, request.body);
  });

  router.put('/registrations/profiles/:id', {
    schema: {
      tags: [TAG],
      summary: 'Atualiza um perfil',
      params: idParamsSchema,
      body: profileFormSchema,
      response: { 200: profileSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.saveProfile(request.params.id, request.body));

  router.get('/registrations/tokens', {
    schema: {
      tags: [TAG],
      summary: 'Tokens de integração por conta e sistema',
      querystring: tokensQuerySchema,
      response: { 200: tokensPageSchema, 400: errorResponses[400] },
    },
  }, async (request) => repository.listTokens(request.query));

  router.post('/registrations/tokens', {
    schema: {
      tags: [TAG],
      summary: 'Gera um token de integração para uma conta',
      body: integrationTokenCreateSchema,
      response: { 201: integrationTokenSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request, reply) => {
    reply.code(201);
    return repository.createToken(request.body);
  });

  router.patch('/registrations/tokens/:id/active', {
    schema: {
      tags: [TAG],
      summary: 'Ativa ou desativa um token de integração',
      params: idParamsSchema,
      body: integrationTokenActiveSchema,
      response: { 200: integrationTokenSchema, 400: errorResponses[400], 404: errorResponses[404] },
    },
  }, async (request) => repository.setTokenActive(request.params.id, request.body.isActive));
};
