import { CITIES, findCity } from '#seed/cities';
import { WORKSHOP_PREFIXES, WORKSHOP_SUFFIXES } from '#seed/names';
import { addDays, between, cnpj, createRandom, mobilePhone, pick } from '#seed/random';
import type { ServiceProviderEntity } from './contracts';
import {
  BudgetingSystemEnum,
  OccupationLevelEnum,
  ServiceProviderKindEnum,
  ServiceProviderStatusEnum,
  SpecialProgramEnum,
  WorkshopTypeEnum,
} from './enums';

/** [nome, CNPJ, telefone, cidade, UF, referenciada, avaliação, pont. atual, pont. total, ativa] */
type WorkshopRow = [string, string, string, string, string, boolean, number, number, number, boolean];

// Oficinas do layout do protótipo GERE (tela de Oficinas, 3 páginas).
const prototypeWorkshops: WorkshopRow[] = [
  ['Auto Center Aliança', '12345678000121', '5562991345678', 'Goiânia', 'GO', true, 4, 93, 91, true],
  ['Auto Mecânica Bandeirantes', '18472915000183', '5519992473186', 'Campinas', 'SP', true, 4, 85, 83, false],
  ['Box Car Reparos Automotivos', '23816504000157', '5541998537241', 'Curitiba', 'PR', false, 4, 90, 90, true],
  ['Centro Automotivo Diamante', '31274689000109', '5531997264835', 'Belo Horizonte', 'MG', true, 4, 96, 92, true],
  ['Elite Funilaria e Pintura', '42593871000164', '5571993816254', 'Salvador', 'BA', true, 4, 93, 91, true],
  ['Forte Car Oficina', '16985237000148', '5548996427138', 'Florianópolis', 'SC', true, 4, 85, 88, true],
  ['Garagem Auto Center', '53921640000108', '5521994753628', 'Rio de Janeiro', 'RJ', true, 4, 94, 92, false],
  ['Master Auto Service', '27148956000132', '5581995318472', 'Recife', 'PE', false, 4, 88, 87, false],
  ['Nova Era Funilaria e Pintura', '28614975000141', '5551992684357', 'Porto Alegre', 'RS', false, 4, 82, 85, true],
  ['Oficina Mecânica Horizonte', '42763851000126', '5561998145726', 'Brasília', 'DF', true, 4, 97, 95, false],
  ['Prime Motors Oficina', '35609412000195', '5585997436812', 'Fortaleza', 'CE', true, 4, 93, 93, true],
  ['Speed Car Reparações', '19485327000174', '5511996275143', 'São Paulo', 'SP', false, 4, 89, 91, true],
  ['Tork Mecânica Diesel', '47185236000190', '5592991827364', 'Manaus', 'AM', true, 5, 98, 96, true],
  ['Unidos Auto Peças e Serviços', '58273914000155', '5591993645182', 'Belém', 'PA', false, 3, 74, 78, true],
  ['Vale Verde Reparação Automotiva', '61938472000133', '5527992736451', 'Vitória', 'ES', true, 4, 87, 86, true],
  ['Wagner Auto Elétrica', '72418593000117', '5584994817263', 'Natal', 'RN', false, 2, 65, 70, false],
  ['Xodó Funilaria Artesanal', '83925164000102', '5567995183746', 'Campo Grande', 'MS', true, 5, 95, 94, true],
  ['Zona Sul Car Center', '94137285000189', '5521997362815', 'Rio de Janeiro', 'RJ', true, 4, 91, 89, true],
  ['Alfa Retífica de Motores', '10592837000146', '5565993847162', 'Cuiabá', 'MT', false, 3, 79, 81, true],
  ['Barão Auto Vidros', '21837465000128', '5543994726183', 'Londrina', 'PR', true, 4, 86, 84, true],
  ['Cerrado Oficina Mecânica', '32748196000177', '5534992618374', 'Uberlândia', 'MG', false, 3, 77, 80, false],
  ['Delta Freios e Suspensão', '43619275000150', '5511995827364', 'São Paulo', 'SP', true, 5, 99, 97, true],
  ['Estrela Martelinho de Ouro', '54728316000194', '5562993728461', 'Goiânia', 'GO', true, 4, 92, 90, true],
  ['Ferraz Câmbio Automático', '65839427000161', '5519998374615', 'Campinas', 'SP', false, 3, 80, 79, true],
  ['Grand Prix Oficina', '76941538000140', '5541996283745', 'Curitiba', 'PR', true, 4, 89, 88, false],
  ['Hiper Car Revisões', '87152649000123', '5531993847261', 'Belo Horizonte', 'MG', true, 4, 90, 92, true],
  ['Ipê Amarelo Auto Center', '98263751000106', '5561992736184', 'Brasília', 'DF', false, 2, 68, 72, true],
  ['Jacarandá Pintura Automotiva', '19374862000185', '5571994827315', 'Salvador', 'BA', true, 4, 88, 86, true],
  ['Kart Center Manutenção', '20485973000168', '5548993726148', 'Florianópolis', 'SC', false, 3, 76, 77, false],
  ['Litoral Auto Service', '31596084000142', '5581992637481', 'Recife', 'PE', true, 5, 96, 95, true],
  ['Mundial Auto Mecânica', '42607195000129', '5551994726183', 'Porto Alegre', 'RS', true, 4, 87, 89, true],
];

