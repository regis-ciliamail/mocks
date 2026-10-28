import { FIRST_NAMES, LAST_NAMES, WORKSHOP_PREFIXES, WORKSHOP_SUFFIXES } from '#seed/names';
import { addDays, between, chance, cnpj, createRandom, isoBetween, pick, pickSome } from '#seed/random';
import type { RatingAnswer, RatingRequestEntity } from './contracts';
import { RatingChannelEnum, RatingStatusEnum, RatingTargetKindEnum } from './enums';

/** [estabelecimento, CNPJ, cliente, código, status, envio | null, visualização | null, resposta | null] */
type RatingRow = [string, string, string, string, RatingStatusEnum, string | null, string | null, RatingAnswer | null];

const TOTAL = 400;
const GENERATION_SEED = 20261031;
const { Email, Sms } = RatingChannelEnum;
const { Pending, Sent, Responded, Error: Failed } = RatingStatusEnum;

const answer = (score: number, stars: number, comment: string, channel = Email): RatingAnswer => ({
  score,
  stars,
  comment,
  channel,
});

// Pesquisas de oficinas do protótipo (tela antiga de avaliações de oficinas).
const workshopRows: RatingRow[] = [
  [
    '10012 Reparações',
    '36319197000173',
    'Teste',
    '3254',
    Responded,
    '2026-10-09T13:48',
    '2026-10-09T13:48',
    answer(10, 5, 'Serviço rápido e carro entregue limpo.'),
  ],
  [
    '10012 Reparações',
    '36319197000173',
    'Teste Cliente',
    '321654',
    Responded,
    '2026-10-15T18:17',
    '2026-10-15T18:19',
    answer(9, 5, 'Atendimento muito bom, recomendo.'),
  ],
  ['Bahia Oficinas', '24674271000190', 'Andressa Carolina', 'q2', Sent, '2026-07-29T16:57', '2026-07-29T16:57', null],
  ['Ciliateste2', '32124377000149', 'Cliente', '123123', Sent, '2026-10-09T13:41', '2026-10-09T13:41', null],
  [
    'Sincar Funilaria e Pintura',
    '36445060000165',
    'Andressa Carolina',
    '23erwer',
    Sent,
    '2026-07-20T17:03',
    '2026-07-20T17:03',
    null,
  ],
  ['SMS Sinch', '18796009000116', 'Andressa Carolina', '010101010410', Sent, '2026-05-22T16:49', null, null],
  ['SMS Sinch', '18796009000116', 'Igor', '30125151', Sent, '2026-05-22T17:00', null, null],
  [
    'Auto Center Aliança',
    '12345678000121',
    'Marcos Vinícius',
    'SIN-48211',
    Responded,
    '2026-10-02T10:12',
    '2026-10-02T19:40',
    answer(8, 4, 'Demorou um dia a mais que o combinado.', Sms),
  ],
  [
    'Box Car Reparos Automotivos',
    '23816504000157',
    'Juliana Prado',
    'SIN-48230',
    Responded,
    '2026-09-28T09:05',
    '2026-09-29T08:31',
    answer(6, 3, 'Peça veio errada na primeira vez.'),
  ],
  ['Centro Automotivo Diamante', '31274689000109', 'Rafael Nunes', 'SIN-48302', Pending, null, null, null],
  ['Elite Funilaria e Pintura', '42593871000164', 'Patrícia Lima', 'SIN-48345', Failed, '2026-10-12T14:20', null, null],
  [
    'Forte Car Oficina',
    '16985237000148',
    'Bruno Carvalho',
    'SIN-48377',
    Responded,
    '2026-10-05T11:44',
    '2026-10-05T12:10',
    answer(10, 5, 'Excelente!', Sms),
  ],
  [
    'Garagem Auto Center',
    '53921640000108',
    'Camila Rocha',
    'SIN-48410',
    Sent,
    '2026-10-14T15:02',
    '2026-10-14T18:22',
    null,
  ],
  ['Master Auto Service', '27148956000132', 'Diego Santos', 'SIN-48419', Pending, null, null, null],
  [
    'Nova Era Funilaria e Pintura',
    '28614975000141',
    'Fernanda Alves',
    'SIN-48455',
    Responded,
    '2026-09-30T08:15',
    '2026-10-01T09:00',
    answer(4, 2, 'Precisei voltar para refazer a pintura.'),
  ],
  [
    'Oficina Mecânica Horizonte',
    '42763851000126',
    'Gustavo Pereira',
    'SIN-48501',
    Sent,
    '2026-10-16T10:30',
    null,
    null,
  ],
  ['Prime Motors Oficina', '35609412000195', 'Helena Martins', 'SIN-48522', Failed, '2026-10-17T09:48', null, null],
  [
    'Speed Car Reparações',
    '19485327000174',
    'Igor Costa',
    'SIN-48560',
    Responded,
    '2026-10-18T16:05',
    '2026-10-18T16:40',
    answer(9, 4, 'Tudo certo.', Sms),
  ],
];

