import { COMPANY_WORDS, COMPANY_SURNAMES, EMAIL_DOMAINS, FIRST_NAMES, LAST_NAMES } from '#seed/names';
import { between, chance, cpf, createRandom, digits, isoBetween, pick } from '#seed/random';
import type { AccountEntity, IntegrationTokenEntity, UserEntity } from './contracts';
import { PermissionEnum, UserStatusEnum } from './enums';
import type { RegistrationsSeed } from './repository';

const GENERATION_SEED = 20261033;
const TOTAL_ACCOUNTS = 40;
const TOTAL_USERS = 200;
const TOTAL_TOKENS = 50;

const toIso = (value: string): string => `${value}:00.000Z`;

/** [razão social, nome fantasia, CNPJ, e-mail, ativa] — contas de seguradoras e locadoras do protótipo. */
const prototypeAccounts: [string, string, string, string, boolean][] = [
  ['Allianz Seguros S/A', 'Allianz', '61573796000166', 'contactcenter@allianz.com.br', true],
  ['Arval Brasil LTDA', 'Arval', '07063698000133', 'email@email.com', true],
  ['Bradesco Seguros S/A', 'Bradesco Seguros', '33055146000193', 'suporte@bradesco.com.br', true],
  ['CAIXA SEGURADORA', 'CAIXA SEGURADORA', '34020354004700', 'seguros@caixaseguros.com.br', true],
  ['Cilia Tecnologia LTDA', 'Cilia Tecnologia', '15533772000166', 'suporte@cilia.com.br', true],
  ['Cilia Academy - Clube de Oficinas', 'Clube de Oficinas', '43265119000150', 'ciliacademy@cilia.com.br', true],
  ['HDI Seguros S.A.', 'HDI Seguros', '29980158000157', 'atendimento@hdi.com.br', true],
  ['Localiza Rent a Car S.A.', 'Localiza', '16670085000155', 'frota@localiza.com', true],
  ['Mapfre Seguros Gerais S.A.', 'Mapfre', '61074175000138', 'sinistros@mapfre.com.br', false],
  ['Movida Locação de Veículos S.A.', 'Movida', '07976147000160', 'manutencao@movida.com.br', true],
  ['Porto Seguro Companhia de Seguros Gerais', 'Porto Seguro', '61198164000160', 'oficinas@portoseguro.com.br', true],
  ['Sompo Seguros S.A.', 'Sompo', '61383493000180', 'rede@sompo.com.br', true],
  ['Tokio Marine Seguradora S.A.', 'Tokio Marine', '33164021000100', 'referenciada@tokiomarine.com.br', true],
  ['Unidas Locadora S.A.', 'Unidas', '04437534000130', 'frota@unidas.com.br', true],
];

/** [nome, permissões] — perfis do protótipo. */
const prototypeProfiles: [string, PermissionEnum[]][] = [
  ['Administrador', Object.values(PermissionEnum)],
  ['Geolocalização', [PermissionEnum.Dashboard, PermissionEnum.Map]],
  ['Perfil novo', [PermissionEnum.Dashboard]],
  ['Teste', [PermissionEnum.Dashboard, PermissionEnum.Workshops, PermissionEnum.Ratings]],
  ['teste 2', [PermissionEnum.Reports]],
];

const extraProfiles: [string, PermissionEnum[]][] = [
  ['Financeiro', [PermissionEnum.Dashboard, PermissionEnum.Reports]],
  [
    'Operação',
    [PermissionEnum.Dashboard, PermissionEnum.Workshops, PermissionEnum.Providers, PermissionEnum.AutoCenters],
  ],
  ['Auditoria', [PermissionEnum.Reports, PermissionEnum.Integrations]],
];

