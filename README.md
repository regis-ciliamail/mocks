# API GERE (mock)

API em Node.js que espelha os domínios e os repositórios em memória do frontend do GERE
(`frontend-paddock/apps/gere/domains`). Tem OpenAPI 3.0 e Swagger UI, dados em memória e seeds
determinísticos: a mesma carga gera sempre os mesmos registros.

## Como rodar

Requisitos: Node 24 ou superior.

```bash
npm install
npm run dev        # sobe com recarga automática em http://localhost:3000
npm start          # sobe sem recarga automática
```

| Endereço                             | Conteúdo                            |
| ------------------------------------ | ----------------------------------- |
| `http://localhost:3000/docs`         | Swagger UI                          |
| `http://localhost:3000/openapi.json` | OpenAPI gerado em tempo de execução |
| `http://localhost:3000/health`       | Verificação de saúde                |

Outros comandos:

```bash
npm test           # testes com Vitest
npm run typecheck  # TypeScript em modo estrito
npm run openapi    # grava openapi.json na raiz (contrato versionado para o frontend)
```

A porta pode ser trocada com `PORT=4000 npm start`.

## Convenções

- **Prefixo:** todas as rotas de domínio ficam em `/v2/api/bff`, como o BFF do GERE.
- **Listas paginadas:** respondem `{ items, total }`. Parâmetros `offset` (padrão 0) e `limit`
  (padrão 20, máximo 200).
- **Busca:** `search` ignora acento e maiúsculas. Termo só com números é tratado como CNPJ ou
  CPF, com ou sem pontuação.
- **Listas em query:** valores separados por vírgula, por exemplo `states=GO,SP`.
- **Datas em filtro:** `AAAA-MM-DD`, com o dia inteiro incluído nas duas pontas.
- **Ordenação:** `sortField` e `sortOrder` (`asc` ou `desc`).
- **Erros:** sempre `{ statusCode, code, message }`. Os códigos são estáveis, por exemplo
  `NOT_FOUND`, `SERVICE_PROVIDER_DUPLICATE_DOCUMENT` e `PRV_RANGES_INVALID`.
- **Enums:** valores em snake_case, iguais aos do GERE. Chaves e nomes no código, em camelCase.
- **Sessão:** `POST /auth/login-dual` e `POST /auth/cilia-sso` devolvem `accessToken`. Use
  `Authorization: Bearer <token>` em `/auth/me` e `/auth/logout`.

## Rotas

Caminhos relativos a `/v2/api/bff`.

### Autenticação

| Método | Caminho                       | Descrição                     |
| ------ | ----------------------------- | ----------------------------- |
| GET    | `/auth/accounts?username=CPF` | Contas que o CPF pode usar    |
| POST   | `/auth/login-dual`            | Login com CPF, conta e senha  |
| POST   | `/auth/cilia-sso`             | Login pelo token do Cilia Web |
| GET    | `/auth/me`                    | Usuário da sessão             |
| POST   | `/auth/logout`                | Encerra a sessão (204)        |

### Rede e prestadores

| Método   | Caminho                              | Descrição                                       |
| -------- | ------------------------------------ | ----------------------------------------------- |
| GET      | `/service-providers`                 | Oficinas: busca, filtros, ordenação e paginação |
| GET      | `/service-providers/city-options`    | Cidades com oficinas                            |
| GET, PUT | `/service-providers/{id}`            | Detalhe e edição                                |
| POST     | `/service-providers`                 | Cadastro (409 se o CNPJ já existir)             |
| PATCH    | `/service-providers/{id}/status`     | Ativa, suspende ou inativa                      |
| GET      | `/providers?kind=parking`            | Prestadores de um tipo                          |
| GET      | `/providers/city-options?kind=glass` | Cidades de um tipo                              |
| GET, PUT | `/providers/{id}`                    | Detalhe e edição                                |
| POST     | `/providers`                         | Cadastro                                        |
| PATCH    | `/providers/{id}/status`             | Ativa ou inativa                                |
| GET      | `/auto-centers`                      | Centros automotivos                             |
| GET      | `/auto-centers/city-options`         | Cidades com centros                             |
| GET, PUT | `/auto-centers/{id}`                 | Detalhe e edição                                |
| POST     | `/auto-centers`                      | Cadastro                                        |
| PATCH    | `/auto-centers/{id}/status`          | Ativa ou inativa                                |

