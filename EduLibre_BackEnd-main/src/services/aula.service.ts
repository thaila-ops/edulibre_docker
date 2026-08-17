import { Op } from 'sequelize';
import Aula from '../models/Aula';
import User from '../models/User';
import Avaliacao from '../models/Avaliacao';
import Agendamento from '../models/Agendamento';
import HttpError from '../utils/http-error';
import { buildPage, getPageRequest } from '../utils/pagination';
import { ensureAdult, requireText, validateOptionalUrl, validatePositiveNumber } from '../utils/validators';

type AulaPayload = {
  materia: string;
  valor: number;
  descricao?: string;
  professorId: number;
  imageUrl?: string;
};

type AulaFilters = {
  materia?: string;
  professorId?: string;
  page?: string;
  pageSize?: string;
  status?: string;
};

const AULA_INCLUDE = [
  { model: User, as: 'professor', attributes: ['id', 'name', 'email', 'cpf', 'dataNascimento', 'tipo', 'avatarUrl', 'bio'] },
  { model: Avaliacao, as: 'avaliacoes', include: [{ model: User, as: 'aluno', attributes: ['id', 'name', 'avatarUrl'] }] },
  { model: Agendamento, as: 'agendamentos' },
];

export default class AulaService {
  public static async list(filters: AulaFilters) {
    const pageRequest = getPageRequest(filters.page, filters.pageSize);
    const result = await Aula.findAndCountAll({
      where: AulaService.buildWhere(filters.materia, filters.professorId, filters.status),
      include: AULA_INCLUDE,
      limit: pageRequest.limit,
      offset: pageRequest.offset,
      order: [['id', 'DESC']],
      distinct: true,
    });
    return buildPage(result.rows.map((item) => AulaService.serialize(item)), result.count, pageRequest.page, pageRequest.pageSize);
  }

  public static async featured() {
    const lessons = await Aula.findAll({
      where: { status: 'ativa' },
      include: AULA_INCLUDE,
      limit: 3,
      order: [['id', 'DESC']],
    });
    return lessons.map((item) => AulaService.serialize(item));
  }

  public static async block(id: number, motivo: string) {
    const aula = await Aula.findByPk(id);
    if (!aula) throw new HttpError(404, 'Aula não encontrada.');
    await aula.update({ status: 'bloqueada', motivoBloqueio: requireText(motivo, 'Motivo do bloqueio') });
    return AulaService.findById(aula.id);
  }

  public static async unblock(id: number) {
    const aula = await Aula.findByPk(id);
    if (!aula) throw new HttpError(404, 'Aula não encontrada.');
    await aula.update({ status: 'ativa', motivoBloqueio: null });
    return AulaService.findById(aula.id);
  }

  public static async findById(id: number) {
    const aula = await Aula.findByPk(id, { include: AULA_INCLUDE });
    if (!aula) throw new HttpError(404, 'Aula não encontrada.');
    return AulaService.serialize(aula);
  }

  public static async create(payload: AulaPayload) {
    await AulaService.ensureProfessor(payload.professorId);
    const aula = await Aula.create(AulaService.buildPayload(payload));
    return AulaService.findById(aula.id);
  }

  public static async update(id: number, payload: AulaPayload) {
    await AulaService.ensureProfessor(payload.professorId);
    const aula = await Aula.findByPk(id);
    if (!aula) throw new HttpError(404, 'Aula não encontrada.');
    await aula.update(AulaService.buildPayload(payload));
    return AulaService.findById(aula.id);
  }

  public static async remove(id: number) {
    const aula = await Aula.findByPk(id);
    if (!aula) throw new HttpError(404, 'Aula não encontrada.');
    await aula.destroy();
  }

  private static buildPayload(payload: AulaPayload) {
    return {
      materia: requireText(payload.materia, 'Matéria'),
      valor: validatePositiveNumber(Number(payload.valor), 'Valor'),
      descricao: payload.descricao?.trim() || null,
      imageUrl: validateOptionalUrl(payload.imageUrl),
      professorId: Number(payload.professorId),
    };
  }

  private static buildWhere(materia?: string, professorId?: string, status?: string) {
    return {
      ...(materia ? { materia: { [Op.like]: `%${materia.trim()}%` } } : {}),
      ...(professorId ? { professorId: Number(professorId) } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(!status ? { status: 'ativa' } : {}),
    };
  }

  private static async ensureProfessor(id: number) {
    const professor = await User.findByPk(Number(id));
    if (!professor) throw new HttpError(400, 'Utilizador inválido.');
    ensureAdult(professor.dataNascimento, 'vender aulas');
  }

  private static serialize(aula: Aula) {
    const plain = aula.toJSON() as Aula & {
      professor?: User;
      avaliacoes?: Avaliacao[];
      agendamentos?: Agendamento[];
    };
    const reviews = plain.avaliacoes ?? [];
    const bookings = plain.agendamentos ?? [];
    const paidBookings = bookings.filter((item) => item.paymentStatus === 'pago');
    const average = reviews.length
      ? reviews.reduce((total, item) => total + item.nota, 0) / reviews.length
      : 0;

    return {
      id: plain.id,
      materia: plain.materia,
      valor: plain.valor,
      descricao: plain.descricao,
      imageUrl: plain.imageUrl,
      status: plain.status,
      motivoBloqueio: plain.motivoBloqueio,
      professorId: plain.professorId,
      professor: plain.professor,
      reviewCount: reviews.length,
      averageRating: Number(average.toFixed(1)),
      bookingCount: bookings.length,
      paidBookingCount: paidBookings.length,
      avaliacoes: reviews,
    };
  }
}