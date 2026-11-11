import request from 'supertest';
import app from '../app';
import UserService from '../services/user.service';
import TokenService from '../services/token.service';
import RbacService from '../services/rbac.service';
import HttpError from '../utils/http-error';
import { MulterError } from 'multer';
import { UniqueConstraintError } from 'sequelize';

jest.mock('../services/user.service');
jest.mock('../services/token.service');
jest.mock('../services/rbac.service');

const mockedUserService = jest.mocked(UserService);
const mockedTokenService = jest.mocked(TokenService);
const mockedRbacService = jest.mocked(RbacService);

describe('App routes', () => {
  test.each([
    '/auth/me',
    '/usuarios/me',
    '/notificacoes',
    '/agendamentos',
    '/agendamentos/1',
    '/admin/dashboard',
    '/admin/aulas',
  ])('GET %s keeps authentication protection', async (url) => {
    const response = await request(app).get(url);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token não informado.');
  });

  test.each([
    [new HttpError(403, 'Acesso negado.'), 403, 'Acesso negado.'],
    [
      new UniqueConstraintError({}),
      409,
      'Já existe um registo com estes dados.',
    ],
    [
      new MulterError('LIMIT_FILE_SIZE'),
      400,
      'A imagem deve ter no máximo 5 MB.',
    ],
    [new Error('Detalhes internos'), 500, 'Erro interno do servidor.'],
  ])('preserves the error response for %s', async (error, status, message) => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      mockedUserService.authenticate.mockRejectedValueOnce(error);
      const response = await request(app)
        .post('/login')
        .send({ email: 'a@b.com', password: 'test' });
      expect(response.status).toBe(status);
      expect(response.body).toEqual({ message });
    } finally {
      log.mockRestore();
    }
  });
  beforeEach(() => {
    jest.clearAllMocks();

    mockedRbacService.getAuthContext.mockResolvedValue({
      roles: ['aluno'],
      isSuperAdmin: false,
      permissions: ['aulas.contratar'],
    });
  });

  test('GET / returns api health', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('EduLivre API');
  });

  test('POST /login returns token for valid user', async () => {
    mockedUserService.authenticate.mockResolvedValue({
      id: 1,
      name: 'Ana',
      email: 'ana@teste.com',
      cpf: '12345678901',
      dataNascimento: new Date('1990-05-10'),
      tipo: 'usuario',
      avatarUrl: null,
      bio: null,
    });

    mockedTokenService.sign.mockReturnValue('token-jwt');

    const response = await request(app).post('/login').send({
      email: 'ana@teste.com',
      password: 'Senha@123',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe('token-jwt');
    expect(response.body.user.email).toBe('ana@teste.com');
    expect(response.body.user.roles).toEqual(['aluno']);
  });

  test('GET /usuarios requires authentication', async () => {
    const response = await request(app).get('/usuarios');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Token não informado.');
  });
});
