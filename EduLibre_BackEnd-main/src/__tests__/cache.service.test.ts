import CacheService from '../services/cache.service';

const mockGet = jest.fn();
const mockSet = jest.fn();

const mockRedis = {
  isReady: true,
  withCommandOptions: jest.fn(() => ({
    get: mockGet,
    set: mockSet,
  })),
};

jest.mock('../config/redis', () => ({
  get redisClient() {
    return mockRedis;
  },
}));

describe('CacheService', () => {
  const originalTtl = process.env.CACHE_TTL_SECONDS;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    mockSet.mockReset();

    mockRedis.isReady = true;
    delete process.env.CACHE_TTL_SECONDS;

    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalTtl === undefined) {
      delete process.env.CACHE_TTL_SECONDS;
    } else {
      process.env.CACHE_TTL_SECONDS = originalTtl;
    }
  });

  test('grava JSON com TTL padrão de 60 segundos', async () => {
    await CacheService.set('aulas:teste', { total: 2 });

    expect(mockSet).toHaveBeenCalledWith(
      'aulas:teste',
      JSON.stringify({ total: 2 }),
      { EX: 60 },
    );
  });

  test('respeita o TTL configurado', async () => {
    process.env.CACHE_TTL_SECONDS = '120';

    await CacheService.set('aulas:teste', []);

    expect(mockSet).toHaveBeenCalledWith(
      'aulas:teste',
      '[]',
      { EX: 120 },
    );
  });

  test('não consulta nem grava quando o Redis está indisponível', async () => {
    mockRedis.isReady = false;

    const resultado = await CacheService.get('aulas:teste');
    await CacheService.set('aulas:teste', []);

    expect(resultado).toBeNull();
    expect(mockRedis.withCommandOptions).not.toHaveBeenCalled();
  });

  test('retorna null quando a leitura falha', async () => {
    mockGet.mockRejectedValue(new Error('Connection timeout'));

    await expect(
      CacheService.get('aulas:teste'),
    ).resolves.toBeNull();
  });
  test('gera uma nova versão a cada invalidação', async () => {
  const primeira = await CacheService.invalidate('aulas');
  const segunda = await CacheService.invalidate('aulas');

  expect(primeira).toBe(true);
  expect(segunda).toBe(true);
  expect(mockSet).toHaveBeenCalledTimes(2);

  const [primeiraChave, primeiraVersao] = mockSet.mock.calls[0];
  const [segundaChave, segundaVersao] = mockSet.mock.calls[1];

  expect(primeiraChave).toBe('edulibre:cache-version:aulas');
  expect(segundaChave).toBe(primeiraChave);
  expect(primeiraVersao).toEqual(expect.any(String));
  expect(segundaVersao).not.toBe(primeiraVersao);
});

test('retorna false quando a invalidação falha', async () => {
  mockSet.mockRejectedValue(new Error('Connection timeout'));

  await expect(
    CacheService.invalidate('aulas'),
  ).resolves.toBe(false);
});
});