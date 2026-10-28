import { CITIES } from '#seed/cities';
import { COMPANY_SURNAMES, NEIGHBORHOODS } from '#seed/names';
import { between, createRandom, digits, pick } from '#seed/random';
import { normalizeSearchText } from '#shared/text';
import type { AdministrationSeed } from './repository';
import type { CatalogItemEntity, GsreCityEntity, PrvRange, PrvRuleEntity } from './contracts';
import { CatalogKindEnum, OccurrenceSeverityEnum, PrvCalculationEnum, PrvRuleTypeEnum } from './enums';

const GENERATION_SEED = 20261034;
const ITEMS_PER_KIND = 25;
const TOTAL_GSRE_CITIES = 200;
const TOTAL_PRV_RULES = 12;
const { Low, Medium, High } = OccurrenceSeverityEnum;

/** [nome, código, ativo, CNPJ, gravidade] — CNPJ e gravidade só onde o cadastro tem. */
type CatalogRow = [string, string, boolean, string?, OccurrenceSeverityEnum?];

// Registros dos cadastros do protótipo (telas antigas do submenu Administrativo).
const prototypeCatalogs: Record<CatalogKindEnum, CatalogRow[]> = {
  [CatalogKindEnum.Branches]: [
    ['atestas', '016216556', true, '01782392000174'],
    ['BAC BARRA DA TIJUCA 175', '', true, '92682038012205'],
    ['Matriz', '', true, '05644566000170'],
    ['Matriz', '', true, '24942721000189'],
    ['Matriz', '', true, '26757143000136'],
    ['Matriz Teste', '', true, '76343113000151'],
    ['Matriz Teste', '', true, '94415161000190'],
    ['Matriz Teste', '', true, '43872334000168'],
    ['Matriz Teste', '', true, '74305117000110'],
    ['Matriz Teste', '', true, '09140280000108'],
    ['Sucursal Goiânia', 'GYN-01', true, '15533772000247'],
    ['Sucursal São Paulo', 'SPO-01', true, '15533772000328'],
    ['Sucursal Recife', 'REC-01', false, '15533772000409'],
  ],
  [CatalogKindEnum.OccurrenceReasons]: [
    ['Cobrança estadia', '', true],
    ['Devolução peça Fornecedor', '', true],
    ['Erro procedimento', '', true],
    ['Má reparação', '', true, '', High],
    ['Mau atendimento', '', true, '', Medium],
    ['Prazo de Entrega', '', true, '', Medium],
    ['Recusa de veículo', '', true, '', High],
    ['Retrabalho', '', true, '', Medium],
    ['Orçamento fora do prazo', '', true, '', Low],
    ['Peça incorreta', '', true, '', Medium],
    ['Falta de comunicação', '', true, '', Low],
    ['Dano ao veículo', '', false, '', High],
  ],
  [CatalogKindEnum.Benefits]: [
    ['Carro reserva', 'BEN-01', true],
    ['Leva e traz', 'BEN-02', true],
    ['Lavagem cortesia', 'BEN-03', false],
  ],
  [CatalogKindEnum.BlockReasons]: [
    ['Editar', '', true],
    ['Teste', '', true],
  ],
  [CatalogKindEnum.SpecialPrograms]: [['Teste', '', true]],
  [CatalogKindEnum.QualificationPrograms]: [
    ['Oficina Certificada', 'QLF-01', true],
    ['Selo Ouro', 'QLF-02', true],
  ],
  [CatalogKindEnum.SpecializedProviders]: [['Teste', '', true]],
  [CatalogKindEnum.EconomicGroups]: [['teste', '', true]],
  [CatalogKindEnum.DiscountGroups]: [
    ['Peças originais', 'DSC-01', true],
    ['Peças paralelas', 'DSC-02', true],
  ],
};

