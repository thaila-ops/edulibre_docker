import { Request, Response } from 'express';
import AdminService from '../services/admin.service';
import RbacService from '../services/rbac.service';
import asyncHandler from '../utils/async-handler';
import HttpError from '../utils/http-error';
import AnnouncementService from '../services/announcement.service';

class AdminController {
  public static dashboard = asyncHandler(
    async (_req: Request, res: Response) => {
      const stats = await AdminService.dashboard();
      res.status(200).json(stats);
    },
  );

  public static publishAnnouncement = asyncHandler(
    async (req: Request, res: Response) => {
      const { templateKey } = req.body as { templateKey?: string };

      if (!templateKey) {
        throw new HttpError(400, 'Informe o comunicado a publicar.');
      }

      const announcement = AnnouncementService.publish(templateKey);
      res.status(201).json(announcement);
    },
  );

  // Mantidas para compatibilidade com o front-end atual.
  public static promote = asyncHandler(async (req: Request, res: Response) => {
    const context = await RbacService.grantRole(Number(req.params.id), 'admin');

    res.status(200).json(context);
  });

  public static demote = asyncHandler(async (req: Request, res: Response) => {
    const context = await RbacService.revokeRole(
      Number(req.params.id),
      'admin',
    );

    res.status(200).json(context);
  });

  public static grantRole = asyncHandler(
    async (req: Request, res: Response) => {
      const { role } = req.body as { role?: string };

      if (!role) {
        throw new HttpError(400, 'Informe a role a conceder.');
      }

      const context = await RbacService.grantRole(Number(req.params.id), role);

      res.status(200).json(context);
    },
  );

  public static revokeRole = asyncHandler(
    async (req: Request, res: Response) => {
      const context = await RbacService.revokeRole(
        Number(req.params.id),
        String(req.params.role),
      );

      res.status(200).json(context);
    },
  );
}

export default AdminController;
