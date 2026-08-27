import Notificacao from '../models/Notificacao';

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
}