import type { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import { errorResponses, zodRouter } from '#shared/fastify';
import {
  ciliaSsoBodySchema,
  ciliaSsoResultSchema,
  dualLoginBodySchema,
  dualLoginResultSchema,
  loginAccountSchema,
  loginAccountsQuerySchema,
  sessionUserSchema,
} from './contracts';
import type { AuthRepository } from './repository';

const TAG = 'Autenticação';

/** Token do header `Authorization: Bearer <token>`; ausente ou malformado vira `undefined`. */
const readBearerToken = (authorization: string | undefined): string | undefined => {
  if (!authorization?.startsWith('Bearer ')) return undefined;
  const token = authorization.slice('Bearer '.length).trim();
  return token.length > 0 ? token : undefined;
};

export const registerAuthRoutes = (app: FastifyInstance, repository: AuthRepository): void => {
  const router = zodRouter(app);

  router.get('/auth/accounts', {
    schema: {
      tags: [TAG],
      summary: 'Contas que o CPF pode usar no login',
      querystring: loginAccountsQuerySchema,
      response: { 200: z.array(loginAccountSchema), 400: errorResponses[400] },
    },
  }, async () => repository.findAccounts());

  router.post('/auth/login-dual', {
    schema: {
      tags: [TAG],
      summary: 'Login com CPF, senha e conta (fluxo dual do GERE)',
      body: dualLoginBodySchema,
      response: { 200: dualLoginResultSchema, 400: errorResponses[400], 401: errorResponses[401] },
    },
  }, async (request) => repository.loginDual(request.body));

  router.post('/auth/cilia-sso', {
    schema: {
      tags: [TAG],
      summary: 'Login pelo SSO do Cilia Web (troca o token do callback por uma sessão)',
      body: ciliaSsoBodySchema,
      response: { 200: ciliaSsoResultSchema, 400: errorResponses[400], 401: errorResponses[401] },
    },
  }, async (request) => repository.loginWithCiliaSso(request.body.userToken));

  router.get('/auth/me', {
    schema: {
      tags: [TAG],
      summary: 'Usuário da sessão atual (Bearer)',
      response: { 200: sessionUserSchema, 401: errorResponses[401] },
    },
  }, async (request) => repository.currentUser(readBearerToken(request.headers.authorization)));

  router.post('/auth/logout', {
    schema: {
      tags: [TAG],
      summary: 'Encerra a sessão atual (Bearer)',
      response: { 204: z.undefined().describe('Sessão encerrada.') },
    },
  }, async (request, reply) => {
    repository.logout(readBearerToken(request.headers.authorization));
    return reply.code(204).send();
  });
};
