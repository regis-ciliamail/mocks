import { randomBytes } from 'node:crypto';
import { NotFoundError } from '#shared/errors';
import { matchesList } from '#shared/filters';
import { paginate, type PagedResult } from '#shared/paging';
import { comparePtBr, matchesSearch } from '#shared/text';
import { UserStatusEnum } from './enums';
import {
  type AccountEntity,
  type AccountFormInput,
  type AccountOption,
  type AccountsQuery,
  type IntegrationTokenCreateInput,
  type IntegrationTokenEntity,
  type ProfileEntity,
  type ProfileFormInput,
  type ProfileOption,
  type ProfilesQuery,
  type TokensQuery,
  type UserEntity,
  type UserFormInput,
  type UsersQuery,
} from './contracts';

export type RegistrationsSeed = {
  accounts: AccountEntity[];
  profiles: Omit<ProfileEntity, 'usersCount'>[];
  users: UserEntity[];
  tokens: IntegrationTokenEntity[];
};

const defaultToken = (): string => randomBytes(20).toString('hex').toUpperCase();

const byName = (a: { name: string }, b: { name: string }): number => comparePtBr(a.name, b.name);

export class RegistrationsRepository {
  private readonly accounts: AccountEntity[];

  private readonly profiles: Omit<ProfileEntity, 'usersCount'>[];

  private readonly users: UserEntity[];

  private readonly tokens: IntegrationTokenEntity[];

  private nextId = 1;

  constructor(
    seed: RegistrationsSeed,
    private readonly now: () => Date = () => new Date(),
    private readonly generateToken: () => string = defaultToken,
  ) {
    this.accounts = seed.accounts.map((account) => ({ ...account }));
    this.profiles = seed.profiles.map((profile) => ({ ...profile, permissions: [...profile.permissions] }));
    this.users = seed.users.map((user) => ({ ...user }));
    this.tokens = seed.tokens.map((token) => ({ ...token }));
  }

  listAccounts(query: AccountsQuery): PagedResult<AccountEntity> {
    const items = this.accounts
      .filter((account) =>
        matchesSearch(query.search, [account.legalName, account.tradeName, account.email], [account.document]),
      )
      .sort((a, b) => comparePtBr(a.legalName, b.legalName));
    return paginate(
      items.map((account) => ({ ...account })),
      query.offset,
      query.limit,
    );
  }

  accountOptions(): AccountOption[] {
    return this.accounts.map((account) => ({ id: account.id, name: account.tradeName })).sort(byName);
  }

  findAccount(id: string): AccountEntity {
    return { ...this.findOrThrow(this.accounts, 'Conta', id) };
  }

  saveAccount(id: string | null, input: AccountFormInput): AccountEntity {
    if (id) {
      const account = this.findOrThrow(this.accounts, 'Conta', id);
      Object.assign(account, input);
      // O nome da conta aparece nos tokens: mantém a listagem coerente depois da edição.
      this.tokens
        .filter((token) => token.accountId === id)
        .forEach((token) => Object.assign(token, { accountName: account.tradeName }));
      return { ...account };
    }
    const account: AccountEntity = { id: this.createId('account'), ...input, createdAt: this.now().toISOString() };
    this.accounts.push(account);
    return { ...account };
  }

  listUsers(query: UsersQuery): PagedResult<UserEntity> {
    const items = this.users
      .filter((user) => matchesSearch(query.search, [user.name, user.email], [user.document]))
      .filter(
        (user) =>
          matchesList(query.statuses, user.status) &&
          matchesList(query.profileIds, user.profileId) &&
          matchesList(query.accountIds, user.accountId),
      )
      .sort((a, b) => comparePtBr(a.name, b.name));
    return paginate(
      items.map((user) => ({ ...user })),
      query.offset,
      query.limit,
    );
  }

  findUser(id: string): UserEntity {
    return { ...this.findOrThrow(this.users, 'Usuário', id) };
  }

  saveUser(id: string | null, input: UserFormInput): UserEntity {
    if (id) {
      const user = this.findOrThrow(this.users, 'Usuário', id);
      Object.assign(user, input);
      return { ...user };
    }
    // Usuário novo nasce convidado e recebe o acesso no primeiro login (o status do formulário só vale na edição).
    const user: UserEntity = {
      id: this.createId('user'),
      name: input.name,
      document: input.document,
      email: input.email,
      accountId: input.accountId,
      profileId: input.profileId,
      status: UserStatusEnum.Invited,
      lastAccessAt: null,
    };
    this.users.push(user);
    return { ...user };
  }

  listProfiles(query: ProfilesQuery): PagedResult<ProfileEntity> {
    const items = this.profiles
      .filter((profile) => matchesSearch(query.search, [profile.name]))
      .sort(byName)
      .map((profile) => this.withUsersCount(profile));
    return paginate(items, query.offset, query.limit);
  }

  profileOptions(): ProfileOption[] {
    return this.profiles.map((profile) => ({ id: profile.id, name: profile.name })).sort(byName);
  }

  findProfile(id: string): ProfileEntity {
    return this.withUsersCount(this.findOrThrow(this.profiles, 'Perfil', id));
  }

  saveProfile(id: string | null, input: ProfileFormInput): ProfileEntity {
    if (id) {
      const profile = this.findOrThrow(this.profiles, 'Perfil', id);
      Object.assign(profile, { name: input.name, permissions: [...input.permissions] });
      return this.withUsersCount(profile);
    }
    const profile = {
      id: this.createId('profile'),
      name: input.name,
      permissions: [...input.permissions],
      createdAt: this.now().toISOString(),
    };
    this.profiles.push(profile);
    return this.withUsersCount(profile);
  }

  listTokens(query: TokensQuery): PagedResult<IntegrationTokenEntity> {
    const items = this.tokens
      .filter((token) => matchesSearch(query.search, [token.accountName, token.system, token.url, token.token]))
      .sort((a, b) => comparePtBr(a.accountName, b.accountName) || comparePtBr(a.system, b.system));
    return paginate(
      items.map((token) => ({ ...token })),
      query.offset,
      query.limit,
    );
  }

  createToken(input: IntegrationTokenCreateInput): IntegrationTokenEntity {
    const account = this.findOrThrow(this.accounts, 'Conta', input.accountId);
    const token: IntegrationTokenEntity = {
      id: this.createId('token'),
      accountId: account.id,
      accountName: account.tradeName,
      system: input.system,
      token: this.generateToken(),
      url: input.url,
      isActive: true,
      createdAt: this.now().toISOString(),
    };
    this.tokens.push(token);
    return { ...token };
  }

  setTokenActive(id: string, isActive: boolean): IntegrationTokenEntity {
    const token = this.findOrThrow(this.tokens, 'Token', id);
    token.isActive = isActive;
    return { ...token };
  }

  private withUsersCount(profile: Omit<ProfileEntity, 'usersCount'>): ProfileEntity {
    return {
      ...profile,
      permissions: [...profile.permissions],
      usersCount: this.users.filter((user) => user.profileId === profile.id).length,
    };
  }

  private findOrThrow<T extends { id: string }>(list: T[], resource: string, id: string): T {
    const item = list.find((entry) => entry.id === id);
    if (!item) throw new NotFoundError(resource, id);
    return item;
  }

  private createId(prefix: string): string {
    const id = `${prefix}-new-${this.nextId}`;
    this.nextId += 1;
    return id;
  }
}
