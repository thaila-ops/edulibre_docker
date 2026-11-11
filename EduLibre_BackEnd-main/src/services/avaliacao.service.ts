import type { AvaliacaoPayload } from '../dtos/avaliacao.dto';
import Avaliacao from '../models/Avaliacao';
import Aula from '../models/Aula';
import User from '../models/User';
import HttpError from '../utils/http-error';
import { requireText, validateRating } from '../utils/validators';
import CacheService from './cache.service';

export default class AvaliacaoService {
  public static async create(payload: AvaliacaoPayload) {
    const aluno = await User.findByPk(payload.alunoId);
    if (!aluno) throw new HttpError(400, 'Utilizador inválido.');
    const aula = await Aula.findByPk(payload.aulaId);
    if (!aula) throw new HttpError(404, 'Aula não encontrada.');

    const avaliacao = await Avaliacao.create({
      aulaId: payload.aulaId,
      alunoId: payload.alunoId,
      nota: validateRating(payload.nota),
      comentario: payload.comentario
        ? requireText(payload.comentario, 'Comentário')
        : null,
    });

    await CacheService.invalidate('aulas');

    return avaliacao;
  }
}
