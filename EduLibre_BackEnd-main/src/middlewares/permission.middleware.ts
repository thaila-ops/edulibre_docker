import { NextFunction, Request, Response } from 'express';

export function requirePermission(permissionKey: string) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.authUser) {
      return res.status(401).json({
        message: 'Não autenticado.',
      });
    }

    if (req.authUser.isSuperAdmin) {
      return next();
    }

    if (req.authUser.permissions.includes(permissionKey)) {
      return next();
    }

    return res.status(403).json({
      message: 'Você não tem permissão para executar esta ação.',
    });
  };
}

export function requireRole(roleKey: string) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.authUser) {
      return res.status(401).json({
        message: 'Não autenticado.',
      });
    }

    if (req.authUser.isSuperAdmin) {
      return next();
    }

    if (req.authUser.roles.includes(roleKey)) {
      return next();
    }

    return res.status(403).json({
      message: 'Acesso restrito.',
    });
  };
}