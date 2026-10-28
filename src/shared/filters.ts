/** Lista de filtro vazia ou ausente não restringe; caso contrário o valor precisa estar na lista. */
export const matchesList = <T>(selected: readonly T[] | undefined, value: T): boolean => !selected
  || selected.length === 0
  || selected.includes(value);

/** Filtro de valor único: ausente não restringe. */
export const matchesValue = <T>(selected: T | undefined, value: T): boolean => selected === undefined || selected === value;

/** Filtro de lista em que basta um item em comum (ex.: tipos de serviço de uma oficina). */
export const matchesAnyOf = <T>(selected: readonly T[] | undefined, values: readonly T[]): boolean => !selected
  || selected.length === 0
  || selected.some((item) => values.includes(item));
