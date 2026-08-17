import { Request, Response } from 'express';
import AulaService from '../services/aula.service';
import asyncHandler from '../utils/async-handler';

class AulasController {
  public static featured = asyncHandler(async (_req: Request, res: Response) => {
    const aulas = await AulaService.featured();
    res.status(200).json(aulas);
  });

  public static findAll = asyncHandler(async (req: Request, res: Response) => {
    // Rota pública: nunca lista aulas bloqueadas (sem status = AulaService aplica 'ativa').
    const filters = req.query as { materia?: string; professorId?: string; page?: string; pageSize?: string };
    const aulas = await AulaService.list(filters);
    res.status(200).json(aulas);
  });

  // Rota de admin (protegida por authMiddleware + adminMiddleware em app.ts):
  // aceita ?status=all|ativa|bloqueada pra gerenciar qualquer aula.
  public static findAllAdmin = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as { materia?: string; professorId?: string; page?: string; pageSize?: string; status?: string };
    const aulas = await AulaService.list({ ...filters, status: filters.status ?? 'all' });
    res.status(200).json(aulas);
  });

  public static block = asyncHandler(async (req: Request, res: Response) => {
    const aula = await AulaService.block(Number(req.params.id), req.body.motivo);
    res.status(200).json(aula);
  });

  public static unblock = asyncHandler(async (req: Request, res: Response) => {
    const aula = await AulaService.unblock(Number(req.params.id));
    res.status(200).json(aula);
  });

  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const aula = await AulaService.findById(Number(req.params.id));
    res.status(200).json(aula);
  });

  public static create = asyncHandler(async (req: Request, res: Response) => {
    const aula = await AulaService.create(req.body);
    res.status(201).json(aula);
  });

  public static update = asyncHandler(async (req: Request, res: Response) => {
    const aula = await AulaService.update(Number(req.params.id), req.body);
    res.status(200).json(aula);
  });

  public static remove = asyncHandler(async (req: Request, res: Response) => {
    await AulaService.remove(Number(req.params.id));
    res.status(204).send();
  });
}

export default AulasController;