### Avaliações

| Método | Caminho                                         | Descrição                        |
| ------ | ----------------------------------------------- | -------------------------------- |
| GET    | `/ratings?targetKind=workshop`                  | Pesquisas, com resumo por status |
| GET    | `/ratings/provider-options?targetKind=workshop` | Estabelecimentos com pesquisas   |
| GET    | `/ratings/{id}`                                 | Detalhe                          |
| POST   | `/ratings`                                      | Cria e envia (201)               |
| POST   | `/ratings/{id}/resend`                          | Reenvia; 422 se já respondida    |

### Integrações

| Método    | Caminho                                        | Descrição                                |
| --------- | ---------------------------------------------- | ---------------------------------------- |
| GET       | `/integrations/workshop-syncs`                 | Sincronizações de oficinas               |
| POST      | `/integrations/workshop-syncs/reprocess`       | Reprocessa por ids (volta para pendente) |
| GET, POST | `/integrations/rating-imports`                 | Importações de NPS                       |
| GET, POST | `/integrations/prv-imports`                    | Arquivos PRV                             |
| GET       | `/integrations/remunerations`                  | Remuneração por mês                      |
| PUT       | `/integrations/remunerations/{referenceMonth}` | Envia ou substitui o arquivo do mês      |
| GET, PUT  | `/integrations/remuneration-settings`          | Valor por regulação e bônus de prazo     |
| GET       | `/integrations/logs`                           | Logs de entrada e saída, com filtros     |
| GET       | `/integrations/logs/filter-options`            | Seguradoras e integrações dos logs       |

### Cadastros

| Método    | Caminho                             | Descrição                              |
| --------- | ----------------------------------- | -------------------------------------- |
| GET, POST | `/registrations/accounts`           | Contas                                 |
| GET, PUT  | `/registrations/accounts/{id}`      | Detalhe e edição                       |
| GET       | `/registrations/accounts/options`   | Contas para seleção                    |
| GET, POST | `/registrations/users`              | Usuários (o novo entra como convidado) |
| GET, PUT  | `/registrations/users/{id}`         | Detalhe e edição                       |
| GET, POST | `/registrations/profiles`           | Perfis, com quantidade de usuários     |
| GET, PUT  | `/registrations/profiles/{id}`      | Detalhe e edição                       |
| GET       | `/registrations/profiles/options`   | Perfis para seleção                    |
| GET, POST | `/registrations/tokens`             | Tokens de integração                   |
| PATCH     | `/registrations/tokens/{id}/active` | Ativa ou desativa                      |

### Administração, geolocalização, relatórios, dashboard e conta

