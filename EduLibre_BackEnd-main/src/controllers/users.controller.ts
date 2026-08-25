import { Request, Response } from 'express';
import UserService from '../services/user.service';
import asyncHandler from '../utils/async-handler';
import HttpError from '../utils/http-error';
import RbacService from '../services/rbac.service';

class UsersController {
  public static findAll = asyncHandler(async (req: Request, res: Response) => {
    const users = await UserService.list(req.query as { page?: string; pageSize?: string });
    res.status(200).json(users);
  });

  public static profile = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.findById(req.authUser!.id);
    res.status(200).json(user);
  });

  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.findById(Number(req.params.id));
    res.status(200).json(user);
  });

  public static create = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.create(req.body);

    await RbacService.grantRole(user.id, 'aluno');

    res.status(201).json(user);
  });

  public static update = asyncHandler(async (req: Request, res: Response) => {
    const targetUserId = Number(req.params.id);
    const authUserId = req.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Não autenticado.');
    if (authUserId !== targetUserId) {
      throw new HttpError(403, 'Você só pode editar o próprio perfil.');
    }

    const user = await UserService.update(targetUserId, req.body);
    res.status(200).json(user);
  });

  public static remove = asyncHandler(async (req: Request, res: Response) => {
    const targetUserId = Number(req.params.id);
    const authUserId = req.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Não autenticado.');
    if (authUserId !== targetUserId) {
      throw new HttpError(403, 'Você só pode remover o próprio perfil.');
    }

    await UserService.remove(targetUserId);
    res.status(204).send();
  });
}

export default UsersController;
