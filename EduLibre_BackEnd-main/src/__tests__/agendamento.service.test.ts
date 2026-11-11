import Agendamento from '../models/Agendamento';
import AgendamentoService from '../services/agendamento.service';
import CacheService from '../services/cache.service';
import Aula from '../models/Aula';
import User from '../models/User';

jest.mock('../services/cache.service', () => ({
  __esModule: true,
  default: {
    invalidate: jest.fn(),
  },
}));

describe('Invalidação do cache de agendamentos', () => {
  let agendamento: Agendamento;

  beforeEach(() => {
    jest.clearAllMocks();

    agendamento = Agendamento.build({
      id: 1,
      alunoId: 10,
      aulaId: 2,
      data: new Date('2026-11-20T14:00:00Z'),
      bookingStatus: 'aceito',
      paymentStatus: 'pendente',
    });

    jest.spyOn(Agendamento, 'findByPk').mockResolvedValue(agendamento);
    jest.mocked(CacheService.invalidate).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('invalida depois de salvar o pagamento', async () => {
    const update = jest
      .spyOn(agendamento, 'update')
      .mockImplementation(async () => {
        expect(CacheService.invalidate).not.toHaveBeenCalled();
        agendamento.set('paymentStatus', 'pago');
        return agendamento;
      });

    const resultado = await AgendamentoService.pay(1, 10);

    expect(update).toHaveBeenCalledWith({ paymentStatus: 'pago' });
    expect(resultado.paymentStatus).toBe('pago');
    expect(CacheService.invalidate).toHaveBeenCalledTimes(1);
    expect(CacheService.invalidate).toHaveBeenCalledWith('aulas');
  });

  test('não invalida quando o pagamento não pode ser salvo', async () => {
    jest.spyOn(agendamento, 'update').mockRejectedValue(
      new Error('Falha ao salvar pagamento'),
    );

    await expect(
      AgendamentoService.pay(1, 10),
    ).rejects.toThrow('Falha ao salvar pagamento');

    expect(CacheService.invalidate).not.toHaveBeenCalled();
  });

  test('não salva nem invalida quando outro aluno tenta pagar', async () => {
    const update = jest.spyOn(agendamento, 'update')
      .mockResolvedValue(agendamento);

    await expect(
      AgendamentoService.pay(1, 99),
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(update).not.toHaveBeenCalled();
    expect(CacheService.invalidate).not.toHaveBeenCalled();
  });
  test('invalida depois de excluir o agendamento', async () => {
  const destroy = jest
    .spyOn(agendamento, 'destroy')
    .mockImplementation(async () => {
      expect(CacheService.invalidate).not.toHaveBeenCalled();
    });

  await AgendamentoService.remove(1);

  expect(destroy).toHaveBeenCalledTimes(1);
  expect(CacheService.invalidate).toHaveBeenCalledTimes(1);
  expect(CacheService.invalidate).toHaveBeenCalledWith('aulas');
});

test('não invalida quando a exclusão falha', async () => {
  jest.spyOn(agendamento, 'destroy').mockRejectedValue(
    new Error('Falha ao excluir'),
  );

  await expect(
    AgendamentoService.remove(1),
  ).rejects.toThrow('Falha ao excluir');

  expect(CacheService.invalidate).not.toHaveBeenCalled();
});
describe('criação e alteração', () => {
  const payload = {
    alunoId: 10,
    aulaId: 2,
    data: '2026-11-20T14:00:00Z',
  };

  beforeEach(() => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(
      User.build({
        id: 10,
        name: 'Aluno Teste',
        email: 'aluno@example.com',
        password: 'hash-simulado',
        cpf: '12345678901',
        tipo: 'usuario',
        dataNascimento: new Date('1990-01-01'),
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
  });

  test('invalida depois de criar o agendamento', async () => {
    const create = jest
      .spyOn(Agendamento, 'create')
      .mockImplementation(async () => {
        expect(CacheService.invalidate).not.toHaveBeenCalled();
        return agendamento;
      });

    await AgendamentoService.create(payload);

    expect(create).toHaveBeenCalledWith({
      alunoId: 10,
      aulaId: 2,
      data: new Date(payload.data),
      bookingStatus: 'pendente',
    });

    expect(CacheService.invalidate).toHaveBeenCalledTimes(1);
    expect(CacheService.invalidate).toHaveBeenCalledWith('aulas');
  });

  test('não invalida quando a criação falha', async () => {
    jest.spyOn(Agendamento, 'create').mockRejectedValue(
      new Error('Falha ao criar'),
    );

    await expect(
      AgendamentoService.create(payload),
    ).rejects.toThrow('Falha ao criar');

    expect(CacheService.invalidate).not.toHaveBeenCalled();
  });
  test('invalida depois de alterar o agendamento', async () => {
  const update = jest
    .spyOn(agendamento, 'update')
    .mockImplementation(async () => {
      expect(CacheService.invalidate).not.toHaveBeenCalled();
      return agendamento;
    });

  await AgendamentoService.update(1, payload);

  expect(update).toHaveBeenCalledWith({
    alunoId: 10,
    aulaId: 2,
    data: new Date(payload.data),
  });

  expect(CacheService.invalidate).toHaveBeenCalledTimes(1);
  expect(CacheService.invalidate).toHaveBeenCalledWith('aulas');
});

test('não invalida quando a alteração falha', async () => {
  jest.spyOn(agendamento, 'update').mockRejectedValue(
    new Error('Falha ao alterar'),
  );

  await expect(
    AgendamentoService.update(1, payload),
  ).rejects.toThrow('Falha ao alterar');

  expect(CacheService.invalidate).not.toHaveBeenCalled();
});
});
});