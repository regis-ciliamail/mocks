import { describe, expect, it } from 'vitest';
import { UnauthorizedError } from '#shared/errors';
import { AuthRepository } from './repository';

const createRepository = () => {
  let counter = 0;
  return new AuthRepository(() => {
    counter += 1;
    return `token-${counter}`;
  });
};

describe('AuthRepository', () => {
  it('should open a session on dual login and return the user with the token', () => {
    const result = createRepository().loginDual({ username: '12345678909', accountId: 1, password: 'qualquer' });
    expect(result.accessToken).toBe('token-1');
    expect(result.user.name).toBe('Camila');
  });

  it('should reject an unknown account', () => {
    expect(() => createRepository().loginDual({ username: '12345678909', accountId: 99, password: 'x' }))
      .toThrow(UnauthorizedError);
  });

  it('should return the user only for a valid, open session', () => {
    const repository = createRepository();
    const { accessToken } = repository.loginDual({ username: '12345678909', accountId: 2, password: 'x' });
    expect(repository.currentUser(accessToken).organization).toBe('Cilia Tecnologia');
    expect(() => repository.currentUser('token-inexistente')).toThrow(UnauthorizedError);
    expect(() => repository.currentUser(undefined)).toThrow(UnauthorizedError);
  });

  it('should close the session on logout', () => {
    const repository = createRepository();
    const { accessToken } = repository.loginWithCiliaSso('token-do-cilia-web');
    repository.logout(accessToken);
    expect(() => repository.currentUser(accessToken)).toThrow(UnauthorizedError);
  });

  it('should reject an empty Cilia Web token', () => {
    expect(() => createRepository().loginWithCiliaSso('')).toThrow(UnauthorizedError);
  });
});
