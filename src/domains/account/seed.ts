import { COMPANY_SURNAMES, COMPANY_WORDS } from '#seed/names';
import { cnpj, createRandom, pick, pickSome, between } from '#seed/random';
import type { CiliaModuleEntity, CompanyEntity, FeatureEntity } from './contracts';
import { CiliaModuleKindEnum, FeatureKindEnum } from './enums';

const GENERATION_SEED = 20261037;
const TOTAL_COMPANIES = 60;

const MODULES: Record<CiliaModuleKindEnum, CiliaModuleEntity> = {
  [CiliaModuleKindEnum.Claims]: { id: 'module-claims', kind: CiliaModuleKindEnum.Claims, name: 'Cilia Sinistros', shortName: 'Sinistros' },
  [CiliaModuleKindEnum.Credit]: { id: 'module-credit', kind: CiliaModuleKindEnum.Credit, name: 'Cilia Crédito', shortName: 'Crédito' },
  [CiliaModuleKindEnum.Parts]: { id: 'module-parts', kind: CiliaModuleKindEnum.Parts, name: 'Cilia Peças', shortName: 'Peças' },
  [CiliaModuleKindEnum.CeCilia]: { id: 'module-ce-cilia', kind: CiliaModuleKindEnum.CeCilia, name: 'Ce.Cilia', shortName: 'Ce.Cilia' },
  [CiliaModuleKindEnum.Scrap]: { id: 'module-scrap', kind: CiliaModuleKindEnum.Scrap, name: 'Cilia Sucatas', shortName: 'Sucatas' },
  [CiliaModuleKindEnum.Workshops]: { id: 'module-workshops', kind: CiliaModuleKindEnum.Workshops, name: 'Cilia Oficinas', shortName: 'Oficinas' },
};

const FEATURES: FeatureEntity[] = [
  { id: 'feature-account-center', kind: FeatureKindEnum.AccountCenter, name: 'Central de contas' },
  { id: 'feature-university', kind: FeatureKindEnum.University, name: 'Universidade Cilia' },
  { id: 'feature-parts-lookup', kind: FeatureKindEnum.PartsLookup, name: 'Consulta de peças' },
  { id: 'feature-parts-portal', kind: FeatureKindEnum.PartsPortal, name: 'Portal de peças' },
];

/** Nomes do protótipo: os primeiros são as empresas das telas antigas de seleção de empresa. */
const PROTOTYPE_NAMES = [
  'Seguradora Seguros SA', 'Oficina Brasil LTDA', 'Generic Reguladora S.A.', 'Wave Company of Security',
  'Walker and Sons', 'BR Brand Group - St Bueno', 'BR Brand Group - St Oeste', 'BR Brand Group - Central',
  'BR Brand Group - Marista', 'BR Brand Group - Leste Universitário', 'BR Brand Group - Novo Mundo',
  'Bauch, Gleichner and Brekke', 'Company Oficina LLC - Goiânia', 'Company Oficina LLC - Brasília',
  'Company Oficina LLC - Macapá', 'Company Oficina LLC - São Paulo', 'Company Oficina LLC - Cuiabá',
  'Company Oficina LLC - Curitiba', 'Auto Center Planalto', 'Reparadora Horizonte LTDA',
  'Proteção Veicular Aliança', 'Funilaria Estrela do Sul', 'Mecânica Rota 66', 'Seguradora Atlântica',
  'Vidraçaria Automotiva Cristal', 'Peças e Acessórios Ipiranga', 'Centro Automotivo Serra Azul',
  'Martelinho de Ouro Express', 'Associação Mútua Cerrado', 'Oficina Pit Stop', 'Regional Vistorias LTDA',
  'Lataria Nova Era', 'Guincho Pronto Socorro 24h', 'Distribuidora Autopeças Norte', 'Seguros Confiança Mútua',
  'Retífica Motor Forte', 'Concessionária Vale Verde', 'Pintura Automotiva Prisma', 'Grupo Andrade Veículos',
  'Oficina Modelo Campinas',
];

const MODULE_KINDS = Object.values(CiliaModuleKindEnum);
const FEATURE_KINDS = FEATURES.map((feature) => feature.id);

const moduleSets: CiliaModuleKindEnum[][] = [
  [CiliaModuleKindEnum.Claims, CiliaModuleKindEnum.Credit, CiliaModuleKindEnum.Parts, CiliaModuleKindEnum.CeCilia, CiliaModuleKindEnum.Scrap],
  [CiliaModuleKindEnum.Claims, CiliaModuleKindEnum.Parts, CiliaModuleKindEnum.Workshops],
  [CiliaModuleKindEnum.Claims, CiliaModuleKindEnum.Credit, CiliaModuleKindEnum.CeCilia],
  [CiliaModuleKindEnum.Parts, CiliaModuleKindEnum.Scrap],
];

/** Empresas com módulos e recursos. Protótipo primeiro, depois geradas com semente fixa. */
export const buildCompanySeed = (): CompanyEntity[] => {
  const random = createRandom(GENERATION_SEED);
  const generatedNames = Array.from(
    { length: TOTAL_COMPANIES - PROTOTYPE_NAMES.length },
    () => `${pick(random, COMPANY_SURNAMES)} ${pick(random, COMPANY_WORDS)}`,
  );
  return [...PROTOTYPE_NAMES, ...generatedNames].map((name, index): CompanyEntity => {
    const moduleKinds = index < PROTOTYPE_NAMES.length
      ? moduleSets[index % moduleSets.length] ?? []
      : pickSome(random, MODULE_KINDS, between(random, 1, 5));
    return {
      id: `company-${index + 1}`,
      name,
      document: cnpj(random),
      logoUrl: null,
      modules: moduleKinds.map((kind) => MODULES[kind]),
      features: index % 3 === 0 ? [...FEATURES] : FEATURES.filter((feature) => feature.id !== FEATURE_KINDS[index % FEATURE_KINDS.length]),
    };
  });
};
