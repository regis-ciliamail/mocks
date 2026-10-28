import { describe, expect, it } from 'vitest';
import { ConflictError, NotFoundError } from '#shared/errors';
import { NetworkRepository } from './repository';
import { serviceProvidersQuerySchema, serviceProviderFormSchema, type ServiceProviderFormInput } from './contracts';
import { buildServiceProviderSeed } from './seed';
import { ServiceProviderStatusEnum, WorkshopTypeEnum } from './enums';

const FIXED_NOW = new Date('2026-10-28T12:00:00.000Z');

const formInput = (overrides: Partial<ServiceProviderFormInput> = {}): ServiceProviderFormInput => ({
  ...serviceProviderFormSchema.parse({
    name: 'Oficina Teste',
    document: '11.222.333/0001-44',
    phone: '(62) 99999-0000',
    country: 'BR',
    state: 'GO',
    city: 'Goiânia',
    isReferenced: true,
    rating: 4,
    workshopTypes: ['mechanics'],
    occupation: 'low',
    budgetingSystem: 'cilia',
    specialProgram: null,
    hasImageInspection: false,
    hasSupply: false,
    status: 'active',
  }),
  ...overrides,
});

const createRepository = () => new NetworkRepository(buildServiceProviderSeed(), () => FIXED_NOW);

describe('NetworkRepository', () => {
  it('should page results and report the total of matches', () => {
    const repository = createRepository();
    const query = serviceProvidersQuerySchema.parse({ limit: 10 });
    const page = repository.list(query);
    expect(page.items).toHaveLength(10);
    expect(page.total).toBe(300);
  });

  it('should filter by status and only return matching providers', () => {
    const repository = createRepository();
    const query = serviceProvidersQuerySchema.parse({ limit: 200, status: 'inactive' });
    const page = repository.list(query);
    expect(page.items.length).toBe(page.total);
    expect(page.items.every((provider) => provider.status === ServiceProviderStatusEnum.Inactive)).toBe(true);
  });

  it('should match a CNPJ typed with punctuation', () => {
    const repository = createRepository();
    const query = serviceProvidersQuerySchema.parse({ search: '12.345.678/0001-21' });
    expect(repository.list(query).items.map((provider) => provider.document)).toEqual(['12345678000121']);
  });

  it('should filter by workshop type with any-of semantics', () => {
    const repository = createRepository();
    const query = serviceProvidersQuerySchema.parse({ limit: 200, workshopTypes: WorkshopTypeEnum.Glass });
    const page = repository.list(query);
    expect(page.items.every((provider) => provider.workshopTypes.includes(WorkshopTypeEnum.Glass))).toBe(true);
  });

  it('should sort by rating in descending order', () => {
    const repository = createRepository();
    const query = serviceProvidersQuerySchema.parse({ limit: 50, sortField: 'rating', sortOrder: 'desc' });
    const ratings = repository.list(query).items.map((provider) => provider.rating);
    ratings.slice(1).forEach((rating, index) => {
      expect(rating).toBeLessThanOrEqual(ratings[index] ?? 5);
    });
  });

  it('should create a workshop with the city coordinates and a fresh id', () => {
    const repository = createRepository();
    const created = repository.create(formInput());
    expect(created.id).toBe('provider-301');
    expect(created.document).toBe('11222333000144');
    expect(created.phone).toBe('62999990000');
    expect(created.location.latitude).not.toBeNull();
    expect(created.createdAt).toBe(FIXED_NOW.toISOString());
  });

  it('should reject a document that another workshop already uses', () => {
    const repository = createRepository();
    expect(() => repository.create(formInput({ document: '12345678000121' })))
      .toThrow(ConflictError);
  });

  it('should allow an update to keep its own document', () => {
    const repository = createRepository();
    const updated = repository.update('provider-1', formInput({ document: '12345678000121', name: 'Novo nome' }));
    expect(updated.name).toBe('Novo nome');
    expect(updated.id).toBe('provider-1');
  });

  it('should change only the status on a status update', () => {
    const repository = createRepository();
    const updated = repository.updateStatus('provider-1', ServiceProviderStatusEnum.Suspended);
    expect(updated.status).toBe('suspended');
    expect(updated.name).toBe('Auto Center Aliança');
  });

  it('should throw not found for an unknown id', () => {
    expect(() => createRepository().findById('nao-existe')).toThrow(NotFoundError);
  });

  it('should return unique city options sorted by name', () => {
    const cities = createRepository().cityOptions();
    const keys = cities.map((city) => `${city.city}-${city.state}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual([...keys].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  });
});
