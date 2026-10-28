import { NotFoundError } from '#shared/errors';
import { matchesList, matchesValue } from '#shared/filters';
import { paginate, type PagedResult } from '#shared/paging';
import { sortItems } from '#shared/sort';
import { comparePtBr, matchesSearch, toCityKey } from '#shared/text';
import {
  type ProviderCityOption,
  type ProviderEntity,
  type ProviderFormInput,
  type ProvidersQuery,
} from './contracts';
import { ProviderKindEnum, ProviderSortFieldEnum, type ProviderStatusEnum } from './enums';

const copyProvider = (provider: ProviderEntity): ProviderEntity => ({ ...provider });

const matchesFilter = (provider: ProviderEntity, query: ProvidersQuery): boolean => matchesSearch(
  query.search,
  [provider.name, provider.legalName],
  [provider.document],
)
  && matchesList(query.states, provider.state)
  && matchesList(query.cities, toCityKey(provider.city, provider.state))
  && matchesValue(query.isOpen24h, provider.isOpen24h)
  && matchesValue(query.status, provider.status);

const comparators: Record<ProviderSortFieldEnum, (a: ProviderEntity, b: ProviderEntity) => number> = {
  [ProviderSortFieldEnum.Name]: (a, b) => comparePtBr(a.name, b.name),
  [ProviderSortFieldEnum.Phone]: (a, b) => comparePtBr(a.phone, b.phone),
  [ProviderSortFieldEnum.Location]: (a, b) => comparePtBr(a.location, b.location),
  [ProviderSortFieldEnum.City]: (a, b) => comparePtBr(a.city, b.city) || comparePtBr(a.state, b.state),
};

export class ProvidersRepository {
  private readonly providers: ProviderEntity[];

  private nextId: number;

  constructor(seed: readonly ProviderEntity[], private readonly now: () => Date = () => new Date()) {
    this.providers = seed.map(copyProvider);
    this.nextId = seed.length + 1;
  }

  list(query: ProvidersQuery): PagedResult<ProviderEntity> {
    const filtered = this.providers.filter((provider) => provider.kind === query.kind && matchesFilter(provider, query));
    const ordered = query.sortField
      ? sortItems(filtered, comparators[query.sortField], query.sortOrder, (a, b) => comparePtBr(a.name, b.name))
      // Sem ordenação escolhida: ordem de cadastro, como no sistema antigo.
      : filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return paginate(ordered.map(copyProvider), query.offset, query.limit);
  }

  cityOptions(kind: ProviderKindEnum): ProviderCityOption[] {
    const unique = new Map<string, ProviderCityOption>();
    this.providers
      .filter((provider) => provider.kind === kind)
      .forEach((provider) => unique.set(toCityKey(provider.city, provider.state), { city: provider.city, state: provider.state }));
    return [...unique.values()].sort((a, b) => comparePtBr(a.city, b.city) || comparePtBr(a.state, b.state));
  }

  findById(id: string): ProviderEntity {
    return copyProvider(this.findOrThrow(id));
  }

  create(input: ProviderFormInput): ProviderEntity {
    const provider: ProviderEntity = {
      ...input,
      id: `provider-${this.nextId}`,
      location: input.location,
      createdAt: this.now().toISOString(),
    };
    this.nextId += 1;
    this.providers.push(provider);
    return copyProvider(provider);
  }

  update(id: string, input: ProviderFormInput): ProviderEntity {
    const current = this.findOrThrow(id);
    const updated: ProviderEntity = { ...current, ...input };
    this.providers.splice(this.providers.indexOf(current), 1, updated);
    return copyProvider(updated);
  }

  updateStatus(id: string, status: ProviderStatusEnum): ProviderEntity {
    const provider = this.findOrThrow(id);
    provider.status = status;
    return copyProvider(provider);
  }

  private findOrThrow(id: string): ProviderEntity {
    const provider = this.providers.find((item) => item.id === id);
    if (!provider) throw new NotFoundError('Prestador', id);
    return provider;
  }
}
