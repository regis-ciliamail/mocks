import { CITIES } from '#seed/cities';
import { WORKSHOP_PREFIXES, WORKSHOP_SUFFIXES } from '#seed/names';
import { between, chance, cnpj, createRandom, isoBetween, pick, addDays } from '#seed/random';
import type { ReportsSeed } from './repository';
import type { WorkshopCredit, WorkshopStatusEntry } from './contracts';

const GENERATION_SEED = 20261036;
const TOTAL_STATUS_ENTRIES = 200;
const TOTAL_CREDITS = 100;

const toIso = (value: string): string => `${value}:00.000Z`;

/** [nome fantasia, razão social, CNPJ, cidade, UF] — oficinas do protótipo do relatório de status. */
const prototypeWorkshops: [string, string, string, string, string][] = [
  ['12.521.113/0001-11', '12.521.113/0001-11', '12521113000111', 'Goiânia', 'GO'],
  ['FLA OFICINAS', 'FLA OFICINAS', '54912652000121', 'Goiânia', 'GO'],
  ['Nome Fantasia Que Tambem Passa Muito De Cinquenta', 'Oficina Com Um Nome Muito Grande Que Passa De Cinq', '55558562000147', 'São Paulo', 'SP'],
  ['Oficina API Integração', 'Oficina API Colaboradores', '36928346000100', 'São Paulo', 'SP'],
  ['10012 Reparações', '10012 Reparações Automotivas LTDA', '36319197000173', 'Goiânia', 'GO'],
  ['Auto Center Aliança', 'Aliança Serviços Automotivos LTDA', '12345678000121', 'Anápolis', 'GO'],
  ['Bahia Oficinas', 'Bahia Oficinas Mecânicas LTDA', '24674271000190', 'Salvador', 'BA'],
  ['Box Car Reparos Automotivos', 'Box Car Reparos LTDA', '23816504000157', 'Goiânia', 'GO'],
  ['Centro Automotivo Diamante', 'Diamante Centro Automotivo EIRELI', '31274689000109', 'Brasília', 'DF'],
  ['Elite Funilaria e Pintura', 'Elite Funilaria e Pintura LTDA', '42593871000164', 'Goiânia', 'GO'],
  ['Forte Car Oficina', 'Forte Car Serviços LTDA', '16985237000148', 'Campinas', 'SP'],
  ['Garagem Auto Center', 'Garagem Auto Center LTDA', '53921640000108', 'Goiânia', 'GO'],
  ['Master Auto Service', 'Master Auto Service LTDA', '27148956000132', 'Belo Horizonte', 'MG'],
  ['Nova Era Funilaria e Pintura', 'Nova Era Funilaria LTDA', '28614975000141', 'Goiânia', 'GO'],
  ['Oficina Mecânica Horizonte', 'Horizonte Mecânica LTDA', '42763851000126', 'Belo Horizonte', 'MG'],
  ['Prime Motors Oficina', 'Prime Motors Serviços LTDA', '35609412000195', 'São Paulo', 'SP'],
  ['Sincar Funilaria e Pintura', 'Sincar Funilaria e Pintura LTDA', '36445060000165', 'Goiânia', 'GO'],
  ['Speed Car Reparações', 'Speed Car Reparações LTDA', '19485327000174', 'Curitiba', 'PR'],
  ['Turbo Mecânica', 'Turbo Mecânica Automotiva LTDA', '61827394000106', 'Goiânia', 'GO'],
  ['Oficina do Zé', 'José Carlos Reparos ME', '74619283000125', 'Aparecida de Goiânia', 'GO'],
  ['Pit Stop Reparos', 'Pit Stop Reparos Automotivos LTDA', '29374816000157', 'Brasília', 'DF'],
  ['Rota Mecânica', 'Rota Mecânica e Elétrica LTDA', '36518294000177', 'Belo Horizonte', 'MG'],
  ['Mecânica Central', 'Mecânica Central de Goiás LTDA', '17293846000113', 'Goiânia', 'GO'],
  ['Funilaria Estrela', 'Estrela Funilaria e Pintura LTDA', '62918374000146', 'São Paulo', 'SP'],
  ['Oficina Boa Viagem', 'Boa Viagem Reparos LTDA', '82736194000182', 'Recife', 'PE'],
  ['Auto Elétrica Faísca', 'Faísca Auto Elétrica ME', '38471629000180', 'Goiânia', 'GO'],
  ['Reparadora Sul', 'Reparadora Sul Automotiva LTDA', '56391827000110', 'Porto Alegre', 'RS'],
  ['Oficina Cerrado', 'Cerrado Mecânica Diesel LTDA', '43729186000165', 'Rio Verde', 'GO'],
  ['Mecânica Paulista', 'Mecânica Paulista LTDA', '46281937000118', 'Campinas', 'SP'],
  ['Lanternagem Nordeste', 'Nordeste Lanternagem LTDA', '18392746000170', 'Recife', 'PE'],
  ['Oficina Pinheiros', 'Pinheiros Reparos Automotivos LTDA', '61938472000133', 'São Paulo', 'SP'],
  ['Mecânica Vale', 'Vale do Paraíba Mecânica LTDA', '24817369000108', 'São José dos Campos', 'SP'],
  ['Oficina Litoral', 'Litoral Reparos Automotivos LTDA', '92736418000197', 'Florianópolis', 'SC'],
  ['Car Service Brasília', 'Car Service Brasília LTDA', '35172948000111', 'Brasília', 'DF'],
  ['Auto Reparos Uberlândia', 'Uberlândia Auto Reparos LTDA', '71938264000188', 'Uberlândia', 'MG'],
  ['Oficina Joinville', 'Joinville Reparos LTDA', '35918274000149', 'Joinville', 'SC'],
];

