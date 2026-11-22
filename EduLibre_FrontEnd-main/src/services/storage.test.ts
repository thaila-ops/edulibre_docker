import {
  clearSession,
  getStoredToken,
  getStoredUser,
  saveSession,
} from './storage';
import { User } from '../types';

const user: User = {
  id: 1,
  name: 'Usuário Teste',
  email: 'teste@example.com',
  cpf: '12345678901',
  dataNascimento: '2000-01-01',
  tipo: 'usuario',
  avatarUrl: null,
  bio: null,
};

describe('session storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves and restores a valid session', () => {
    saveSession('token-teste', user);

    expect(getStoredToken()).toBe('token-teste');
    expect(getStoredUser()).toEqual(user);
  });

  test('clears both values when the stored user is invalid JSON', () => {
    localStorage.setItem('edulivre.token', 'token-teste');
    localStorage.setItem('edulivre.user', '{json-invalido');

    expect(getStoredUser()).toBeNull();
    expect(getStoredToken()).toBeNull();
  });

  test('clears a stored session', () => {
    saveSession('token-teste', user);
    clearSession();

    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
