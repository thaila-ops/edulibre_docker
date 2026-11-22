import type { AgendamentoFilters } from '../dtos/agendamento.dto';
import { requireAuthUser } from '../utils/auth-user';
import { Request, Response } from 'express';
import AgendamentoService from '../services/agendamento.service';
import asyncHandler from '../utils/async-handler';
import HttpError from '../utils/http-error';

class AgendamentosController {
  public static findAll = asyncHandler(async (req: Request, res: Response) => {
    const authUser = requireAuthUser(req);
    const filters = req.query as AgendamentoFilters;

    if (filters.alunoId && Number(filters.alunoId) !== authUser.id) {
      throw new HttpError(
        403,
        'Você só pode listar os seus próprios agendamentos.',
      );
    }

    if (filters.professorId) {
      const ownsProfessorFilter =
        authUser.isSuperAdmin || Number(filters.professorId) === authUser.id;
      if (!ownsProfessorFilter) {
        throw new HttpError(
          403,
          'Você só pode listar agendamentos das suas aulas.',
        );
      }
    }

    const agendamentos = await AgendamentoService.list(
      {
        ...filters,
        alunoId: !filters.professorId && !authUser.isSuperAdmin
          ? String(authUser.id)
          : filters.alunoId,
      },
    );
    res.status(200).json(agendamentos);
  });

  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const authUser = requireAuthUser(req);
    const agendamento = await AgendamentoService.findById(Number(req.params.id));
    const agendamentoComRelacoes = agendamento as {
      alunoId: number;
      aula?: { professorId: number };
    };

    const canView =
      authUser.isSuperAdmin ||
      agendamentoComRelacoes.alunoId === authUser.id ||
      agendamentoComRelacoes.aula?.professorId === authUser.id;

    if (!canView) {
      throw new HttpError(
        403,
        'Você não pode visualizar este agendamento.',
      );
    }

    res.status(200).json(agendamento);
  });

  public static create = asyncHandler(async (req: Request, res: Response) => {
    const agendamento = await AgendamentoService.create(
      req.body,
      requireAuthUser(req).id,
    );
    res.status(201).json(agendamento);
  });

  public static update = asyncHandler(async (req: Request, res: Response) => {
    const agendamento = await AgendamentoService.update(
      Number(req.params.id),
      req.body,
      requireAuthUser(req).id,
    );
    res.status(200).json(agendamento);
  });

  public static remove = asyncHandler(async (req: Request, res: Response) => {
    await AgendamentoService.remove(
      Number(req.params.id),
      requireAuthUser(req).id,
    );
    res.status(204).send();
  });

  public static pay = asyncHandler(async (req: Request, res: Response) => {
    const authUserId = requireAuthUser(req).id;
    const agendamento = await AgendamentoService.pay(
      Number(req.params.id),
      authUserId,
    );
    res.status(200).json(agendamento);
  });

  public static accept = asyncHandler(async (req: Request, res: Response) => {
    const authUserId = requireAuthUser(req).id;
    const agendamento = await AgendamentoService.decide(
      Number(req.params.id),
      authUserId,
      'aceito',
    );
    res.status(200).json(agendamento);
  });

  public static reject = asyncHandler(async (req: Request, res: Response) => {
    const authUserId = requireAuthUser(req).id;
    const agendamento = await AgendamentoService.decide(
      Number(req.params.id),
      authUserId,
      'recusado',
    );
    res.status(200).json(agendamento);
  });
}

export default AgendamentosController;
