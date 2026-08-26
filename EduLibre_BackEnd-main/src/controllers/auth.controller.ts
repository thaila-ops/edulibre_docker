import { Request, Response } from 'express';
import asyncHandler from '../utils/async-handler';
import UserService from '../services/user.service';
import TokenService from '../services/token.service';
import RbacService from '../services/rbac.service';

class AuthController {
  public static health = (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'EduLivre API',
    });
  };

  public static login = asyncHandler(async (req, res) => {
    const user = await UserService.authenticate(
      req.body.email,
      req.body.password,
    );

    const rbac = await RbacService.getAuthContext(user.id);

    const token = TokenService.sign({
      id: user.id,
      email: user.email,
    });

    res.status(200).json({
      message: 'Usuário autenticado.',
      token,
      user: {
        ...user,
        ...rbac,
      },
    });
  });

  public static me = asyncHandler(async (req, res) => {
    const user = await UserService.findById(req.authUser!.id);

    const rbac = await RbacService.getAuthContext(user.id);

    res.status(200).json({
      ...user,
      ...rbac,
    });
  });
}

export default AuthController;