/** [cidade, código, estado] — as primeiras reproduzem a tabela GSRE do sistema antigo. */
const prototypeGsreCities: [string, string, string][] = [
  ['4O CENTENARIO', '6430', 'PARANA'],
  ['A AVISAR', '79', 'RIO DE JANEIRO'],
  ['A AVISAR', '0', 'A AVISAR'],
  ['A AVISAR', '34', 'MINAS GERAIS'],
  ['A AVISAR', '50', 'SAO PAULO'],
  ['ABADIA DE GOIAS', '5200050', 'GOIAS'],
  ['ABAETE', '3100203', 'MINAS GERAIS'],
  ['ANAPOLIS', '5201108', 'GOIAS'],
  ['APARECIDA DE GOIANIA', '5201405', 'GOIAS'],
  ['BELO HORIZONTE', '3106200', 'MINAS GERAIS'],
  ['BRASILIA', '5300108', 'DISTRITO FEDERAL'],
  ['CAMPINAS', '3509502', 'SAO PAULO'],
  ['CURITIBA', '4106902', 'PARANA'],
  ['FLORIANOPOLIS', '4205407', 'SANTA CATARINA'],
  ['FORTALEZA', '2304400', 'CEARA'],
  ['GOIANIA', '5208707', 'GOIAS'],
  ['JOINVILLE', '4209102', 'SANTA CATARINA'],
  ['LONDRINA', '4113700', 'PARANA'],
  ['MANAUS', '1302603', 'AMAZONAS'],
  ['PORTO ALEGRE', '4314902', 'RIO GRANDE DO SUL'],
  ['RECIFE', '2611606', 'PERNAMBUCO'],
  ['RIO DE JANEIRO', '3304557', 'RIO DE JANEIRO'],
  ['RIO VERDE', '5218805', 'GOIAS'],
  ['SALVADOR', '2927408', 'BAHIA'],
  ['SAO JOSE DOS CAMPOS', '3549904', 'SAO PAULO'],
  ['SAO PAULO', '3550308', 'SAO PAULO'],
  ['UBERLANDIA', '3170206', 'MINAS GERAIS'],
  ['VARZEA PAULISTA', '3556503', 'SAO PAULO'],
];

/** Regras de cálculo do protótipo; a primeira é a tela antiga de regras PRV. */
const prototypePrvRules: [string, PrvRuleTypeEnum, PrvCalculationEnum, PrvRange[]][] = [
  [
    'Honorários',
    PrvRuleTypeEnum.BudgetFees,
    PrvCalculationEnum.Percentage,
    [
      { min: 0, max: 5000, value: 3 },
      { min: 5000, max: 20000, value: 2.5 },
      { min: 20000, max: null, value: 2 },
    ],
  ],
  [
    'Bônus de prazo',
    PrvRuleTypeEnum.DeadlineBonus,
    PrvCalculationEnum.FixedAmount,
    [
      { min: 0, max: 3, value: 150 },
      { min: 3, max: 7, value: 80 },
    ],
  ],
  [
    'Desconto em peças',
    PrvRuleTypeEnum.PartsDiscount,
    PrvCalculationEnum.Percentage,
    [{ min: 0, max: null, value: 5 }],
  ],
];

const STATE_NAMES: Record<string, string> = {
  GO: 'GOIAS',
  SP: 'SAO PAULO',
  RJ: 'RIO DE JANEIRO',
  MG: 'MINAS GERAIS',
  PR: 'PARANA',
  SC: 'SANTA CATARINA',
  RS: 'RIO GRANDE DO SUL',
  DF: 'DISTRITO FEDERAL',
  BA: 'BAHIA',
  PE: 'PERNAMBUCO',
  CE: 'CEARA',
  RN: 'RIO GRANDE DO NORTE',
  PA: 'PARA',
  AM: 'AMAZONAS',
  ES: 'ESPIRITO SANTO',
  MS: 'MATO GROSSO DO SUL',
  MT: 'MATO GROSSO',
  AL: 'ALAGOAS',
};

