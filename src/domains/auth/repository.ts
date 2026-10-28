import { randomBytes } from 'node:crypto';
import { UnauthorizedError } from '#shared/errors';
import type {
  CiliaSsoResult,
  DualLoginBody,
  DualLoginResult,
  LoginAccount,
  SessionUser,
} from './contracts';

export const DEMO_SESSION_USER: SessionUser = {
  name: 'Camila',
  organization: 'Cilia Tecnologia',
  role: null,
  avatarUrl: null,
};

export const DEMO_LOGIN_ACCOUNTS: LoginAccount[] = [
  { id: 1, name: 'Cilia Tecnologia' },
  { id: 2, name: 'Seguradora Demo' },
];

const defaultToken = (): string => randomBytes(32).toString('hex');

/**
 * Login de demonstração: qualquer senha vale para as contas de exemplo, como no mock do GERE.
 * As sessões ficam em memória e somem ao reiniciar a API.
 */
export class AuthRepository {
  private readonly sessions = new Map<string, SessionUser>();

  constructor(private readonly generateToken: () => string = defaultToken) {}

  findAccounts(): LoginAccount[] {
    return DEMO_LOGIN_ACCOUNTS.map((account) => ({ ...account }));
  }

  loginDual(input: DualLoginBody): DualLoginResult {
    const hasAccount = DEMO_LOGIN_ACCOUNTS.some((account) => account.id === input.accountId);
    if (!hasAccount) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'CPF, senha ou conta inválidos.');
    }
    const accessToken = this.openSession(DEMO_SESSION_USER);
    return {
      accessToken,
      user: { ...DEMO_SESSION_USER },
      legacyFinalizeUrl: null,
      legacyHandoffExpiresAt: null,
    };
  }

  loginWithCiliaSso(userToken: string): CiliaSsoResult {
    if (userToken.length === 0) {
      throw new UnauthorizedError('INVALID_SSO_TOKEN', 'Token do Cilia Web inválido.');
    }
    const accessToken = this.openSession(DEMO_SESSION_USER);
    return { accessToken, user: { ...DEMO_SESSION_USER } };
  }

  currentUser(accessToken: string | undefined): SessionUser {
    const user = accessToken ? this.sessions.get(accessToken) : undefined;
    if (!user) throw new UnauthorizedError('SESSION_REQUIRED', 'Sessão ausente ou expirada.');
    return { ...user };
  }

  logout(accessToken: string | undefined): void {
    if (accessToken) this.sessions.delete(accessToken);
  }

  private openSession(user: SessionUser): string {
    const accessToken = this.generateToken();
    this.sessions.set(accessToken, { ...user });
    return accessToken;
  }
}
