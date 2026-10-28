import { ConflictError, NotFoundError } from '#shared/errors';
import { isWithinDateRange } from '#shared/dates';
import { matchesAnyOf, matchesList, matchesValue } from '#shared/filters';
import { paginate, type PagedResult } from '#shared/paging';
import { sortItems } from '#shared/sort';
import { comparePtBr, matchesSearch, toCityKey } from '#shared/text';
import { findCity } from '#seed/cities';
import {
  type ServiceProviderCityOption,
  type ServiceProviderEntity,
  type ServiceProviderFormInput,
  type ServiceProvidersQuery,
} from './contracts';
import { ServiceProviderKindEnum, ServiceProviderSortFieldEnum, ServiceProviderStatusEnum } from './enums';

const copyServiceProvider = (provider: ServiceProviderEntity): ServiceProviderEntity => ({
  ...provider,
  location: { ...provider.location },
  workshopTypes: [...provider.workshopTypes],
});

const toLocation = (input: ServiceProviderFormInput): ServiceProviderEntity['location'] => {
  const city = findCity(input.city, input.state);
  return {
    country: input.country,
    city: input.city,
    state: input.state,
    latitude: city?.latitude ?? null,
    longitude: city?.longitude ?? null,
  };
};

const matchesFilter = (provider: ServiceProviderEntity, query: ServiceProvidersQuery): boolean => matchesSearch(
  query.search,
  [provider.name],
  [provider.document],
)
  && matchesValue(query.kind, provider.kind)
  && matchesList(query.countries, provider.location.country)
  && matchesList(query.states, provider.location.state)
  && matchesList(query.cities, toCityKey(provider.location.city, provider.location.state))
  && isWithinDateRange(provider.createdAt, { from: query.createdFrom, to: query.createdTo })
  && isWithinDateRange(provider.updatedAt, { from: query.updatedFrom, to: query.updatedTo })
  && matchesAnyOf(query.workshopTypes, provider.workshopTypes)
  && matchesList(query.occupations, provider.occupation)
  && matchesValue(query.budgetingSystem, provider.budgetingSystem)
  && matchesValue(query.specialProgram, provider.specialProgram)
  && matchesValue(query.status, provider.status)
  && matchesValue(query.hasImageInspection, provider.hasImageInspection)
  && matchesValue(query.hasSupply, provider.hasSupply)
  && matchesValue(query.isReferenced, provider.isReferenced);

const comparators: Record<ServiceProviderSortFieldEnum, (a: ServiceProviderEntity, b: ServiceProviderEntity) => number> = {
  [ServiceProviderSortFieldEnum.Name]: (a, b) => comparePtBr(a.name, b.name),
  [ServiceProviderSortFieldEnum.Phone]: (a, b) => comparePtBr(a.phone, b.phone),
  [ServiceProviderSortFieldEnum.Location]: (a, b) => comparePtBr(a.location.city, b.location.city)
    || comparePtBr(a.location.state, b.location.state),
  [ServiceProviderSortFieldEnum.Rating]: (a, b) => a.rating - b.rating,
  [ServiceProviderSortFieldEnum.CurrentScore]: (a, b) => a.currentScore - b.currentScore,
  [ServiceProviderSortFieldEnum.TotalScore]: (a, b) => a.totalScore - b.totalScore,
};

export class NetworkRepository {
  private readonly providers: ServiceProviderEntity[];

  private nextId: number;

  constructor(seed: readonly ServiceProviderEntity[], private readonly now: () => Date = () => new Date()) {
    this.providers = seed.map(copyServiceProvider);
    this.nextId = seed.length + 1;
  }

  list(query: ServiceProvidersQuery): PagedResult<ServiceProviderEntity> {
    const filtered = this.providers.filter((provider) => matchesFilter(provider, query));
    const ordered = query.sortField
      ? sortItems(filtered, comparators[query.sortField], query.sortOrder, (a, b) => comparePtBr(a.name, b.name))
      : filtered;
    return paginate(ordered.map(copyServiceProvider), query.offset, query.limit);
  }

  findById(id: string): ServiceProviderEntity {
    return copyServiceProvider(this.findOrThrow(id));
  }

  cityOptions(): ServiceProviderCityOption[] {
    const unique = new Map<string, ServiceProviderCityOption>();
    this.providers.forEach(({ location }) => {
      unique.set(toCityKey(location.city, location.state), { city: location.city, state: location.state });
    });
    return [...unique.values()].sort((a, b) => comparePtBr(a.city, b.city) || comparePtBr(a.state, b.state));
  }

  create(input: ServiceProviderFormInput): ServiceProviderEntity {
    this.assertUniqueDocument(input.document);
    const timestamp = this.now().toISOString();
    const provider: ServiceProviderEntity = {
      id: `provider-${this.nextId}`,
      name: input.name,
      document: input.document,
      phone: input.phone,
      kind: ServiceProviderKindEnum.Workshop,
      status: input.status,
      location: toLocation(input),
      isReferenced: input.isReferenced,
      rating: input.rating,
      currentScore: 0,
      totalScore: 0,
      workshopTypes: [...input.workshopTypes],
      occupation: input.occupation,
      budgetingSystem: input.budgetingSystem,
      specialProgram: input.specialProgram,
      hasImageInspection: input.hasImageInspection,
      hasSupply: input.hasSupply,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.nextId += 1;
    this.providers.push(provider);
    return copyServiceProvider(provider);
  }

  update(id: string, input: ServiceProviderFormInput): ServiceProviderEntity {
    const current = this.findOrThrow(id);
    this.assertUniqueDocument(input.document, id);
    const updated: ServiceProviderEntity = {
      ...current,
      name: input.name,
      document: input.document,
      phone: input.phone,
      status: input.status,
      location: toLocation(input),
      isReferenced: input.isReferenced,
      rating: input.rating,
      workshopTypes: [...input.workshopTypes],
      occupation: input.occupation,
      budgetingSystem: input.budgetingSystem,
      specialProgram: input.specialProgram,
      hasImageInspection: input.hasImageInspection,
      hasSupply: input.hasSupply,
      updatedAt: this.now().toISOString(),
    };
    this.providers.splice(this.providers.indexOf(current), 1, updated);
    return copyServiceProvider(updated);
  }

  updateStatus(id: string, status: ServiceProviderStatusEnum): ServiceProviderEntity {
    const provider = this.findOrThrow(id);
    provider.status = status;
    provider.updatedAt = this.now().toISOString();
    return copyServiceProvider(provider);
  }

  private findOrThrow(id: string): ServiceProviderEntity {
    const provider = this.providers.find((item) => item.id === id);
    if (!provider) throw new NotFoundError('Oficina', id);
    return provider;
  }

  private assertUniqueDocument(document: string, ignoreId?: string): void {
    const isTaken = this.providers.some((item) => item.document === document && item.id !== ignoreId);
    if (isTaken) {
      throw new ConflictError('SERVICE_PROVIDER_DUPLICATE_DOCUMENT', `Já existe uma oficina com o CNPJ ${document}.`);
    }
  }
}
