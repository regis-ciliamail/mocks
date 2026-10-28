import { NotFoundError } from '#shared/errors';
import { matchesList, matchesValue } from '#shared/filters';
import { paginate, type PagedResult } from '#shared/paging';
import { sortItems } from '#shared/sort';
import { comparePtBr, matchesSearch, toCityKey } from '#shared/text';
import {
  type AutoCenterCityOption,
  type AutoCenterEntity,
  type AutoCenterFormInput,
  type AutoCentersQuery,
} from './contracts';
import { AutoCenterSortFieldEnum, type AutoCenterStatusEnum } from './enums';

const copyAutoCenter = (autoCenter: AutoCenterEntity): AutoCenterEntity => ({ ...autoCenter });

const matchesFilter = (autoCenter: AutoCenterEntity, query: AutoCentersQuery): boolean => matchesSearch(
  query.search,
  [autoCenter.name, autoCenter.legalName],
  [autoCenter.document],
)
  && matchesList(query.states, autoCenter.state)
  && matchesList(query.cities, toCityKey(autoCenter.city, autoCenter.state))
  && matchesList(query.categories, autoCenter.category)
  && matchesValue(query.status, autoCenter.status)
  && matchesValue(query.acceptsTowing, autoCenter.acceptsTowing);

/** Sem avaliação vale -1: a ordem decrescente deixa esses registros no fim. */
const ratingOf = (autoCenter: AutoCenterEntity): number => autoCenter.rating ?? -1;

const comparators: Record<AutoCenterSortFieldEnum, (a: AutoCenterEntity, b: AutoCenterEntity) => number> = {
  [AutoCenterSortFieldEnum.Name]: (a, b) => comparePtBr(a.name, b.name),
  [AutoCenterSortFieldEnum.Phone]: (a, b) => comparePtBr(a.phone, b.phone),
  [AutoCenterSortFieldEnum.City]: (a, b) => comparePtBr(a.city, b.city) || comparePtBr(a.state, b.state),
  [AutoCenterSortFieldEnum.Rating]: (a, b) => ratingOf(a) - ratingOf(b),
};

export class AutoCentersRepository {
  private readonly autoCenters: AutoCenterEntity[];

  private nextId: number;

  constructor(seed: readonly AutoCenterEntity[], private readonly now: () => Date = () => new Date()) {
    this.autoCenters = seed.map(copyAutoCenter);
    this.nextId = seed.length + 1;
  }

  list(query: AutoCentersQuery): PagedResult<AutoCenterEntity> {
    const filtered = this.autoCenters.filter((autoCenter) => matchesFilter(autoCenter, query));
    const ordered = query.sortField
      ? sortItems(filtered, comparators[query.sortField], query.sortOrder, (a, b) => comparePtBr(a.name, b.name))
      : filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return paginate(ordered.map(copyAutoCenter), query.offset, query.limit);
  }

  cityOptions(): AutoCenterCityOption[] {
    const unique = new Map<string, AutoCenterCityOption>();
    this.autoCenters.forEach((autoCenter) => unique.set(
      toCityKey(autoCenter.city, autoCenter.state),
      { city: autoCenter.city, state: autoCenter.state },
    ));
    return [...unique.values()].sort((a, b) => comparePtBr(a.city, b.city));
  }

  findById(id: string): AutoCenterEntity {
    return copyAutoCenter(this.findOrThrow(id));
  }

  create(input: AutoCenterFormInput): AutoCenterEntity {
    const autoCenter: AutoCenterEntity = {
      ...input,
      id: `auto-center-${this.nextId}`,
      rating: null,
      createdAt: this.now().toISOString(),
    };
    this.nextId += 1;
    this.autoCenters.push(autoCenter);
    return copyAutoCenter(autoCenter);
  }

  update(id: string, input: AutoCenterFormInput): AutoCenterEntity {
    const current = this.findOrThrow(id);
    const updated: AutoCenterEntity = { ...current, ...input };
    this.autoCenters.splice(this.autoCenters.indexOf(current), 1, updated);
    return copyAutoCenter(updated);
  }

  updateStatus(id: string, status: AutoCenterStatusEnum): AutoCenterEntity {
    const autoCenter = this.findOrThrow(id);
    autoCenter.status = status;
    return copyAutoCenter(autoCenter);
  }

  private findOrThrow(id: string): AutoCenterEntity {
    const autoCenter = this.autoCenters.find((item) => item.id === id);
    if (!autoCenter) throw new NotFoundError('Centro automotivo', id);
    return autoCenter;
  }
}
