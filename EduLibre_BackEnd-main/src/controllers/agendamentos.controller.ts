import { Request, Response } from 'express';
import AgendamentoService from '../services/agendamento.service';
import asyncHandler from '../utils/async-handler';
import HttpError from '../utils/http-error';

class AgendamentosController {
  public static findAll = asyncHandler(async (req: Request, res: Response) => {
    const agendamentos = await AgendamentoService.list(req.query as { alunoId?: string; aulaId?: string; professorId?: string; page?: string; pageSize?: string });
    res.status(200).json(agendamentos);
  });

  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const agendamento = await AgendamentoService.findById(Number(req.params.id));
    res.status(200).json(agendamento);
  });

  public static create = asyncHandler(async (req: Request, res: Response) => {
    const agendamento = await AgendamentoService.create(req.body);
    res.status(201).json(agendamento);
  });

  public static update = asyncHandler(async (req: Request, res: Response) => {
    const agendamento = await AgendamentoService.update(Number(req.params.id), req.body);
    res.status(200).json(agendamento);
  });

  public static remove = asyncHandler(async (req: Request, res: Response) => {
    await AgendamentoService.remove(Number(req.params.id));
    res.status(204).send();
  });

  public static pay = asyncHandler(async (req: Request, res: Response) => {
    const authUserId = req.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Não autenticado.');
    const agendamento = await AgendamentoService.pay(Number(req.params.id), authUserId);
    res.status(200).json(agendamento);
  });

  public static accept = asyncHandler(async (req: Request, res: Response) => {
    const authUserId = req.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Não autenticado.');
    const agendamento = await AgendamentoService.decide(Number(req.params.id), authUserId, 'aceito');
    res.status(200).json(agendamento);
  });

  public static reject = asyncHandler(async (req: Request, res: Response) => {
    const authUserId = req.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Não autenticado.');
    const agendamento = await AgendamentoService.decide(Number(req.params.id), authUserId, 'recusado');
    res.status(200).json(agendamento);
  });
}

export default AgendamentosController;
