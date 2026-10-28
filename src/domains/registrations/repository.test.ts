import { describe, expect, it } from 'vitest';
import { NotFoundError } from '#shared/errors';
import { RegistrationsRepository } from './repository';
import { accountsQuerySchema, userFormSchema, usersQuerySchema } from './contracts';
import { buildRegistrationsSeed } from './seed';
import { UserStatusEnum } from './enums';

const FIXED_NOW = new Date('2026-10-28T12:00:00.000Z');
const TOKEN = 'A'.repeat(40);

const createRepository = () =>
  new RegistrationsRepository(
    buildRegistrationsSeed(),
    () => FIXED_NOW,
    () => TOKEN,
  );

describe('RegistrationsRepository', () => {
  it('should search accounts by name, e-mail or document', () => {
    const page = createRepository().listAccounts(accountsQuerySchema.parse({ search: 'allianz', limit: 200 }));
    expect(page.items.some((account) => account.tradeName === 'Allianz')).toBe(true);
  });

  it('should create users as invited, without last access', () => {
    const user = createRepository().saveUser(
      null,
      userFormSchema.parse({
        name: 'Novo Usuário',
        document: '123.456.789-09',
        email: 'novo@cilia.com.br',
        accountId: 'account-1',
        profileId: 'profile-1',
        status: UserStatusEnum.Active,
      }),
    );
    expect(user.status).toBe(UserStatusEnum.Invited);
    expect(user.lastAccessAt).toBeNull();
    expect(user.document).toBe('12345678909');
  });

  it('should count the users of each profile', () => {
    const repository = createRepository();
    const profile = repository.findProfile('profile-1');
    const usersInProfile = repository.listUsers(usersQuerySchema.parse({ profileIds: 'profile-1', limit: 200 })).total;
    expect(profile.usersCount).toBe(usersInProfile);
  });

  it('should filter users by status', () => {
    const page = createRepository().listUsers(usersQuerySchema.parse({ statuses: 'invited', limit: 200 }));
    expect(page.items.every((user) => user.status === UserStatusEnum.Invited)).toBe(true);
  });

  it('should generate integration tokens with the injected generator and the account name', () => {
    const token = createRepository().createToken({
      accountId: 'account-2',
      system: 'Teste',
      url: 'https://exemplo.com',
    });
    expect(token.token).toBe(TOKEN);
    expect(token.accountName).toBe('Arval');
    expect(token.isActive).toBe(true);
  });

  it('should keep the account name on tokens after the account is renamed', () => {
    const repository = createRepository();
    const account = repository.findAccount('account-2');
    repository.saveAccount('account-2', {
      legalName: account.legalName,
      tradeName: 'Arval Renomeada',
      document: account.document,
      email: account.email,
      isActive: account.isActive,
    });
    const tokens = repository.listTokens({ offset: 0, limit: 200, search: 'Arval Renomeada' });
    expect(tokens.total).toBeGreaterThan(0);
    expect(tokens.items.every((token) => token.accountName === 'Arval Renomeada')).toBe(true);
  });

  it('should throw not found for an unknown profile', () => {
    expect(() => createRepository().findProfile('nao-existe')).toThrow(NotFoundError);
  });
});
