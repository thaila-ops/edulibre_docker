import { Request, Response } from 'express';
import AvaliacaoService from '../services/avaliacao.service';
import asyncHandler from '../utils/async-handler';

class AvaliacoesController {
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const avaliacao = await AvaliacaoService.create(req.body);
    res.status(201).json(avaliacao);
  });
}

export default AvaliacoesController;
