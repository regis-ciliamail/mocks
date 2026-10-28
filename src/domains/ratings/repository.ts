import { NotFoundError, UnprocessableError } from '#shared/errors';
import { isWithinDateRange } from '#shared/dates';
import { matchesList } from '#shared/filters';
import { paginate, type PagedResult } from '#shared/paging';
import { sortItems } from '#shared/sort';
import { comparePtBr, matchesSearch } from '#shared/text';
import {
  type RatingProviderOption,
  type RatingRequestCreateInput,
  type RatingRequestEntity,
  type RatingRequestsQuery,
  type RatingSummary,
} from './contracts';
import { RatingSortFieldEnum, RatingStatusEnum, RatingTargetKindEnum } from './enums';

const copyRating = (rating: RatingRequestEntity): RatingRequestEntity => ({
  ...rating,
  channels: [...rating.channels],
  answer: rating.answer ? { ...rating.answer } : null,
});

const matchesFilter = (rating: RatingRequestEntity, query: RatingRequestsQuery): boolean =>
  matchesSearch(
    query.search,
    [rating.providerName, rating.customerName, rating.customerCode],
    [rating.providerDocument],
  ) &&
  matchesList(query.statuses, rating.status) &&
  (!query.channels?.length || query.channels.some((channel) => rating.channels.includes(channel))) &&
  // Com período escolhido, pesquisas ainda não enviadas ficam de fora.
  ((!query.sentFrom && !query.sentTo) ||
    (rating.sentAt !== null &&
      isWithinDateRange(rating.sentAt, {
        from: query.sentFrom,
        to: query.sentTo,
      })));

const timeOf = (isoDate: string | null): number => (isoDate ? Date.parse(isoDate) : 0);

const comparators: Record<RatingSortFieldEnum, (a: RatingRequestEntity, b: RatingRequestEntity) => number> = {
  [RatingSortFieldEnum.Provider]: (a, b) => comparePtBr(a.providerName, b.providerName),
  [RatingSortFieldEnum.Customer]: (a, b) => comparePtBr(a.customerName, b.customerName),
  [RatingSortFieldEnum.SentAt]: (a, b) => timeOf(a.sentAt) - timeOf(b.sentAt),
  [RatingSortFieldEnum.RespondedAt]: (a, b) => timeOf(a.viewedAt) - timeOf(b.viewedAt),
};

const countWithStatus = (items: readonly RatingRequestEntity[], status: RatingStatusEnum): number =>
  items.filter((rating) => rating.status === status).length;

const summarize = (items: readonly RatingRequestEntity[]): RatingSummary => ({
  total: items.length,
  pending: countWithStatus(items, RatingStatusEnum.Pending),
  sent: countWithStatus(items, RatingStatusEnum.Sent),
  responded: countWithStatus(items, RatingStatusEnum.Responded),
  error: countWithStatus(items, RatingStatusEnum.Error),
});

export class RatingsRepository {
  private readonly ratings: RatingRequestEntity[];

  private nextId: number;

  constructor(
    seed: readonly RatingRequestEntity[],
    private readonly now: () => Date = () => new Date(),
  ) {
    this.ratings = seed.map(copyRating);
    this.nextId = seed.length + 1;
  }

  list(query: RatingRequestsQuery): PagedResult<RatingRequestEntity> & { summary: RatingSummary } {
    const filtered = this.ratings.filter(
      (rating) => rating.targetKind === query.targetKind && matchesFilter(rating, query),
    );
    // Sem ordenação escolhida: pendentes (sem envio) no topo e depois os envios mais recentes.
    const ordered = query.sortField
      ? sortItems(filtered, comparators[query.sortField], query.sortOrder, (a, b) =>
          comparePtBr(a.providerName, b.providerName),
        )
      : [...filtered].sort(
          (a, b) =>
            Number(a.sentAt !== null) - Number(b.sentAt !== null) || (b.sentAt ?? '').localeCompare(a.sentAt ?? ''),
        );
    return {
      ...paginate(ordered.map(copyRating), query.offset, query.limit),
      summary: summarize(filtered),
    };
  }

  findById(id: string): RatingRequestEntity {
    return copyRating(this.findOrThrow(id));
  }

  create(input: RatingRequestCreateInput): RatingRequestEntity {
    const rating: RatingRequestEntity = {
      id: `rating-${this.nextId}`,
      targetKind: input.targetKind,
      providerName: input.providerName,
      providerDocument: input.providerDocument,
      customerName: input.customerName,
      customerCode: input.customerCode,
      status: RatingStatusEnum.Sent,
      channels: [...input.channels],
      sentAt: this.now().toISOString(),
      viewedAt: null,
      answer: null,
    };
    this.nextId += 1;
    this.ratings.push(rating);
    return copyRating(rating);
  }

  resend(id: string): RatingRequestEntity {
    const rating = this.findOrThrow(id);
    if (rating.status === RatingStatusEnum.Responded) {
      throw new UnprocessableError(
        'RATING_ALREADY_RESPONDED',
        'A pesquisa já foi respondida e não pode ser reenviada.',
      );
    }
    rating.status = RatingStatusEnum.Sent;
    rating.sentAt = this.now().toISOString();
    return copyRating(rating);
  }

  providerOptions(targetKind: RatingTargetKindEnum): RatingProviderOption[] {
    const unique = new Map<string, RatingProviderOption>();
    this.ratings
      .filter((rating) => rating.targetKind === targetKind)
      .forEach((rating) =>
        unique.set(rating.providerDocument, { name: rating.providerName, document: rating.providerDocument }),
      );
    return [...unique.values()].sort((a, b) => comparePtBr(a.name, b.name));
  }

  private findOrThrow(id: string): RatingRequestEntity {
    const rating = this.ratings.find((item) => item.id === id);
    if (!rating) throw new NotFoundError('Pesquisa', id);
    return rating;
  }
}
