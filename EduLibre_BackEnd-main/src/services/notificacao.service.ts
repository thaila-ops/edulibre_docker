import Notificacao from '../models/Notificacao';
import HttpError from '../utils/http-error';

type LessonNotificationData = {
  userId: number;
  aulaId: number;
  materia: string;
  motivo?: string | null;
};

export default class NotificacaoService {
  public static async aulaBloqueada(data: LessonNotificationData) {
    const motivo = data.motivo?.trim() || 'Não informado.';

    return Notificacao.create({
      userId: data.userId,
      aulaId: data.aulaId,
      tipo: 'aula_bloqueada',
      titulo: 'Aula bloqueada',
      mensagem: `Sua aula "${data.materia}" foi bloqueada. Motivo: ${motivo}`,
    });
  }

  public static async aulaDesbloqueada(data: LessonNotificationData) {
    return Notificacao.create({
      userId: data.userId,
      aulaId: data.aulaId,
      tipo: 'aula_desbloqueada',
      titulo: 'Aula desbloqueada',
      mensagem: `Sua aula "${data.materia}" foi desbloqueada e já pode voltar a ser exibida.`,
    });
  }
  public static async listarDoUsuario(userId: number) {
  return Notificacao.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
}

public static async marcarComoLida(
  notificacaoId: number,
  userId: number,
) {
  const notificacao = await Notificacao.findOne({
    where: {
      id: notificacaoId,
      userId,
    },
  });

  if (!notificacao) {
    throw new HttpError(404, 'Notificação não encontrada.');
  }

  await notificacao.update({ lida: true });

  return notificacao;
}
}