/** [nome, CPF, e-mail, status, último acesso | null, índice da conta, índice do perfil] */
const prototypeUsers: [string, string, string, UserStatusEnum, string | null, number, number][] = [
  ['Almir', '06818470858', 'almir.vieira@cilia.com.br', UserStatusEnum.Active, '2025-09-30T09:15', 4, 0],
  ['Amanda', '70520785118', 'amanda.candido@cilia.com.br', UserStatusEnum.Invited, null, 4, 3],
  [
    'Anderson Furtado Oliveira',
    '08717146712',
    'anderson.furtado@kimoshiro.com',
    UserStatusEnum.PasswordReset,
    '2020-10-02T16:43',
    4,
    3,
  ],
  [
    'Andressa Carolina',
    '02717122109',
    'andressa.carolina@cilia.com.br',
    UserStatusEnum.Active,
    '2026-09-30T09:33',
    4,
    0,
  ],
  ['Anny Ribeiro', '05052387130', 'anny.ribeiro@cilia.com.br', UserStatusEnum.Active, null, 4, 0],
  ['Bruno Carvalho', '41239856701', 'bruno.carvalho@bradesco.com.br', UserStatusEnum.Active, '2026-10-19T17:40', 2, 1],
  ['Camila Rocha', '52310984766', 'camila.rocha@cilia.com.br', UserStatusEnum.Active, '2026-10-20T08:02', 4, 0],
  [
    'Carlos Eduardo Lima',
    '33019827655',
    'carlos.lima@portoseguro.com.br',
    UserStatusEnum.Active,
    '2026-10-18T10:15',
    10,
    1,
  ],
  ['Daniela Souza', '71820394588', 'daniela.souza@allianz.com.br', UserStatusEnum.Invited, null, 0, 1],
  ['Diego Santos', '62038419277', 'diego.santos@localiza.com', UserStatusEnum.Active, '2026-10-15T14:20', 7, 2],
  ['Eduarda Mendes', '91827364500', 'eduarda.mendes@hdi.com.br', UserStatusEnum.Inactive, '2025-12-01T09:00', 6, 3],
  [
    'Felipe Andrade',
    '28394017633',
    'felipe.andrade@tokiomarine.com.br',
    UserStatusEnum.Active,
    '2026-10-17T11:45',
    12,
    1,
  ],
  ['Fernanda Alves', '19283746500', 'fernanda.alves@cilia.com.br', UserStatusEnum.Active, '2026-10-20T07:55', 4, 0],
  [
    'Gabriel Costa',
    '84736251900',
    'gabriel.costa@movida.com.br',
    UserStatusEnum.PasswordReset,
    '2026-03-12T16:30',
    9,
    2,
  ],
  ['Gustavo Pereira', '37465829100', 'gustavo.pereira@arval.com.br', UserStatusEnum.Active, '2026-10-16T09:10', 1, 1],
  ['Helena Martins', '56473829100', 'helena.martins@caixaseguros.com.br', UserStatusEnum.Invited, null, 3, 4],
  ['Igor Costa', '65748392011', 'igor.costa@cilia.com.br', UserStatusEnum.Active, '2026-10-19T18:22', 4, 3],
  ['Juliana Prado', '74859302122', 'juliana.prado@sompo.com.br', UserStatusEnum.Active, '2026-10-14T13:05', 11, 1],
  ['Lucas Almeida', '85960413233', 'lucas.almeida@unidas.com.br', UserStatusEnum.Active, '2026-10-12T08:40', 13, 2],
  [
    'Mariana Souza',
    '96071524344',
    'mariana.souza@portoseguro.com.br',
    UserStatusEnum.Inactive,
    '2026-01-20T15:15',
    10,
    4,
  ],
  ['Otávio Ramos', '10293847566', 'otavio.ramos@bradesco.com.br', UserStatusEnum.Active, '2026-10-20T09:30', 2, 0],
  ['Patrícia Lima', '21304958677', 'patricia.lima@cilia.com.br', UserStatusEnum.Invited, null, 5, 2],
  ['Rafael Nunes', '32415069788', 'rafael.nunes@allianz.com.br', UserStatusEnum.Active, '2026-10-11T10:00', 0, 1],
  ['Renato Dias', '43526170899', 'renato.dias@mapfre.com.br', UserStatusEnum.Inactive, '2025-08-05T17:20', 8, 4],
];

