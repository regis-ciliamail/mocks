/** Texto sem acento e em minúsculas, para comparar buscas. */
export const normalizeSearchText = (value: string | null | undefined): string => (value ?? '')
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()
  .trim();

export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export const comparePtBr = (a: string, b: string): number => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });

/** Cidades homônimas existem em estados diferentes; a chave `Cidade-UF` é única. */
export const toCityKey = (city: string, state: string): string => `${city}-${state}`;

/**
 * Busca por texto (sem acento e caixa). Termo sem letras é busca por documento
 * (CNPJ/CPF), com ou sem pontuação.
 */
export const matchesSearch = (
  search: string | undefined,
  texts: readonly string[],
  documents: readonly string[] = [],
): boolean => {
  const term = normalizeSearchText(search);
  if (!term) return true;
  if (texts.some((text) => normalizeSearchText(text).includes(term))) return true;
  const digits = onlyDigits(term);
  return !/\p{L}/u.test(term) && digits.length > 0 && documents.some((document) => document.includes(digits));
};

/** Mês `AAAA-MM` de uma data ISO (UTC). */
export const toMonthKey = (isoDate: string): string => isoDate.slice(0, 7);
