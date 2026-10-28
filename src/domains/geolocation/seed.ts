import { CITIES } from '#seed/cities';
import { NEIGHBORHOODS, PROVIDER_TRADE_WORDS, STREETS } from '#seed/names';
import { between, createRandom, pick, pickSome } from '#seed/random';
import type { MapProviderEntity, ReferenceAddressEntity } from './contracts';
import {
  AutoCenterTypeEnum,
  MapCategoryEnum,
  MapProviderKindEnum,
  MapServiceTypeEnum,
  MapWorkshopTypeEnum,
  VehicleBrandEnum,
} from './enums';

const GENERATION_SEED = 20261035;
const TOTAL_PROVIDERS = 300;
const PROVIDER_KINDS = Object.values(MapProviderKindEnum);

/** Endereços de referência do protótipo: substituem a geocodificação real (GERE-1435). */
export const referenceAddresses: ReferenceAddressEntity[] = [
  { id: 'address-1', label: 'Ed. Euro Working Concept, R. João de Abreu, 116 - St. Oeste, Goiânia - GO, 74120-110', latitude: -16.6897, longitude: -49.2656 },
  { id: 'address-2', label: 'Praça Cívica - Setor Central, Goiânia - GO, 74003-010', latitude: -16.6799, longitude: -49.2556 },
  { id: 'address-3', label: 'Av. T-63, 1296 - Setor Bueno, Goiânia - GO, 74230-100', latitude: -16.7056, longitude: -49.2717 },
  { id: 'address-4', label: 'Av. Dep. Jamel Cecílio, 3300 - Jardim Goiás, Goiânia - GO, 74810-100', latitude: -16.7106, longitude: -49.2369 },
  { id: 'address-5', label: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200', latitude: -23.5614, longitude: -46.6559 },
  { id: 'address-6', label: 'Esplanada dos Ministérios - Zona Cívico-Administrativa, Brasília - DF, 70050-000', latitude: -15.7975, longitude: -47.8919 },
  { id: 'address-7', label: 'Av. Afonso Pena, 1500 - Centro, Belo Horizonte - MG, 30130-005', latitude: -19.9227, longitude: -43.9451 },
];

type Cluster = {
  city: string;
  state: string;
  center: { latitude: number; longitude: number };
  /** Raio, em graus, em que os prestadores se espalham. */
  spread: number;
  names: string[];
};

// Clusters do protótipo: nomes dos cards do mapa, por cidade de referência.
const prototypeClusters: Cluster[] = [
  {
    city: 'Goiânia',
    state: 'GO',
    center: { latitude: -16.6897, longitude: -49.2656 },
    spread: 0.13,
    names: [
      'Pinho Auto Serviços', 'Classe a Serviços de Pintura', '10Tak Centro Automotivo', 'Auto Center Aliança',
      'Estrela Martelinho de Ouro', 'Oficina do Zé', 'Goiás Auto Peças e Serviços', 'Parking Oeste',
      'Guincho Cerrado 24h', 'Brilho Car Estética', 'Mecânica Marista', 'Concessionária Fiat Bueno',
      'Estacionamento Praça Tamandaré', 'Socorro Rápido Goiânia', 'Centro Automotivo Sul', 'Funilaria Aeroporto',
      'Toyota Jardim Goiás', 'Retífica Coimbra', 'Auto Elétrica Central', 'Pneus & Cia Goiânia',
      'Garagem 85', 'Assistência Total GO', 'Vidros Planalto', 'Oficina Boa Esperança', 'Park Center Bueno',
    ],
  },
  { city: 'São Paulo', state: 'SP', center: { latitude: -23.5614, longitude: -46.6559 }, spread: 0.12, names: ['Speed Car Reparações', 'Delta Freios e Suspensão', 'Paulista Parking', 'Guincho SP Express', 'Honda Jardins', 'Auto Center Pinheiros'] },
  { city: 'Brasília', state: 'DF', center: { latitude: -15.7975, longitude: -47.8919 }, spread: 0.1, names: ['Oficina Mecânica Horizonte', 'Ipê Amarelo Auto Center', 'Estacionamento Esplanada', 'Assistência Planalto'] },
  { city: 'Belo Horizonte', state: 'MG', center: { latitude: -19.9227, longitude: -43.9451 }, spread: 0.1, names: ['Centro Automotivo Diamante', 'Hiper Car Revisões', 'Parking Savassi', 'Reboque Mineiro'] },
];

const SERVICE_TYPES = Object.values(MapServiceTypeEnum);
const CATEGORIES = Object.values(MapCategoryEnum);
const BRANDS = Object.values(VehicleBrandEnum);
const WORKSHOP_TYPES = Object.values(MapWorkshopTypeEnum);
const AUTO_CENTER_TYPES = Object.values(AutoCenterTypeEnum);

const toProvider = (
  random: () => number,
  cluster: Cluster,
  name: string,
  index: number,
  position: number,
): MapProviderEntity => {
  // Os primeiros de cada cidade ficam perto do centro; os demais se espalham.
  const distanceFactor = position < 3 ? 0.03 + position * 0.025 : 0.15 + random() * 0.85;
  const angle = random() * Math.PI * 2;
  const neighborhood = position < 3 ? (NEIGHBORHOODS[0] ?? 'Centro') : pick(random, NEIGHBORHOODS);
  return {
    id: `map-provider-${index + 1}`,
    name,
    kind: pick(random, PROVIDER_KINDS),
    latitude: Math.round((cluster.center.latitude + Math.sin(angle) * cluster.spread * distanceFactor) * 1e6) / 1e6,
    longitude: Math.round((cluster.center.longitude + Math.cos(angle) * cluster.spread * distanceFactor) * 1e6) / 1e6,
    address: `${pick(random, STREETS)}, ${between(random, 10, 3000)} - ${neighborhood}`,
    neighborhood,
    city: cluster.city,
    state: cluster.state,
    isReferenced: random() > 0.33,
    serviceTypes: pickSome(random, SERVICE_TYPES, 2),
    categories: pickSome(random, CATEGORIES, between(random, 1, 2)),
    vehicleBrands: pickSome(random, BRANDS, 3),
    workshopTypes: pickSome(random, WORKSHOP_TYPES, 1),
    autoCenterTypes: pickSome(random, AUTO_CENTER_TYPES, between(random, 0, 1)),
  };
};

/** Prestadores no mapa: os nomes do protótipo nas quatro cidades, depois gerados em cidades do catálogo. */
export const buildMapProviderSeed = (): MapProviderEntity[] => {
  const random = createRandom(GENERATION_SEED);
  const prototype = prototypeClusters.flatMap((cluster) => cluster.names.map((name, position) => ({ cluster, name, position })));
  const generated = Array.from({ length: TOTAL_PROVIDERS - prototype.length }, () => {
    const city = pick(random, CITIES);
    const cluster: Cluster = {
      city: city.city,
      state: city.state,
      center: { latitude: city.latitude, longitude: city.longitude },
      spread: 0.09,
      names: [],
    };
    return { cluster, name: `${pick(random, PROVIDER_TRADE_WORDS)} ${pick(random, NEIGHBORHOODS)}`, position: 99 };
  });
  return [...prototype, ...generated].map(({ cluster, name, position }, index) => toProvider(random, cluster, name, index, position));
};