| Método    | Caminho                                                         | Descrição                                 |
| --------- | --------------------------------------------------------------- | ----------------------------------------- |
| GET, POST | `/administration/catalogs/{kind}`                               | Cadastros auxiliares (9 tipos)            |
| GET, PUT  | `/administration/catalogs/{kind}/{id}`                          | Detalhe e edição                          |
| PATCH     | `/administration/catalogs/{kind}/{id}/active`                   | Ativa ou inativa                          |
| GET, POST | `/administration/gsre-cities`                                   | Cidades GSRE                              |
| GET, POST | `/administration/prv-rules`                                     | Regras de cálculo PRV                     |
| GET, PUT  | `/administration/prv-rules/{id}`                                | Detalhe e edição                          |
| PUT       | `/administration/prv-rules/{id}/ranges`                         | Faixas; valida ordem e sobreposição (422) |
| GET       | `/geolocation/reference-addresses?term=`                        | Endereços de referência                   |
| GET       | `/geolocation/map-providers/nearby?latitude&longitude&radiusKm` | Prestadores num raio, por distância       |
| GET       | `/geolocation/map-providers/{id}`                               | Detalhe no mapa                           |
| GET       | `/reports/workshop-status`                                      | Lista e série mensal de entradas e saídas |
| GET       | `/reports/workshop-status/city-options`                         | Cidades do relatório                      |
| GET       | `/reports/workshop-credits`                                     | Créditos, com total da busca              |
| GET       | `/dashboard/summary?period=last_30_days`                        | Indicadores, NPS e séries                 |
| GET       | `/account/companies`                                            | Empresas com módulos e recursos           |
| GET       | `/account/companies/{id}`                                       | Detalhe de uma empresa                    |

## Seeds

Os dados saem de `src/domains/<dominio>/seed.ts` e de `src/seed/`. Cada domínio começa com os
registros literais do protótipo do GERE e completa com registros gerados, por um gerador
pseudoaleatório (mulberry32) com semente fixa.

| Domínio               | Registros                                                                 |
| --------------------- | ------------------------------------------------------------------------- |
| Oficinas (rede)       | 300                                                                       |
| Prestadores (7 tipos) | 280 (40 por tipo)                                                         |
| Centros automotivos   | 120                                                                       |
| Avaliações            | 400                                                                       |
| Integrações           | 150 sincronizações, 30 importações NPS, 24 PRV, 12 remunerações, 800 logs |
| Cadastros             | 40 contas, 8 perfis, 200 usuários, 50 tokens                              |
| Administração         | 25 itens por cadastro (9 tipos), 200 cidades GSRE, 12 regras PRV          |
| Geolocalização        | 300 prestadores no mapa, 7 endereços de referência                        |
| Relatórios            | 200 status de oficinas, 100 créditos                                      |
| Conta                 | 60 empresas                                                               |

Os dados ficam em memória. Criar, editar ou reprocessar mexe só no processo atual. Reiniciar a
API volta ao seed.

## Decisões e limites

- **Framework:** Fastify 5, com `fastify-type-provider-zod`. O schema Zod de cada rota vira a
  validação da requisição e o OpenAPI, sem duplicar definições.
- **Filtros em query, sem objeto aninhado:** o mock do GERE recebe `filter` e `sort` como objetos.
  Aqui os campos viram parâmetros de query (`states=GO,SP`, `sortField=name`). É mais simples de
  testar e de chamar com `curl`, mas não é o formato final do backend.
- **Autenticação de demonstração:** qualquer senha vale para um CPF de 11 dígitos. O mock do GERE
  funciona assim e a API replica o comportamento. Não há checagem de credencial real.
- **Datas:** as do protótipo que vêm sem segundos ou fuso são convertidas para UTC.
- **Enums:** os valores seguem os enums do GERE, que ainda aguardam o contrato definitivo
  (o código do frontend cita GERE-1387, 1435, 1441, 1443, 1444, 1446 e 1447 como referências).

## Estrutura

```
src/
├── app.ts              # monta o Fastify, o Swagger e as rotas de todos os domínios
├── main.ts             # sobe o servidor
├── shared/             # busca, datas, paginação, erros, ordenação e filtros comuns
├── seed/               # gerador com semente, cidades e pools de nomes
└── domains/<dominio>/
    ├── enums.ts        # enums do domínio
    ├── contracts.ts    # schemas Zod (requisição, resposta e tipos)
    ├── repository.ts   # regras e dados em memória
    ├── seed.ts         # dados iniciais determinísticos
    └── routes.ts       # rotas REST com documentação OpenAPI
scripts/export-openapi.ts
```

Os testes ficam ao lado dos arquivos: `*.test.ts`.
