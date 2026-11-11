import { serializeAula } from '../serializers/aula.serializer';
import type { AulaPayload, AulaFilters } from '../dtos/aula.dto';
import { Op } from 'sequelize';
import Aula from '../models/Aula';
import User from '../models/User';
import Avaliacao from '../models/Avaliacao';
import Agendamento from '../models/Agendamento';
import HttpError from '../utils/http-error';
import { buildPage, getPageRequest } from '../utils/pagination';
import {
  ensureAdult,
  requireText,
  validateOptionalUrl,
  validatePositiveNumber,
} from '../utils/validators';
import CacheService from './cache.service';
import type { PaginationResult } from '../types/api';

const AULA_INCLUDE = [
  {
    model: User,
    as: 'professor',
    attributes: [
      'id',
      'name',
      'email',
      'cpf',
      'dataNascimento',
      'tipo',
      'avatarUrl',
      'bio',
    ],
  },
  {
    model: Avaliacao,
    as: 'avaliacoes',
    include: [
      { model: User, as: 'aluno', attributes: ['id', 'name', 'avatarUrl'] },
    ],
  },
  { model: Agendamento, as: 'agendamentos' },
];

export default class AulaService {
  public static async list(filters: AulaFilters) {
    const pageRequest = getPageRequest(filters.page, filters.pageSize);

    const version = await CacheService.getVersion('aulas');

    const cacheKey =
      version !== null
        ? `${AulaService.buildListCacheKey(
          filters,
          pageRequest.page,
          pageRequest.pageSize,
        )}:${version}`
        : null;

    type Lesson = ReturnType<typeof serializeAula>;

    if (cacheKey !== null) {
      const cached = await CacheService.get<PaginationResult<Lesson>>(cacheKey);

      if (cached !== null) {
        return cached;
      }
    }

    const result = await Aula.findAndCountAll({
      where: AulaService.buildWhere(
        filters.materia,
        filters.professorId,
        filters.status,
      ),
      include: AULA_INCLUDE,
      limit: pageRequest.limit,
      offset: pageRequest.offset,
      order: [['id', 'DESC']],
      distinct: true,
    });

    const response = buildPage(
      result.rows.map((item) => serializeAula(item)),
      result.count,
      pageRequest.page,
      pageRequest.pageSize,
    );

    if (cacheKey !== null) {
      await CacheService.set(cacheKey, response);
    }

    return response;
  }

  public static async featured() {
    const version = await CacheService.getVersion('aulas');

    const cacheKey =
      version !== null ? `edulibre:aulas:featured:${version}` : null;

    type Lesson = ReturnType<typeof serializeAula>;

    if (cacheKey !== null) {
      const cached = await CacheService.get<Lesson[]>(cacheKey);

      if (cached !== null) {
        return cached;
      }
    }

    const lessons = await Aula.findAll({
      where: { status: 'ativa' },
      include: AULA_INCLUDE,
      limit: 3,
      order: [['id', 'DESC']],
    });

    const response = lessons.map((item) => serializeAula(item));

    if (cacheKey !== null) {
      await CacheService.set(cacheKey, response);
    }

    return response;
  }

 public static async block(id: number, motivo: string) {
  const aula = await AulaService.requireById(id);

  await aula.update({
    status: 'bloqueada',
    motivoBloqueio: requireText(motivo, 'Motivo do bloqueio'),
  });

  await CacheService.invalidate('aulas');

  return AulaService.findById(aula.id);
}

  public static async unblock(id: number) {
    const aula = await AulaService.requireById(id);

    await aula.update({
      status: 'ativa',
      motivoBloqueio: null,
    });

    await CacheService.invalidate('aulas');

    return AulaService.findById(aula.id);
  }

  public static async findById(id: number) {
    const aula = await AulaService.requireById(id, true);
    return serializeAula(aula);
  }
  public static async create(payload: AulaPayload) {
    await AulaService.ensureProfessor(payload.professorId);

    const aula = await Aula.create(AulaService.buildPayload(payload));

    await CacheService.invalidate('aulas');

    return AulaService.findById(aula.id);
  }
  public static async update(id: number, payload: AulaPayload) {
    await AulaService.ensureProfessor(payload.professorId);

    const aula = await AulaService.requireById(id);

    await aula.update(AulaService.buildPayload(payload));

    await CacheService.invalidate('aulas');

    return AulaService.findById(aula.id);
  }
  public static async remove(id: number) {
    const aula = await AulaService.requireById(id);

    await aula.destroy();
    await CacheService.invalidate('aulas');
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
  private static buildListCacheKey(
    filters: AulaFilters,
    page: number,
    pageSize: number,
  ): string {
    const query = {
      materia: filters.materia ?? '',
      professorId: filters.professorId ?? '',
      status: filters.status || 'ativa',
      page,
      pageSize,
    };

    return `edulibre:aulas:list:${JSON.stringify(query)}`;
  }

  private static buildWhere(
    materia?: string,
    professorId?: string,
    status?: string,
  ) {
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

  private static async requireById(id: number, withRelations = false) {
    const aula = await Aula.findByPk(
      id,
      withRelations ? { include: AULA_INCLUDE } : undefined,
    );
    if (!aula) throw new HttpError(404, 'Aula não encontrada.');
    return aula;
  }
}
