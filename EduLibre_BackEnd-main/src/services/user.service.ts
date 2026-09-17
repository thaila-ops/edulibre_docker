import bcrypt from 'bcrypt';
import User from '../models/User';
import { AuthUser, UserRole } from '../types/api';
import { buildPage, getPageRequest } from '../utils/pagination';
import HttpError from '../utils/http-error';
import {
  requireText,
  validateBirthDate,
  validateCpf,
  validateEmail,
  validateOptionalUrl,
  validatePassword,
} from '../utils/validators';

type UserInput = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  dataNascimento: string;
  tipo: string;
  avatarUrl?: string;
  bio?: string;
};

type UserUpdate = {
  name: string;
  cpf: string;
  dataNascimento: string;
  tipo: string;
  password?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
};

type PageParams = {
  page?: string;
  pageSize?: string;
};

export default class UserService {
  public static async list(params: PageParams) {
    const pageRequest = getPageRequest(params.page, params.pageSize);
    const result = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit: pageRequest.limit,
      offset: pageRequest.offset,
      order: [['id', 'ASC']],
    });
    return buildPage(result.rows.map(UserService.toAuthUser), result.count, pageRequest.page, pageRequest.pageSize);
  }

  public static async findById(id: number) {
    const user = await User.findByPk(id);
    if (!user) throw new HttpError(404, 'Usuário não encontrado.');
    return UserService.toAuthUser(user);
  }

  public static async create(payload: UserInput) {
    const email = validateEmail(requireText(payload.email, 'E-mail'));
    const cpf = validateCpf(requireText(payload.cpf, 'CPF'));

    const userExists = await User.findOne({ where: { email } });
    if (userExists) throw new HttpError(409, 'Já existe utilizador com este e-mail.');

    const userWithCpf = await User.findOne({ where: { cpf } });
    if (userWithCpf) throw new HttpError(409, 'Já existe utilizador com este CPF.');

    const user = await User.create(await UserService.buildCreatePayload(payload));
    return UserService.toAuthUser(user);
  }

  public static async update(id: number, payload: UserUpdate) {
    if (payload.email) throw new HttpError(400, 'O e-mail não pode ser alterado.');
    const user = await User.findByPk(id);
    if (!user) throw new HttpError(404, 'Usuário não encontrado.');

    const cpf = validateCpf(requireText(payload.cpf, 'CPF'));
    const userWithCpf = await User.findOne({ where: { cpf } });
    if (userWithCpf && userWithCpf.id !== id) throw new HttpError(409, 'Já existe utilizador com este CPF.');

    await user.update(await UserService.buildUpdatePayload(payload, user.tipo));
    return UserService.toAuthUser(user);
  }

  public static async remove(id: number) {
    const user = await User.findByPk(id);
    if (!user) throw new HttpError(404, 'Usuário não encontrado.');
    await user.destroy();
  }

  public static async setRole(id: number, tipo: 'usuario' | 'admin') {
    const user = await User.findByPk(id);
    if (!user) throw new HttpError(404, 'Usuário não encontrado.');
    await user.update({ tipo });
    return UserService.toAuthUser(user);
  }

  public static async authenticate(emailValue: string, passwordValue: string) {
    const email = validateEmail(requireText(emailValue, 'E-mail'));
    const password = requireText(passwordValue, 'Senha');
    const user = await User.findOne({ where: { email } });
    if (!user) throw new HttpError(401, 'Usuário ou senha inválidos.');
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) throw new HttpError(401, 'Usuário ou senha inválidos.');
    return UserService.toAuthUser(user);
  }

  private static async buildCreatePayload(payload: UserInput) {
    const password = validatePassword(requireText(payload.password, 'Senha'));
    const dataNascimento = validateBirthDate(payload.dataNascimento);
    return {
      name: requireText(payload.name, 'Nome'),
      email: validateEmail(requireText(payload.email, 'E-mail')),
      cpf: validateCpf(requireText(payload.cpf, 'CPF')),
      dataNascimento,
      tipo: 'usuario' as const,
      avatarUrl: validateOptionalUrl(payload.avatarUrl),
      bio: payload.bio?.trim() || null,
      password: await bcrypt.hash(password, 10),
    };
  }

  private static async buildUpdatePayload(payload: UserUpdate, currentTipo: UserRole) {
    const dataNascimento = validateBirthDate(payload.dataNascimento);
    const updateData = {
      name: requireText(payload.name, 'Nome'),
      cpf: validateCpf(requireText(payload.cpf, 'CPF')),
      dataNascimento,
      tipo: currentTipo,
      avatarUrl: validateOptionalUrl(payload.avatarUrl),
      bio: payload.bio?.trim() || null,
      password: undefined as string | undefined,
    };
    if (!payload.password) return updateData;
    updateData.password = await bcrypt.hash(validatePassword(payload.password), 10);
    return updateData;
  }

  public static toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      dataNascimento: user.dataNascimento,
      tipo: user.tipo,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    };
  }
}