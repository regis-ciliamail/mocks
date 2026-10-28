/** Intervalo fechado em dias (`AAAA-MM-DD`); uma das pontas pode faltar. */
export type DateRange = {
  from?: string | undefined;
  to?: string | undefined;
};

/** Compara uma data ISO com o intervalo, incluindo o dia inteiro das pontas (UTC). */
export const isWithinDateRange = (isoDate: string, range?: DateRange): boolean => {
  if (!range || (!range.from && !range.to)) return true;
  const time = Date.parse(isoDate);
  const from = range.from ? Date.parse(`${range.from}T00:00:00.000Z`) : Number.NEGATIVE_INFINITY;
  const to = range.to ? Date.parse(`${range.to}T23:59:59.999Z`) : Number.POSITIVE_INFINITY;
  return time >= from && time <= to;
};
