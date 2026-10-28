export enum SortOrderEnum {
  Asc = 'asc',
  Desc = 'desc',
}

/** Ordena uma cópia da lista; o desempate mantém a ordem estável entre páginas. */
export const sortItems = <T>(
  items: readonly T[],
  compare: (a: T, b: T) => number,
  order: SortOrderEnum,
  tieBreak: (a: T, b: T) => number,
): T[] => {
  const direction = order === SortOrderEnum.Desc ? -1 : 1;
  return [...items].sort((a, b) => compare(a, b) * direction || tieBreak(a, b));
};
