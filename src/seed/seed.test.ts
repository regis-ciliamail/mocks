import { describe, expect, it } from 'vitest';
import { buildServiceProviderSeed } from '#domains/network/seed';
import { buildProviderSeed } from '#domains/providers/seed';
import { buildAutoCenterSeed } from '#domains/auto-centers/seed';
import { buildRatingSeed } from '#domains/ratings/seed';
import { buildIntegrationsSeed } from '#domains/integrations/seed';
import { buildRegistrationsSeed } from '#domains/registrations/seed';
import { buildAdministrationSeed } from '#domains/administration/seed';
import { buildMapProviderSeed } from '#domains/geolocation/seed';
import { buildReportsSeed } from '#domains/reports/seed';
import { buildCompanySeed } from '#domains/account/seed';
import { createRandom, pickSome } from './random';

describe('seed volume', () => {
  it('should generate a large catalog for every domain', () => {
    expect(buildServiceProviderSeed()).toHaveLength(300);
    expect(buildProviderSeed()).toHaveLength(280);
    expect(buildAutoCenterSeed()).toHaveLength(120);
    expect(buildRatingSeed()).toHaveLength(400);
    expect(buildIntegrationsSeed().logs).toHaveLength(800);
    expect(buildRegistrationsSeed().users).toHaveLength(200);
    expect(buildAdministrationSeed().gsreCities).toHaveLength(200);
    expect(buildMapProviderSeed()).toHaveLength(300);
    expect(buildReportsSeed().statusEntries).toHaveLength(200);
    expect(buildCompanySeed()).toHaveLength(60);
  });

  it('should keep workshop documents unique', () => {
    const documents = buildServiceProviderSeed().map((provider) => provider.document);
    expect(new Set(documents).size).toBe(documents.length);
  });

  it('should keep ids unique within each domain', () => {
    const ids = buildRegistrationsSeed().users.map((user) => user.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should reference only existing accounts and profiles from users', () => {
    const { accounts, profiles, users } = buildRegistrationsSeed();
    const accountIds = new Set(accounts.map((account) => account.id));
    const profileIds = new Set(profiles.map((profile) => profile.id));
    expect(users.every((user) => accountIds.has(user.accountId) && profileIds.has(user.profileId))).toBe(true);
  });
});

describe('seed determinism', () => {
  it('should produce the same records on every build', () => {
    expect(buildServiceProviderSeed()).toEqual(buildServiceProviderSeed());
    expect(buildRatingSeed()).toEqual(buildRatingSeed());
  });

  it('should produce the same sequence for the same random seed', () => {
    const first = createRandom(7);
    const second = createRandom(7);
    expect([first(), first()]).toEqual([second(), second()]);
  });

  it('should pick a subset without repeating items', () => {
    const random = createRandom(42);
    const subset = pickSome(random, [1, 2, 3, 4, 5], 3);
    expect(new Set(subset).size).toBe(3);
  });
});
