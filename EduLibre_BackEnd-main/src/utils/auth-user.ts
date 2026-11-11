import type { Request } from 'express';
import HttpError from './http-error';

export function requireAuthUser(req: Request) {
  if (!req.authUser) {
    throw new HttpError(401, 'Não autenticado.');
  }

  return req.authUser;
}
