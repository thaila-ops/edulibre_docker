import { Request, Response } from 'express';
import AulaService from '../services/aula.service';
import NotificacaoService from '../services/notificacao.service';
import asyncHandler from '../utils/async-handler';
import HttpError from '../utils/http-error';

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
  const aula = await AulaService.block(
    Number(req.params.id),
    req.body.motivo,
  );

  await NotificacaoService.aulaBloqueada({
    userId: aula.professorId,
    aulaId: aula.id,
    materia: aula.materia,
    motivo: aula.motivoBloqueio,
  });

  res.status(200).json(aula);
});

public static unblock = asyncHandler(async (req: Request, res: Response) => {
  const aula = await AulaService.unblock(Number(req.params.id));

  await NotificacaoService.aulaDesbloqueada({
    userId: aula.professorId,
    aulaId: aula.id,
    materia: aula.materia,
  });

  res.status(200).json(aula);
});

  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const aula = await AulaService.findById(Number(req.params.id));
    res.status(200).json(aula);
  });

 public static create = asyncHandler(async (req: Request, res: Response) => {
  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.imageUrl;

  const aula = await AulaService.create({
    ...req.body,
    imageUrl,
    professorId: req.authUser!.id,
  });

  res.status(201).json(aula);
});

 

public static update = asyncHandler(async (req: Request, res: Response) => {
  const aulaAtual = await AulaService.findById(Number(req.params.id));

  if (aulaAtual.professorId !== req.authUser!.id) {
    throw new HttpError(
      403,
      'Você só pode editar a própria aula.',
    );
  }

  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.imageUrl ?? aulaAtual.imageUrl;

  const aula = await AulaService.update(Number(req.params.id), {
    ...req.body,
    imageUrl,
    professorId: req.authUser!.id,
  });

  res.status(200).json(aula);
});

  

public static remove = asyncHandler(async (req: Request, res: Response) => {
  const aulaAtual = await AulaService.findById(Number(req.params.id));

  if (aulaAtual.professorId !== req.authUser!.id) {
    throw new HttpError(
      403,
      'Você só pode excluir a própria aula.',
    );
  }

  await AulaService.remove(Number(req.params.id));

  res.status(204).send();
});
}

export default AulasController;