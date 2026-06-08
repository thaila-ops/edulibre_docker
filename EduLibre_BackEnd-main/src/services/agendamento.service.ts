import Agendamento from '../models/Agendamento';
import Aula from '../models/Aula';
import User from '../models/User';
import Avaliacao from '../models/Avaliacao';
import HttpError from '../utils/http-error';
import { buildPage, getPageRequest } from '../utils/pagination';
import { ensureAdult, validateDate } from '../utils/validators';

type AgendamentoPayload = {
  alunoId: number;
  aulaId: number;
  data: string;
};

type AgendamentoFilters = {
  alunoId?: string;
  aulaId?: string;
  professorId?: string;
  page?: string;
  pageSize?: string;
};

const AGENDAMENTO_INCLUDE = [
  { model: User, as: 'aluno', attributes: ['id', 'name', 'email', 'cpf', 'dataNascimento', 'tipo', 'avatarUrl'] },
  {
    model: Aula,
    as: 'aula',
    include: [
      { model: User, as: 'professor', attributes: ['id', 'name', 'email', 'cpf', 'dataNascimento', 'tipo', 'avatarUrl'] },
      { model: Avaliacao, as: 'avaliacoes' },
    ],
  },
];

export default class AgendamentoService {
  public static async list(filters: AgendamentoFilters) {
    const pageRequest = getPageRequest(filters.page, filters.pageSize);
    const result = await Agendamento.findAndCountAll({
      where: AgendamentoService.buildWhere(filters),
      include: AGENDAMENTO_INCLUDE,
      limit: pageRequest.limit,
      offset: pageRequest.offset,
      order: [['data', 'DESC']],
      distinct: true,
    });
    const filtered = result.rows
      .map((item) => item.toJSON() as Agendamento & { aula?: Aula })
      .filter((item) => !filters.professorId || item.aula?.professorId === Number(filters.professorId));
    return buildPage(filtered, result.count, pageRequest.page, pageRequest.pageSize);
  }

  public static async findById(id: number) {
    const agendamento = await Agendamento.findByPk(id, { include: AGENDAMENTO_INCLUDE });
    if (!agendamento) throw new HttpError(404, 'Agendamento nÃ£o encontrado.');
    return agendamento.toJSON();
  }

  public static async create(payload: AgendamentoPayload) {
    await AgendamentoService.ensureRelations(payload);
    const agendamento = await Agendamento.create({
      ...AgendamentoService.buildPayload(payload),
      bookingStatus: 'pendente',
    });
    return AgendamentoService.findById(agendamento.id);
  }

  public static async update(id: number, payload: AgendamentoPayload) {
    await AgendamentoService.ensureRelations(payload);
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nÃ£o encontrado.');
    await agendamento.update(AgendamentoService.buildPayload(payload));
    return AgendamentoService.findById(agendamento.id);
  }

  public static async pay(id: number, payerUserId: number) {
    const agendamento = await Agendamento.findByPk(id, { include: AGENDAMENTO_INCLUDE });
    if (!agendamento) throw new HttpError(404, 'Agendamento nÃ£o encontrado.');

    if (agendamento.alunoId !== payerUserId) {
      throw new HttpError(403, 'Somente o aluno dono do agendamento pode pagar.');
    }

    if (agendamento.bookingStatus !== 'aceito') {
      throw new HttpError(400, 'O professor precisa aceitar o agendamento antes do pagamento.');
    }

    const plain = agendamento.toJSON() as Agendamento & { aluno?: User };
    if (plain.aluno?.dataNascimento) {
      ensureAdult(new Date(plain.aluno.dataNascimento), 'comprar aulas');
    }

    await agendamento.update({ paymentStatus: 'pago' });
    return AgendamentoService.findById(id);
  }

  public static async decide(id: number, professorUserId: number, decision: 'aceito' | 'recusado') {
    const agendamento = await Agendamento.findByPk(id, { include: AGENDAMENTO_INCLUDE });
    if (!agendamento) throw new HttpError(404, 'Agendamento nÃ£o encontrado.');

    const plain = agendamento.toJSON() as Agendamento & { aula?: Aula };
    if (plain.aula?.professorId !== professorUserId) {
      throw new HttpError(403, 'Somente o professor da aula pode aceitar ou recusar este agendamento.');
    }

    if (agendamento.paymentStatus === 'pago' && decision === 'recusado') {
      throw new HttpError(400, 'Não é possível recusar um agendamento já pago.');
    }

    await agendamento.update({ bookingStatus: decision });
    return AgendamentoService.findById(id);
  }

  public static async remove(id: number) {
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nÃ£o encontrado.');
    await agendamento.destroy();
  }

  private static buildWhere(filters: AgendamentoFilters) {
    return {
      ...(filters.alunoId ? { alunoId: Number(filters.alunoId) } : {}),
      ...(filters.aulaId ? { aulaId: Number(filters.aulaId) } : {}),
    };
  }

  private static buildPayload(payload: AgendamentoPayload) {
    return {
      alunoId: Number(payload.alunoId),
      aulaId: Number(payload.aulaId),
      data: validateDate(payload.data),
    };
  }

  private static async ensureRelations(payload: AgendamentoPayload) {
    const aluno = await User.findByPk(Number(payload.alunoId));
    if (!aluno) throw new HttpError(400, 'Utilizador invÃ¡lido.');
    ensureAdult(aluno.dataNascimento, 'comprar aulas');

    const aula = await Aula.findByPk(Number(payload.aulaId), { include: [{ model: User, as: 'professor' }] });
    if (!aula) throw new HttpError(404, 'Aula nÃ£o encontrada.');

    const plainAula = aula.toJSON() as Aula & { professor?: User };
    if (plainAula.professor?.dataNascimento) {
      ensureAdult(new Date(plainAula.professor.dataNascimento), 'vender aulas');
    }
  }
}
