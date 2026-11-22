import { Request, Response } from 'express';
import AvaliacaoService from '../services/avaliacao.service';
import asyncHandler from '../utils/async-handler';
import { requireAuthUser } from '../utils/auth-user';

class AvaliacoesController {
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const avaliacao = await AvaliacaoService.create(
      req.body,
      requireAuthUser(req).id,
    );
    res.status(201).json(avaliacao);
  });
}

export default AvaliacoesController;
