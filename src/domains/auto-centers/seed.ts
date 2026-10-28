import { CITIES } from '#seed/cities';
import { COMPANY_SURNAMES, PROVIDER_TRADE_WORDS } from '#seed/names';
import { addDays, cnpj, createRandom, digits, pick } from '#seed/random';
import type { AutoCenterEntity } from './contracts';
import { AutoCenterCategoryEnum, AutoCenterStatusEnum } from './enums';

/** [nome fantasia, razão social, CNPJ, telefone, cidade, UF, categoria, avaliação, aceita guincho, ativo] */
type AutoCenterRow = [
  string,
  string,
  string,
  string,
  string,
  string,
  AutoCenterCategoryEnum,
  number | null,
  boolean,
  boolean,
];

const TOTAL = 120;
const GENERATION_SEED = 20261030;

// Registros do protótipo (tela antiga de centros automotivos e cadastros de teste).
const prototypeRows: AutoCenterRow[] = [
  [
    '27313750000170',
    '27313750000170',
    '27313750000170',
    '12312312312',
    'Arapiraca',
    'AL',
    AutoCenterCategoryEnum.QuickService,
    null,
    false,
    true,
  ],
  [
    'posthog2',
    'teste posthog2',
    '77522853000118',
    '62999999999',
    'Goiânia',
    'GO',
    AutoCenterCategoryEnum.Tires,
    null,
    false,
    true,
  ],
  [
    'PostHog teste',
    'PostHog teste',
    '14322252000141',
    '62999999999',
    'Goiânia',
    'GO',
    AutoCenterCategoryEnum.Tires,
    null,
    false,
    true,
  ],
  [
    'SMS Sinch',
    'SMS Sinch',
    '18796009000116',
    '62991295908',
    'Goiânia',
    'GO',
    AutoCenterCategoryEnum.Alignment,
    null,
    false,
    true,
  ],
  [
    'teste',
    'teste',
    '78515253000195',
    '62985556558',
    'Goiânia',
    'GO',
    AutoCenterCategoryEnum.QuickService,
    null,
    false,
    true,
  ],
  [
    'teste 2',
    'teste 2',
    '16504758000105',
    '62958585885',
    'Goiânia',
    'GO',
    AutoCenterCategoryEnum.Detailing,
    null,
    false,
    true,
  ],
  [
    'Teste Centro Automotivo',
    'Teste Centro Automotivo',
    '83732339000100',
    '62958685658',
    'Goiânia',
    'GO',
    AutoCenterCategoryEnum.QuickService,
    null,
    false,
    true,
  ],
  [
    'Auto Center Pinheiros',
    'Pinheiros Serviços Automotivos LTDA',
    '61938472000133',
    '1138124400',
    'São Paulo',
    'SP',
    AutoCenterCategoryEnum.Tires,
    4.6,
    true,
    true,
  ],
  [
    'Centro Automotivo Sul',
    'Sul Centro Automotivo EIRELI',
    '58273914000155',
    '5133442211',
    'Porto Alegre',
    'RS',
    AutoCenterCategoryEnum.Alignment,
    3.8,
    true,
    true,
  ],
  [
    'Hiper Car Revisões',
    'Hiper Car Comércio e Serviços LTDA',
    '87152649000123',
    '6232026677',
    'Goiânia',
    'GO',
    AutoCenterCategoryEnum.QuickService,
    4.2,
    true,
    true,
  ],
  [
    'Ipê Amarelo Auto Center',
    'Ipê Amarelo Pneus LTDA',
    '98263751000106',
    '6134567788',
    'Brasília',
    'DF',
    AutoCenterCategoryEnum.Tires,
    2.9,
    false,
    false,
  ],
  [
    'Brilho Total Estética',
    'Brilho Total Estética Automotiva LTDA',
    '45182736000194',
    '6232548899',
    'Anápolis',
    'GO',
    AutoCenterCategoryEnum.Detailing,
    4.9,
    false,
    true,
  ],
  [
    'Rota Auto Center',
    'Rota Serviços Automotivos LTDA',
    '36518294000177',
    '3132219988',
    'Belo Horizonte',
    'MG',
    AutoCenterCategoryEnum.Alignment,
    4,
    true,
    true,
  ],
  [
    'Speed Pneus Campinas',
    'Speed Pneus e Rodas LTDA',
    '52963184000141',
    '19998887766',
    'Campinas',
    'SP',
    AutoCenterCategoryEnum.Tires,
    3.5,
    true,
    true,
  ],
  [
    'Vale Auto Center',
    'Vale do Paraíba Automotivos LTDA',
    '24817369000108',
    '1239414455',
    'São José dos Campos',
    'SP',
    AutoCenterCategoryEnum.QuickService,
    null,
    false,
    false,
  ],
];

const categories = Object.values(AutoCenterCategoryEnum);

const generateRows = (count: number): AutoCenterRow[] => {
  const random = createRandom(GENERATION_SEED);
  return Array.from({ length: count }, (): AutoCenterRow => {
    const city = pick(random, CITIES);
    const name = `${pick(random, PROVIDER_TRADE_WORDS)} ${pick(random, COMPANY_SURNAMES)}`;
    const hasRating = random() > 0.2;
    return [
      name,
      `${name} ${pick(random, COMPANY_SURNAMES)} LTDA`,
      cnpj(random),
      `${city.ddd}${digits(random, 8)}`,
      city.city,
      city.state,
      pick(random, categories),
      hasRating ? Math.round((2 + random() * 3) * 10) / 10 : null,
      random() > 0.6,
      random() > 0.1,
    ];
  });
};

const toEntity = (row: AutoCenterRow, index: number): AutoCenterEntity => {
  const [name, legalName, document, phone, city, state, category, rating, acceptsTowing, isActive] = row;
  return {
    id: `auto-center-${index + 1}`,
    name,
    legalName,
    document,
    phone,
    city,
    state,
    category,
    rating,
    acceptsTowing,
    status: isActive ? AutoCenterStatusEnum.Active : AutoCenterStatusEnum.Inactive,
    createdAt: addDays('2026-01-01T12:00:00.000Z', index),
  };
};

/** 120 centros automotivos: os do protótipo primeiro, depois gerados com semente fixa. */
export const buildAutoCenterSeed = (): AutoCenterEntity[] =>
  [...prototypeRows, ...generateRows(TOTAL - prototypeRows.length)].map(toEntity);
