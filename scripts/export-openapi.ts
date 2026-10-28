import { writeFile } from 'node:fs/promises';
import { buildApp } from '../src/app';

const app = await buildApp();
await app.ready();
const document = app.swagger();
await app.close();

await writeFile(new URL('../openapi.json', import.meta.url), `${JSON.stringify(document, null, 2)}\n`);
console.log('openapi.json gerado na raiz do projeto.');