/** [índice da conta, sistema, token, URL, ativo] — tokens do protótipo. */
const prototypeTokens: [number, string, string, string, boolean][] = [
  [
    1,
    'Geolocalização Arval',
    'FD81145CE9F1A876A79A2F80207FC073006A8202',
    'http://arval.dev.gestaoderede.com.br/geolocalizacao',
    true,
  ],
  [
    2,
    'Bradesco Geolocalização',
    '525EA6EF4AC8FFB3743E0EE9EBCF8527420C1803',
    'http://bradesco.dev.gestaoderede.com.br/geolocalizacao',
    true,
  ],
  [
    2,
    'Integrador Cilia',
    'FF95AA9288C66AC2DE7C3046217519B06D4C2EB8',
    'http://bradesco.dev.gestaoderede.com.br/api/eventos',
    true,
  ],
  [
    2,
    'INTRANET',
    '818D11D6C9AE587B9590CAAC8B77EE62F4DDD6B5',
    'http://bradesco.dev.gestaoderede.com.br/geolocalizacao/intranet',
    true,
  ],
  [
    2,
    'PLUSOFT',
    '1459765EF949B71F3418FACC1E4913E4EE9CF759',
    'http://bradesco.gestaoderede.com.br/geolocalizacao/plusoft',
    true,
  ],
  [
    0,
    'Portal Allianz',
    '9A3C55D10E7B2F48C61A0D93E5B7F2C8A14D6E03',
    'https://allianz.gestaoderede.com.br/api/oficinas',
    true,
  ],
  [
    3,
    'Sinistros Caixa',
    '0C7E19B4A2D85F36E9B1C4A70D2E8F5B63A9C1D7',
    'https://caixa.gestaoderede.com.br/api/sinistros',
    false,
  ],
  [
    6,
    'HDI Vistoria',
    '7B2E4D9A1C06F83E5A9D2B7C4E1F0A6D8B3C5E92',
    'https://hdi.gestaoderede.com.br/api/vistorias',
    true,
  ],
  [
    7,
    'Localiza Frota',
    'E4A1C8D2B7F05936A2E8D4C1B9F7A3E6D0C5B814',
    'https://localiza.gestaoderede.com.br/api/frota',
    true,
  ],
  [
    10,
    'Porto Referenciada',
    '3F8D2A6C1E9B47D05A3C8E2F6B1D9A4C7E0B5D26',
    'https://porto.gestaoderede.com.br/api/referenciada',
    true,
  ],
  [
    12,
    'Tokio Geolocalização',
    'C6B9E2A4D1F87035E9C2A6D4B8F1E3A7C0D5B249',
    'https://tokio.gestaoderede.com.br/geolocalizacao',
    false,
  ],
  [
    13,
    'Unidas Manutenção',
    'A2D7F1C9E4B03865D1A7C3E9F2B6D4A8C5E1B073',
    'https://unidas.gestaoderede.com.br/api/manutencao',
    true,
  ],
];

const SYSTEM_NAMES = ['Geolocalização', 'Sinistros', 'Vistoria', 'Referenciada', 'Manutenção', 'Intranet'];
const USER_STATUSES = Object.values(UserStatusEnum);

const buildAccounts = (): AccountEntity[] => {
  const random = createRandom(GENERATION_SEED);
  const generated = Array.from({ length: TOTAL_ACCOUNTS - prototypeAccounts.length }, (_, offset) => {
    const tradeName = `${pick(random, COMPANY_WORDS)} ${pick(random, COMPANY_SURNAMES)} ${offset + 1}`;
    return {
      legalName: `${tradeName} LTDA`,
      tradeName,
      document: `${digits(random, 8)}0001${digits(random, 2)}`,
      email: `contato${offset + 1}@${pick(random, EMAIL_DOMAINS)}`,
      isActive: random() > 0.1,
    };
  });
  return [
    ...prototypeAccounts.map(([legalName, tradeName, document, email, isActive]) => ({
      legalName,
      tradeName,
      document,
      email,
      isActive,
    })),
    ...generated,
  ].map((account, index) => ({
    id: `account-${index + 1}`,
    ...account,
    createdAt: toIso(`2024-01-${String((index % 28) + 1).padStart(2, '0')}T12:00`),
  }));
};