/** Data da última mudança e situação (referenciada ou não), na mesma ordem das oficinas. */
const prototypeChanges: [string, boolean][] = [
  ['2026-05-06T18:06', true], ['2026-09-14T09:36', true], ['2026-05-15T10:13', true], ['2026-06-01T18:43', true],
  ['2026-05-02T09:10', true], ['2026-05-03T10:20', true], ['2026-05-04T11:30', true], ['2026-05-05T14:00', true],
  ['2026-05-07T09:45', true], ['2026-05-08T16:15', true], ['2026-05-11T08:30', true], ['2026-05-12T13:50', true],
  ['2026-05-13T10:05', true], ['2026-05-14T15:40', true], ['2026-05-18T09:00', true], ['2026-05-19T11:25', true],
  ['2026-05-20T17:10', true], ['2026-05-21T08:55', true], ['2026-05-22T14:35', true], ['2026-05-25T10:00', true],
  ['2026-05-26T16:45', true], ['2026-05-27T09:30', false], ['2026-05-28T13:20', false], ['2026-06-03T10:10', true],
  ['2026-06-08T15:00', true], ['2026-06-15T09:40', true], ['2026-06-22T11:15', true], ['2026-06-29T16:30', true],
  ['2026-06-30T10:50', false], ['2026-10-02T09:15', true], ['2026-10-09T14:05', true], ['2026-10-16T10:40', true],
  ['2026-10-19T17:20', false], ['2025-03-10T10:00', true], ['2025-03-18T15:30', true], ['2025-03-25T09:20', false],
];

