import { Request, Response } from 'express';
import NotificacaoService from '../services/notificacao.service';
import asyncHandler from '../utils/async-handler';

class NotificacoesController {
  public static listarMinhas = asyncHandler(
    async (req: Request, res: Response) => {
      const notificacoes = await NotificacaoService.listarDoUsuario(
        req.authUser!.id,
      );

      res.status(200).json(notificacoes);
    },
  );

  public static marcarComoLida = asyncHandler(
    async (req: Request, res: Response) => {
      const notificacao =
        await NotificacaoService.marcarComoLida(
          Number(req.params.id),
          req.authUser!.id,
        );

      res.status(200).json(notificacao);
    },
  );
}

export default NotificacoesController;