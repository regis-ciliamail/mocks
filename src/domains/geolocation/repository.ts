import { NotFoundError } from '#shared/errors';
import { matchesAnyOf } from '#shared/filters';
import { normalizeSearchText } from '#shared/text';
import type {
  MapProviderEntity,
  NearbyMapProvider,
  NearbyMapProvidersQuery,
  ReferenceAddressEntity,
} from './contracts';

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Distância em linha reta entre dois pontos (fórmula de Haversine). */
export const distanceInKm = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number => {
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

const matchesFilter = (provider: MapProviderEntity, query: NearbyMapProvidersQuery): boolean =>
  matchesAnyOf(query.serviceTypes, provider.serviceTypes) &&
  matchesAnyOf(query.categories, provider.categories) &&
  matchesAnyOf(query.vehicleBrands, provider.vehicleBrands) &&
  matchesAnyOf(query.workshopTypes, provider.workshopTypes) &&
  matchesAnyOf(query.autoCenterTypes, provider.autoCenterTypes) &&
  (query.isReferenced === undefined || provider.isReferenced === query.isReferenced);

export class GeolocationRepository {
  constructor(
    private readonly providers: readonly MapProviderEntity[],
    private readonly addresses: readonly ReferenceAddressEntity[],
  ) {}

  searchReferenceAddresses(term: string | undefined): ReferenceAddressEntity[] {
    const words = normalizeSearchText(term)
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return this.addresses
      .filter((address) => {
        const label = normalizeSearchText(address.label);
        return words.every((word) => label.includes(word));
      })
      .map((address) => ({ ...address }));
  }

  nearbyProviders(query: NearbyMapProvidersQuery): NearbyMapProvider[] {
    const center = { latitude: query.latitude, longitude: query.longitude };
    return this.providers
      .filter((provider) => matchesFilter(provider, query))
      .map((provider) => ({ ...provider, distanceKm: distanceInKm(center, provider) }))
      .filter((provider) => provider.distanceKm <= query.radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name, 'pt-BR'));
  }

  findProvider(id: string): MapProviderEntity {
    const provider = this.providers.find((item) => item.id === id);
    if (!provider) throw new NotFoundError('Prestador no mapa', id);
    return { ...provider };
  }
}
