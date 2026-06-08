import jwt from 'jsonwebtoken';
import { JwtPayloadData } from '../types/api';

export default class TokenService {
  public static sign(payload: JwtPayloadData) {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '8h' });
  }

  public static verify(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadData;
  }
}
