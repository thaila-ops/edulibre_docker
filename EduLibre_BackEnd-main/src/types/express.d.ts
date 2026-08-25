import type { JwtPayloadData, RbacContext } from './api';

declare global {
  namespace Express {
    interface Request {
     authUser?: JwtPayloadData &
      RbacContext & {
    tipo: 'usuario' | 'admin';
  };
    }
  }
}

export {};
