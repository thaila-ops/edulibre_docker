import bcrypt from 'bcrypt';
import UserService from '../services/user.service';
import User from '../models/User';
import HttpError from '../utils/http-error';

jest.mock('bcrypt');
jest.mock('../models/User');

const mockedBcrypt = jest.mocked(bcrypt);
const mockedUser = jest.mocked(User);

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates user with encrypted password', async () => {
    mockedUser.findOne.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue('hash' as never);
    mockedUser.create.mockResolvedValue({
      id: 1,
      name: 'Ana',
      email: 'ana@teste.com',
      cpf: '12345678901',
      dataNascimento: new Date('1990-05-10'),
      tipo: 'usuario',
      avatarUrl: null,
      bio: null,
    } as unknown as User);

    const user = await UserService.create({
      name: 'Ana',
      email: 'ana@teste.com',
      password: 'Senha@123',
      cpf: '12345678901',
      dataNascimento: '1990-05-10',
      tipo: 'usuario',
    });

    expect(user.email).toBe('ana@teste.com');
    expect(mockedBcrypt.hash).toHaveBeenCalledWith('Senha@123', 10);
  });

  test('rejects weak password on create', async () => {
    await expect(UserService.create({
      name: 'Ana',
      email: 'ana@teste.com',
      password: '123',
      cpf: '12345678901',
      dataNascimento: '1990-05-10',
      tipo: 'usuario',
    })).rejects.toBeInstanceOf(HttpError);
  });

  test('prevents email change on update', async () => {
    await expect(UserService.update(1, {
      name: 'Ana',
      cpf: '12345678901',
      dataNascimento: '1990-05-10',
      tipo: 'usuario',
      email: 'novo@teste.com',
    })).rejects.toThrow('O e-mail não pode ser alterado.');
  });

  test('authenticates only existing users with valid password', async () => {
    mockedUser.findOne.mockResolvedValue({
      id: 1,
      name: 'Ana',
      email: 'ana@teste.com',
      cpf: '12345678901',
      dataNascimento: new Date('1990-05-10'),
      tipo: 'usuario',
      password: 'hash',
      avatarUrl: null,
      bio: null,
    } as unknown as User);
    mockedBcrypt.compare.mockResolvedValue(true as never);

    const user = await UserService.authenticate('ana@teste.com', 'Senha@123');

    expect(user.id).toBe(1);
    expect(mockedBcrypt.compare).toHaveBeenCalledWith('Senha@123', 'hash');
  });
});