const buildProfiles = (): RegistrationsSeed['profiles'] =>
  [...prototypeProfiles, ...extraProfiles].map(([name, permissions], index) => ({
    id: `profile-${index + 1}`,
    name,
    permissions: [...permissions],
    createdAt: toIso(`2024-01-${String(index + 1).padStart(2, '0')}T12:00`),
  }));

const buildUsers = (accounts: AccountEntity[], profileCount: number): UserEntity[] => {
  const random = createRandom(GENERATION_SEED + 1);
  const prototype = prototypeUsers.map(([name, document, email, status, lastAccessAt, accountIndex, profileIndex]) => ({
    name,
    document,
    email,
    status,
    lastAccessAt: lastAccessAt ? toIso(lastAccessAt) : null,
    accountId: `account-${accountIndex + 1}`,
    profileId: `profile-${profileIndex + 1}`,
  }));
  const generated = Array.from({ length: TOTAL_USERS - prototype.length }, () => {
    const first = pick(random, FIRST_NAMES);
    const last = pick(random, LAST_NAMES);
    const status = pick(random, USER_STATUSES);
    const account = pick(random, accounts);
    return {
      name: `${first} ${last}`,
      document: cpf(random),
      email: `${first}.${last}@${pick(random, EMAIL_DOMAINS)}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, ''),
      status,
      lastAccessAt:
        status === UserStatusEnum.Invited || chance(random, 0.1)
          ? null
          : isoBetween(random, '2025-06-01T08:00:00.000Z', '2026-10-20T08:00:00.000Z'),
      accountId: account.id,
      profileId: `profile-${between(random, 1, profileCount)}`,
    };
  });
  return [...prototype, ...generated].map((user, index) => ({ id: `user-${index + 1}`, ...user }));
};

const buildTokens = (accounts: AccountEntity[]): IntegrationTokenEntity[] => {
  const random = createRandom(GENERATION_SEED + 2);
  const prototype = prototypeTokens.map(([accountIndex, system, token, url, isActive], index) => {
    const account = accounts[accountIndex];
    return {
      id: `token-${index + 1}`,
      accountId: `account-${accountIndex + 1}`,
      accountName: account?.tradeName ?? '',
      system,
      token,
      url,
      isActive,
      createdAt: toIso(`2025-01-${String((index % 28) + 1).padStart(2, '0')}T12:00`),
    };
  });
  const generated = Array.from({ length: TOTAL_TOKENS - prototype.length }, (_, offset) => {
    const account = pick(random, accounts);
    const system = `${pick(random, SYSTEM_NAMES)} ${account.tradeName.split(' ')[0]}`;
    return {
      id: `token-${prototype.length + offset + 1}`,
      accountId: account.id,
      accountName: account.tradeName,
      system,
      token: Array.from({ length: 40 }, () => between(random, 0, 15).toString(16))
        .join('')
        .toUpperCase(),
      url: `https://${account.tradeName.split(' ')[0]?.toLowerCase() ?? 'api'}.gestaoderede.com.br/api/${system.split(' ')[0]?.toLowerCase() ?? 'api'}`,
      isActive: random() > 0.15,
      createdAt: isoBetween(random, '2025-01-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z'),
    };
  });
  return [...prototype, ...generated];
};

/** Contas, perfis, usuários e tokens de integração. Protótipo primeiro, depois dados gerados. */
export const buildRegistrationsSeed = (): RegistrationsSeed => {
  const accounts = buildAccounts();
  const profiles = buildProfiles();
  return {
    accounts,
    profiles,
    users: buildUsers(accounts, profiles.length),
    tokens: buildTokens(accounts),
  };
};
