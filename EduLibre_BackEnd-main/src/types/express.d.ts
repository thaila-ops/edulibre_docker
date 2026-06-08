import type { JwtPayloadData } from './api';

declare global {
  namespace Express {
    interface Request {
      authUser?: JwtPayloadData;
    }
  }
}

export {};