const workshopTypeSets: WorkshopTypeEnum[][] = [
  [WorkshopTypeEnum.Mechanics],
  [WorkshopTypeEnum.BodyAndPaint],
  [WorkshopTypeEnum.Mechanics, WorkshopTypeEnum.Electrical],
  [WorkshopTypeEnum.BodyAndPaint, WorkshopTypeEnum.Glass],
  [WorkshopTypeEnum.Mechanics, WorkshopTypeEnum.BodyAndPaint, WorkshopTypeEnum.Electrical],
];
const occupations = [OccupationLevelEnum.Low, OccupationLevelEnum.Medium, OccupationLevelEnum.High];
const budgetingSystems = [
  BudgetingSystemEnum.Cilia,
  BudgetingSystemEnum.Cilia,
  BudgetingSystemEnum.Audatex,
  BudgetingSystemEnum.Orion,
];
const specialPrograms: (SpecialProgramEnum | null)[] = [
  null,
  SpecialProgramEnum.Partner,
  null,
  SpecialProgramEnum.Premium,
  null,
];

const TOTAL_WORKSHOPS = 300;
const GENERATION_SEED = 20261028;

/** Atributos de filtro distribuídos pelo índice: cada carga gera as mesmas combinações. */
const byIndex = <T>(values: readonly T[], index: number): T => {
  const value = values[index % values.length];
  if (value === undefined) throw new Error('byIndex: lista vazia.');
  return value;
};

const toEntity = (row: WorkshopRow, index: number): ServiceProviderEntity => {
  const [name, document, phone, city, state, isReferenced, rating, currentScore, totalScore, isActive] = row;
  const coordinates = findCity(city, state);
  const createdAt = addDays('2025-01-01T12:00:00.000Z', (index * 17) % 600);
  return {
    id: `provider-${index + 1}`,
    name,
    document,
    phone,
    kind: ServiceProviderKindEnum.Workshop,
    status: isActive ? ServiceProviderStatusEnum.Active : ServiceProviderStatusEnum.Inactive,
    location: {
      country: 'BR',
      city,
      state,
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
    },
    isReferenced,
    rating,
    currentScore,
    totalScore,
    workshopTypes: [...byIndex(workshopTypeSets, index)],
    occupation: byIndex(occupations, index),
    budgetingSystem: byIndex(budgetingSystems, index),
    specialProgram: byIndex(specialPrograms, index),
    hasImageInspection: index % 3 !== 0,
    hasSupply: index % 2 === 0,
    createdAt,
    updatedAt: addDays(createdAt, (index % 4) * 30),
  };
};

const generateWorkshopRows = (count: number): WorkshopRow[] => {
  const random = createRandom(GENERATION_SEED);
  return Array.from({ length: count }, (): WorkshopRow => {
    const city = pick(random, CITIES);
    const rating = between(random, 4, 10) / 2;
    return [
      `${pick(random, WORKSHOP_PREFIXES)} ${pick(random, WORKSHOP_SUFFIXES)}`,
      cnpj(random),
      mobilePhone(random, city.ddd),
      city.city,
      city.state,
      random() > 0.35,
      rating,
      between(random, 60, 100),
      between(random, 60, 100),
      random() > 0.12,
    ];
  });
};

/** 300 oficinas: as 33 do protótipo primeiro, depois registros gerados com semente fixa. */
export const buildServiceProviderSeed = (): ServiceProviderEntity[] => {
  const rows = [...prototypeWorkshops, ...generateWorkshopRows(TOTAL_WORKSHOPS - prototypeWorkshops.length)];
  return rows.map(toEntity);
};
