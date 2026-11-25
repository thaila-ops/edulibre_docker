import { requireAuthUser } from '../utils/auth-user';
import { Request, Response } from 'express';
import asyncHandler from '../utils/async-handler';
import UserService from '../services/user.service';
import TokenService from '../services/token.service';
import RbacService from '../services/rbac.service';
import PasswordResetService from '../services/password-reset.service';
import HealthService from '../services/health.service';

class AuthController {
  public static health = (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'EduLivre API',
    });
  };

  public static readiness = asyncHandler(async (_req: Request, res: Response) => {
    const readiness = await HealthService.readiness();
    res.status(readiness.healthy ? 200 : 503).json(readiness);
  });

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
    const user = await UserService.findById(requireAuthUser(req).id);

    const rbac = await RbacService.getAuthContext(user.id);

    res.status(200).json({
      ...user,
      ...rbac,
    });
  });

  public static requestPasswordReset = asyncHandler(async (req, res) => {
    await PasswordResetService.requestCode(req.body.email);
    res.status(200).json({
      message: 'Se houver uma conta com este e-mail, enviaremos um código para redefinir a senha.',
    });
  });

  public static resetPassword = asyncHandler(async (req, res) => {
    await PasswordResetService.resetPassword(req.body);
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  });
}

export default AuthController;
