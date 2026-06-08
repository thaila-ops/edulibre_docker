import Avaliacao from '../models/Avaliacao';
import Aula from '../models/Aula';
import User from '../models/User';
import HttpError from '../utils/http-error';
import { requireText, validateRating } from '../utils/validators';

type AvaliacaoPayload = {
  aulaId: number;
  alunoId: number;
  nota: number;
  comentario?: string;
};

export default class AvaliacaoService {
  public static async create(payload: AvaliacaoPayload) {
    const aluno = await User.findByPk(payload.alunoId);
    if (!aluno) throw new HttpError(400, 'Utilizador inválido.');
    const aula = await Aula.findByPk(payload.aulaId);
    if (!aula) throw new HttpError(404, 'Aula não encontrada.');
    return Avaliacao.create({
      aulaId: payload.aulaId,
      alunoId: payload.alunoId,
      nota: validateRating(payload.nota),
      comentario: payload.comentario ? requireText(payload.comentario, 'Comentário') : null,
    });
  }
}