/** [nome fantasia, razão social, CNPJ, crédito, contratação, última parcela, procuração] */
const prototypeCredits: [string, string, string, number, string, string, boolean][] = [
  ['10012 Reparações', '10012 Reparações Automotivas LTDA', '36319197000173', 45000, '2026-09-18T10:00', '2027-09-18T10:00', true],
  ['FLA OFICINAS', 'FLA OFICINAS', '54912652000121', 18000, '2026-08-05T10:00', '2027-02-05T10:00', true],
  ['Bahia Oficinas', 'Bahia Oficinas Mecânicas LTDA', '24674271000190', 32500, '2026-07-22T10:00', '2027-07-22T10:00', false],
  ['Elite Funilaria e Pintura', 'Elite Funilaria e Pintura LTDA', '42593871000164', 60000, '2026-06-10T10:00', '2028-06-10T10:00', true],
  ['Forte Car Oficina', 'Forte Car Serviços LTDA', '16985237000148', 12000, '2026-04-02T10:00', '2026-12-02T10:00', true],
  ['Master Auto Service', 'Master Auto Service LTDA', '27148956000132', 25000, '2026-02-14T10:00', '2027-02-14T10:00', false],
  ['Speed Car Reparações', 'Speed Car Reparações LTDA', '19485327000174', 8500, '2025-11-28T10:00', '2026-05-28T10:00', true],
  ['Garagem Auto Center', 'Garagem Auto Center LTDA', '53921640000108', 40000, '2025-09-03T10:00', '2027-09-03T10:00', true],
];

/** Oficinas e créditos: protótipo primeiro, depois dados gerados com semente fixa. */
export const buildReportsSeed = (): ReportsSeed => {
  const random = createRandom(GENERATION_SEED);
  const statusPrototype: WorkshopStatusEntry[] = prototypeWorkshops.map(([name, legalName, document, city, state], index) => {
    const [changedAt, isReferenced] = prototypeChanges[index] ?? ['2026-01-01T12:00', true];
    return {
      id: `workshop-status-${index + 1}`,
      name,
      legalName,
      document,
      city,
      state,
      isReferenced,
      changedAt: toIso(changedAt),
    };
  });
  const statusGenerated: WorkshopStatusEntry[] = Array.from({ length: TOTAL_STATUS_ENTRIES - statusPrototype.length }, (_, offset) => {
    const city = pick(random, CITIES);
    const name = `${pick(random, WORKSHOP_PREFIXES)} ${pick(random, WORKSHOP_SUFFIXES)}`;
    return {
      id: `workshop-status-${statusPrototype.length + offset + 1}`,
      name,
      legalName: `${name} LTDA`,
      document: cnpj(random),
      city: city.city,
      state: city.state,
      isReferenced: chance(random, 0.7),
      changedAt: isoBetween(random, '2025-01-01T00:00:00.000Z', '2026-10-20T00:00:00.000Z'),
    };
  });
  const creditPrototype: WorkshopCredit[] = prototypeCredits.map(([name, legalName, document, amount, contractedAt, lastInstallmentAt, hasPowerOfAttorney], index) => ({
    id: `workshop-credit-${index + 1}`,
    name,
    legalName,
    document,
    amount,
    contractedAt: toIso(contractedAt.slice(0, 16)),
    lastInstallmentAt: toIso(lastInstallmentAt.slice(0, 16)),
    hasPowerOfAttorney,
  }));
  const creditGenerated: WorkshopCredit[] = Array.from({ length: TOTAL_CREDITS - creditPrototype.length }, (_, offset) => {
    const name = `${pick(random, WORKSHOP_PREFIXES)} ${pick(random, WORKSHOP_SUFFIXES)}`;
    const contractedAt = isoBetween(random, '2025-06-01T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
    return {
      id: `workshop-credit-${creditPrototype.length + offset + 1}`,
      name,
      legalName: `${name} LTDA`,
      document: cnpj(random),
      amount: between(random, 5, 90) * 1000,
      contractedAt,
      lastInstallmentAt: addInstallments(contractedAt, between(random, 6, 24)),
      hasPowerOfAttorney: chance(random, 0.6),
    };
  });
  return {
    statusEntries: [...statusPrototype, ...statusGenerated],
    credits: [...creditPrototype, ...creditGenerated],
  };
};

const addInstallments = (contractedAt: string, months: number): string => addDays(contractedAt, months * 30);
