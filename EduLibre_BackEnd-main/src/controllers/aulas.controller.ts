import { Request, Response } from 'express';
import AulaService from '../services/aula.service';
import asyncHandler from '../utils/async-handler';

class AulasController {
  public static featured = asyncHandler(async (_req: Request, res: Response) => {
    const aulas = await AulaService.featured();
    res.status(200).json(aulas);
  });

  public static findAll = asyncHandler(async (req: Request, res: Response) => {
    const aulas = await AulaService.list(req.query as { materia?: string; professorId?: string; page?: string; pageSize?: string });
    res.status(200).json(aulas);
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
