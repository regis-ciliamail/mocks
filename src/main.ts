import { buildApp } from './app';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

const app = await buildApp();
await app.listen({ port, host });
console.log(`API em http://localhost:${port} · Swagger UI em http://localhost:${port}/docs`);
