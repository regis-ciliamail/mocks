import { describe, expect, it } from 'vitest';
import { GeolocationRepository, distanceInKm } from './repository';
import { buildMapProviderSeed, referenceAddresses } from './seed';
import { MapProviderKindEnum } from './enums';
import { nearbyMapProvidersQuerySchema } from './contracts';

const GOIANIA = { latitude: -16.6869, longitude: -49.2648 };
const SAO_PAULO = { latitude: -23.5505, longitude: -46.6333 };

describe('distanceInKm', () => {
  it('should be zero for the same point', () => {
    expect(distanceInKm(GOIANIA, GOIANIA)).toBe(0);
  });

  it('should measure roughly the straight-line distance between Goiânia and São Paulo', () => {
    const distance = distanceInKm(GOIANIA, SAO_PAULO);
    expect(distance).toBeGreaterThan(780);
    expect(distance).toBeLessThan(840);
  });
});

describe('GeolocationRepository', () => {
  const repository = new GeolocationRepository(buildMapProviderSeed(), referenceAddresses);

  it('should return only providers inside the radius, sorted by distance', () => {
    const query = nearbyMapProvidersQuerySchema.parse({
      latitude: GOIANIA.latitude,
      longitude: GOIANIA.longitude,
      radiusKm: 10,
    });
    const providers = repository.nearbyProviders(query);
    expect(providers.length).toBeGreaterThan(0);
    expect(providers.every((provider) => provider.distanceKm <= 10)).toBe(true);
    providers.slice(1).forEach((provider, index) => {
      expect(provider.distanceKm).toBeGreaterThanOrEqual(providers[index]?.distanceKm ?? 0);
    });
  });

  it('should filter by provider flags such as referenced status', () => {
    const query = nearbyMapProvidersQuerySchema.parse({
      latitude: GOIANIA.latitude,
      longitude: GOIANIA.longitude,
      radiusKm: 500,
      isReferenced: 'true',
    });
    expect(repository.nearbyProviders(query).every((provider) => provider.isReferenced)).toBe(true);
  });

  it('should search reference addresses by every word of the term', () => {
    expect(repository.searchReferenceAddresses('paulista').map((address) => address.id)).toEqual(['address-5']);
    expect(repository.searchReferenceAddresses('paulista goiania')).toEqual([]);
  });

  it('should use the map provider kinds from the contract', () => {
    const kinds = new Set(buildMapProviderSeed().map((provider) => provider.kind));
    expect(kinds.has(MapProviderKindEnum.Parking)).toBe(true);
  });

  it('should throw when a map provider does not exist', () => {
    expect(() => repository.findProvider('nao-existe')).toThrow('Nenhum registro de prestador no mapa');
  });
});
