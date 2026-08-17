import { NextFunction, Request, Response } from 'express';


function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser) return res.status(401).json({ message: 'Não autenticado.' });
  if (req.authUser.tipo !== 'admin') {
    return res.status(403).json({ message: 'Apenas administradores podem acessar este recurso.' });
  }
  return next();
}

export default adminMiddleware;