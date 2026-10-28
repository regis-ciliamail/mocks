export type Random = () => number;

/** Mulberry32: a mesma semente produz a mesma sequência em toda carga, então os seeds são estáveis. */
export const createRandom = (seed: number): Random => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const pick = <T>(random: Random, values: readonly T[]): T => {
  const value = values[Math.floor(random() * values.length)];
  if (value === undefined) throw new Error('pick: lista vazia.');
  return value;
};

/** Subconjunto sem repetição, em ordem aleatória. */
export const pickSome = <T>(random: Random, values: readonly T[], count: number): T[] => [...values]
  .map((value) => ({ value, key: random() }))
  .sort((a, b) => a.key - b.key)
  .slice(0, Math.min(count, values.length))
  .map((entry) => entry.value);

export const between = (random: Random, min: number, max: number): number => min + Math.floor(random() * (max - min + 1));

export const chance = (random: Random, probability: number): boolean => random() < probability;

export const digits = (random: Random, length: number): string => Array.from(
  { length },
  () => String(between(random, 0, 9)),
).join('');

/** CNPJ de 14 dígitos (sem validar o dígito verificador, é dado de demonstração). */
export const cnpj = (random: Random): string => `${digits(random, 8)}0001${digits(random, 2)}`;

export const cpf = (random: Random): string => digits(random, 11);

/** Celular com DDI 55, DDD e número de 9 dígitos, só com dígitos. */
export const mobilePhone = (random: Random, ddd: string): string => `55${ddd}9${digits(random, 8)}`;

/** Data ISO aleatória entre dois instantes, com minuto arredondado. */
export const isoBetween = (random: Random, startIso: string, endIso: string): string => {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  const instant = start + Math.floor(random() * (end - start));
  return new Date(Math.floor(instant / 60000) * 60000).toISOString();
};

export const addDays = (isoDate: string, days: number): string => new Date(Date.parse(isoDate) + days * 86400000).toISOString();