const toCatalogItem = (kind: CatalogKindEnum, row: CatalogRow, index: number): CatalogItemEntity => {
  const [name, code, isActive, document = '', severity = null] = row;
  return { id: `${kind}-${index + 1}`, kind, name, code, isActive, document, severity };
};

const generateCatalogRows = (kind: CatalogKindEnum, count: number): CatalogRow[] => {
  const random = createRandom(GENERATION_SEED + Object.values(CatalogKindEnum).indexOf(kind));
  const severities = Object.values(OccurrenceSeverityEnum);
  return Array.from({ length: count }, (_, offset): CatalogRow => {
    const label = `${pick(random, NEIGHBORHOODS)} ${offset + 1}`;
    const code = `${kind.slice(0, 3).toUpperCase()}-${String(offset + 1).padStart(3, '0')}`;
    if (kind === CatalogKindEnum.Branches) {
      return [`Sucursal ${label}`, code, random() > 0.15, `${digits(random, 8)}0001${digits(random, 2)}`];
    }
    if (kind === CatalogKindEnum.OccurrenceReasons) {
      return [`Motivo ${label}`, '', random() > 0.15, '', pick(random, severities)];
    }
    return [`${pick(random, COMPANY_SURNAMES)} ${label}`, code, random() > 0.15];
  });
};

const buildCatalogItems = (): CatalogItemEntity[] =>
  Object.values(CatalogKindEnum).flatMap((kind) => {
    const prototype = prototypeCatalogs[kind];
    const rows = [...prototype, ...generateCatalogRows(kind, ITEMS_PER_KIND - prototype.length)];
    return rows.map((row, index) => toCatalogItem(kind, row, index));
  });

const buildGsreCities = (): GsreCityEntity[] => {
  const random = createRandom(GENERATION_SEED + 100);
  const prototype = prototypeGsreCities.map(([name, code, state]) => ({ name, code, state }));
  const generated = Array.from({ length: TOTAL_GSRE_CITIES - prototype.length }, () => {
    const city = pick(random, CITIES);
    return {
      name: normalizeSearchText(city.city).toUpperCase(),
      code: `${city.ddd}${digits(random, 5)}`,
      state: STATE_NAMES[city.state] ?? city.state,
    };
  });
  return [...prototype, ...generated].map((city, index) => ({ id: `gsre-city-${index + 1}`, ...city }));
};

const buildPrvRules = (): PrvRuleEntity[] => {
  const random = createRandom(GENERATION_SEED + 200);
  const types = Object.values(PrvRuleTypeEnum);
  const calculations = Object.values(PrvCalculationEnum);
  const generated = Array.from(
    { length: TOTAL_PRV_RULES - prototypePrvRules.length },
    (_, offset): [string, PrvRuleTypeEnum, PrvCalculationEnum, PrvRange[]] => {
      const calculation = pick(random, calculations);
      const step = between(random, 2, 6);
      return [
        `Regra ${offset + 1} ${pick(random, NEIGHBORHOODS)}`,
        pick(random, types),
        calculation,
        [
          { min: 0, max: step * 1000, value: calculation === PrvCalculationEnum.Percentage ? 2 : 100 },
          { min: step * 1000, max: null, value: calculation === PrvCalculationEnum.Percentage ? 1.5 : 60 },
        ],
      ];
    },
  );
  return [...prototypePrvRules, ...generated].map(([name, type, calculation, ranges], index) => ({
    id: `prv-rule-${index + 1}`,
    name,
    type,
    calculation,
    ranges: ranges.map((range) => ({ ...range })),
  }));
};

/** Cadastros, cidades GSRE e regras PRV. Protótipo primeiro, depois dados gerados. */
export const buildAdministrationSeed = (): AdministrationSeed => ({
  catalogItems: buildCatalogItems(),
  gsreCities: buildGsreCities(),
  prvRules: buildPrvRules(),
});
