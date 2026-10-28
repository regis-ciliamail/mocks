import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app';

describe('API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should answer the health check', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('should list paginated items with the total', async () => {
    const response = await app.inject({ method: 'GET', url: '/v2/api/bff/service-providers?limit=2&offset=0' });
    const body = response.json<{ items: unknown[]; total: number }>();
    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(2);
    expect(body.total).toBe(300);
  });

  it('should answer a missing record with the standard error shape', async () => {
    const response = await app.inject({ method: 'GET', url: '/v2/api/bff/service-providers/nao-existe' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });

  it('should reject an invalid body with a validation error', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v2/api/bff/service-providers',
      payload: { name: '' },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('should publish the OpenAPI document with the BFF routes', async () => {
    const response = await app.inject({ method: 'GET', url: '/openapi.json' });
    const document = response.json<{ paths: Record<string, unknown> }>();
    expect(response.statusCode).toBe(200);
    expect(Object.keys(document.paths)).toContain('/v2/api/bff/service-providers');
    expect(Object.keys(document.paths)).toContain('/v2/api/bff/auth/login-dual');
  });

  it('should serve the Swagger UI', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/' });
    expect(response.statusCode).toBe(200);
  });
});
