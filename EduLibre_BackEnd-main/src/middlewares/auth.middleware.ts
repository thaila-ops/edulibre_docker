import { NextFunction, Request, Response } from 'express';
import TokenService from '../services/token.service';
import User from '../models/User';

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ message: 'Token não informado.' });
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Token inválido.' });
  try {
    const payload = TokenService.verify(token);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'Utilizador autenticado não existe mais.' });
    req.authUser = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido.' });
  }
}

export default authMiddleware;
