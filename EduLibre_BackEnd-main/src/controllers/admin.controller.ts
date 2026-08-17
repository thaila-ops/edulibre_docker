import { Request, Response } from 'express';
import AdminService from '../services/admin.service';
import UserService from '../services/user.service';
import asyncHandler from '../utils/async-handler';

class AdminController {
  public static dashboard = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await AdminService.dashboard();
    res.status(200).json(stats);
  });

  public static promote = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.setRole(Number(req.params.id), 'admin');
    res.status(200).json(user);
  });

  public static demote = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.setRole(Number(req.params.id), 'usuario');
    res.status(200).json(user);
  });
}

export default AdminController;