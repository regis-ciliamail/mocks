import type { PrvRange } from './contracts';
import { CatalogKindEnum, PrvCalculationEnum } from './enums';

/** Campos que só alguns cadastros têm, como no sistema antigo. */
export const catalogHasDocument = (kind: CatalogKindEnum): boolean => kind === CatalogKindEnum.Branches;

export const catalogHasSeverity = (kind: CatalogKindEnum): boolean => kind === CatalogKindEnum.OccurrenceReasons;

export type PrvRangesError =
  | 'empty'
  | 'negative'
  | 'percentageAbove100'
  | 'minAboveMax'
  | 'openRangeNotLast'
  | 'overlap';

export const PRV_RANGES_ERROR_MESSAGES: Record<PrvRangesError, string> = {
  empty: 'Informe ao menos uma faixa.',
  negative: 'Faixas e valores não podem ser negativos.',
  percentageAbove100: 'Em regra percentual, o valor de cada faixa não pode passar de 100%.',
  minAboveMax: 'Em cada faixa, o mínimo precisa ser menor que o máximo.',
  openRangeNotLast: 'Só a última faixa pode ficar sem máximo.',
  overlap: 'As faixas não podem se sobrepor e precisam estar em ordem crescente.',
};

/**
 * Faixas válidas: ao menos uma, sem valores negativos, `min` menor que `max`, em ordem crescente
 * e sem sobreposição. Só a última pode ficar sem `max` ("daí para cima").
 */
export const validatePrvRanges = (ranges: readonly PrvRange[], calculation: PrvCalculationEnum): PrvRangesError | null => {
  if (ranges.length === 0) return 'empty';
  if (ranges.some((range) => range.min < 0 || range.value < 0 || (range.max !== null && range.max < 0))) return 'negative';
  if (calculation === PrvCalculationEnum.Percentage && ranges.some((range) => range.value > 100)) return 'percentageAbove100';
  if (ranges.some((range) => range.max !== null && range.min >= range.max)) return 'minAboveMax';
  if (ranges.slice(0, -1).some((range) => range.max === null)) return 'openRangeNotLast';
  const overlaps = ranges.slice(1).some((range, index) => {
    const previous = ranges[index];
    return previous?.max === null || (previous !== undefined && range.min < (previous.max ?? Number.POSITIVE_INFINITY));
  });
  return overlaps ? 'overlap' : null;
};
