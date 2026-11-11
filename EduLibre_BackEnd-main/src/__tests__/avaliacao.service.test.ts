import Aula from '../models/Aula';
import Avaliacao from '../models/Avaliacao';
import User from '../models/User';
import AvaliacaoService from '../services/avaliacao.service';
import CacheService from '../services/cache.service';

jest.mock('../services/cache.service', () => ({
  __esModule: true,
  default: {
    invalidate: jest.fn(),
  },
}));

const payload = {
  alunoId: 1,
  aulaId: 2,
  nota: 5,
  comentario: 'Ótima aula!',
};

describe('Invalidação do cache após avaliação', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(User, 'findByPk').mockResolvedValue(
  User.build({
    id: 1,
    name: 'Aluno Teste',
    email: 'aluno@example.com',
    password: 'hash-simulado',
    cpf: '12345678901',
    tipo: 'usuario',
  }),
);

jest.spyOn(Aula, 'findByPk').mockResolvedValue(
  Aula.build({
    id: 2,
    materia: 'Matemática',
    valor: 50,
    professorId: 3,
  }),
);

    jest.mocked(CacheService.invalidate).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('invalida depois de salvar a avaliação', async () => {
    const avaliacao = Avaliacao.build(payload);

    jest.spyOn(Avaliacao, 'create').mockImplementation(async () => {
      expect(CacheService.invalidate).not.toHaveBeenCalled();
      return avaliacao;
    });

    const resultado = await AvaliacaoService.create(payload);

    expect(resultado).toBe(avaliacao);
    expect(CacheService.invalidate).toHaveBeenCalledTimes(1);
    expect(CacheService.invalidate).toHaveBeenCalledWith('aulas');
  });

  test('não invalida quando a gravação falha', async () => {
    jest.spyOn(Avaliacao, 'create').mockRejectedValue(
      new Error('Falha ao salvar'),
    );

    await expect(
      AvaliacaoService.create(payload),
    ).rejects.toThrow('Falha ao salvar');

    expect(CacheService.invalidate).not.toHaveBeenCalled();
  });
});