// Pesquisas de centros automotivos do protótipo.
const autoCenterRows: RatingRow[] = [
  ['SMS Sinch', '18796009000116', 'Andressa Carolina', '0101', Sent, '2026-05-22T15:36', null, null],
  ['SMS Sinch', '18796009000116', 'Andressa Carolina', '0102', Sent, '2026-05-22T15:36', null, null],
  [
    'Pneus & Cia Goiânia',
    '47185236000190',
    'Lucas Almeida',
    'CA-1101',
    Responded,
    '2026-10-03T09:10',
    '2026-10-03T12:00',
    answer(10, 5, 'Alinhamento ficou perfeito.', Sms),
  ],
  [
    'Centro Automotivo Sul',
    '58273914000155',
    'Mariana Souza',
    'CA-1124',
    Responded,
    '2026-10-08T14:00',
    '2026-10-09T08:20',
    answer(7, 4, 'Bom, mas a fila estava grande.'),
  ],
  ['Auto Center Pinheiros', '61938472000133', 'Otávio Ramos', 'CA-1150', Pending, null, null, null],
  ['Ipê Amarelo Auto Center', '98263751000106', 'Paula Teixeira', 'CA-1172', Failed, '2026-10-13T10:45', null, null],
  [
    'Hiper Car Revisões',
    '87152649000123',
    'Renato Dias',
    'CA-1190',
    Sent,
    '2026-10-19T17:30',
    '2026-10-19T18:02',
    null,
  ],
];

const COMMENTS = [
  'Serviço rápido e carro entregue limpo.',
  'Atendimento muito bom, recomendo.',
  'Demorou mais do que o combinado.',
  'Peça veio errada na primeira vez.',
  'Preço justo e prazo cumprido.',
  'Precisei voltar para ajustes.',
  'Tudo certo.',
  'Orçamento claro e sem surpresas.',
  'Funcionário muito atencioso.',
  'Fila grande no atendimento.',
];

/** Datas do protótipo vêm sem segundos e sem fuso (`AAAA-MM-DDTHH:mm`), em UTC. */
const toIso = (value: string | null): string | null => (value ? `${value}:00.000Z` : null);

const toEntity = (targetKind: RatingTargetKindEnum, row: RatingRow, index: number): RatingRequestEntity => {
  const [providerName, providerDocument, customerName, customerCode, status, sentAt, viewedAt, ratingAnswer] = row;
  return {
    id: `rating-${index + 1}`,
    targetKind,
    providerName,
    providerDocument,
    customerName,
    customerCode,
    status,
    channels: index % 5 === 4 ? [Email] : [Email, Sms],
    sentAt: toIso(sentAt),
    viewedAt: toIso(viewedAt),
    answer: ratingAnswer ? { ...ratingAnswer } : null,
  };
};

const generateEntities = (count: number, startIndex: number): RatingRequestEntity[] => {
  const random = createRandom(GENERATION_SEED);
  return Array.from({ length: count }, (_, offset): RatingRequestEntity => {
    const index = startIndex + offset;
    const targetKind = chance(random, 0.7) ? RatingTargetKindEnum.Workshop : RatingTargetKindEnum.AutoCenter;
    const roll = random();
    const status = roll < 0.08 ? Pending : roll < 0.3 ? Sent : roll < 0.9 ? Responded : Failed;
    const sentAt =
      status === Pending ? null : isoBetween(random, '2026-01-02T08:00:00.000Z', '2026-10-20T18:00:00.000Z');
    const score = between(random, 0, 10);
    const channels = pickSome(random, [Email, Sms], between(random, 1, 2));
    const providerName = `${pick(random, WORKSHOP_PREFIXES)} ${pick(random, WORKSHOP_SUFFIXES)}`;
    return {
      id: `rating-${index + 1}`,
      targetKind,
      providerName,
      providerDocument: cnpj(random),
      customerName: `${pick(random, FIRST_NAMES)} ${pick(random, LAST_NAMES)}`,
      customerCode: `SIN-${between(random, 10000, 99999)}`,
      status,
      channels,
      sentAt,
      viewedAt:
        status === Responded || (status === Sent && chance(random, 0.4))
          ? addDays(sentAt ?? '', between(random, 0, 3))
          : null,
      answer:
        status === Responded
          ? answer(
              score,
              Math.max(1, Math.min(5, Math.round(score / 2))),
              pick(random, COMMENTS),
              pick(random, channels),
            )
          : null,
    };
  });
};

/** 400 pesquisas: as do protótipo primeiro, depois geradas com semente fixa. */
export const buildRatingSeed = (): RatingRequestEntity[] => {
  const prototype = [
    ...workshopRows.map((row, index) => toEntity(RatingTargetKindEnum.Workshop, row, index)),
    ...autoCenterRows.map((row, index) => toEntity(RatingTargetKindEnum.AutoCenter, row, workshopRows.length + index)),
  ];
  return [...prototype, ...generateEntities(TOTAL - prototype.length, prototype.length)];
};
