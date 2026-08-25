import Permission from '../models/Permission';
import Role from '../models/Role';
import User from '../models/User';
import UserRoleAssignment from '../models/UserRoleAssignment';
import { Op } from 'sequelize';
import HttpError from '../utils/http-error';

export const PERMISSIONS = [
  {
    key: 'aulas.contratar',
    description: 'Permite agendar uma aula.',
  },
  {
    key: 'aulas.criar',
    description: 'Permite publicar uma aula.',
  },
  {
    key: 'aulas.editar_propria',
    description: 'Permite editar a própria aula.',
  },
  {
    key: 'aulas.excluir_propria',
    description: 'Permite excluir a própria aula.',
  },
  {
    key: 'usuarios.listar',
    description: 'Permite listar usuários.',
  },
  {
    key: 'usuarios.papel.gerenciar',
    description: 'Permite conceder e remover roles.',
  },
  {
    key: 'aulas.gerenciar_qualquer',
    description: 'Permite gerenciar qualquer aula.',
  },
  {
    key: 'aulas.bloquear',
    description: 'Permite bloquear aulas.',
  },
  {
    key: 'aulas.desbloquear',
    description: 'Permite desbloquear aulas.',
  },
  {
    key: 'admin.dashboard.visualizar',
    description: 'Permite visualizar o dashboard administrativo.',
  },
] as const;

type PermissionKey = (typeof PERMISSIONS)[number]['key'];

type RoleSeed = {
  key: string;
  name: string;
  isSuperAdmin: boolean;
  permissions: PermissionKey[];
};

const ROLE_SEEDS: RoleSeed[] = [
  {
    key: 'aluno',
    name: 'Aluno',
    isSuperAdmin: false,
    permissions: ['aulas.contratar'],
  },
  {
    key: 'professor',
    name: 'Professor',
    isSuperAdmin: false,
    permissions: [
      'aulas.criar',
      'aulas.editar_propria',
      'aulas.excluir_propria',
    ],
  },
  {
    key: 'admin',
    name: 'Administrador',
    isSuperAdmin: true,
    permissions: [],
  },
  {
    key: 'moderador',
    name: 'Moderador',
    isSuperAdmin: false,
    permissions: [
      'aulas.bloquear',
      'aulas.desbloquear',
      'aulas.gerenciar_qualquer',
    ],
  },
  {
    key: 'suporte',
    name: 'Suporte',
    isSuperAdmin: false,
    permissions: ['usuarios.listar'],
  },
];

export default class RbacService {
  public static async seed() {
    const permissionRecords = new Map<string, Permission>();

    for (const permissionData of PERMISSIONS) {
      const [permission] = await Permission.findOrCreate({
        where: { key: permissionData.key },
        defaults: permissionData,
      });

      permissionRecords.set(permissionData.key, permission);
    }

    for (const roleData of ROLE_SEEDS) {
      const [role] = await Role.findOrCreate({
        where: { key: roleData.key },
        defaults: {
          key: roleData.key,
          name: roleData.name,
          isSuperAdmin: roleData.isSuperAdmin,
        },
      });

      await role.update({
        name: roleData.name,
        isSuperAdmin: roleData.isSuperAdmin,
      });

      for (const permissionKey of roleData.permissions) {
        const permission = permissionRecords.get(permissionKey);

        if (permission) {
          await (role as any).addPermission(permission);
        }
      }
    }
  }

  public static async migrateLegacyUsers() {
    const adminRole = await Role.findOne({
      where: { key: 'admin' },
    });

    const alunoRole = await Role.findOne({
      where: { key: 'aluno' },
    });

    if (!adminRole || !alunoRole) {
      return;
    }

    const users = await User.findAll({
      attributes: ['id', 'tipo'],
    });

    for (const user of users) {
      await UserRoleAssignment.findOrCreate({
        where: {
          userId: user.id,
          roleId: alunoRole.id,
        },
      });

      if (user.tipo === 'admin') {
        await UserRoleAssignment.findOrCreate({
          where: {
            userId: user.id,
            roleId: adminRole.id,
          },
        });
      }
    }
  }

  public static async getAuthContext(userId: number) {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'usuarios',
          where: { id: userId },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });

    const permissions = new Set<string>();

    for (const role of roles) {
      const rolePermissions =
        (role.get('permissions') as Permission[] | undefined) ?? [];

      for (const permission of rolePermissions) {
        permissions.add(permission.key);
      }
    }

    return {
      roles: roles.map((role) => role.key),
      isSuperAdmin: roles.some((role) => role.isSuperAdmin),
      permissions: [...permissions],
    };
  }

  public static async grantRole(userId: number, roleKey: string) {
    const [user, role] = await Promise.all([
      User.findByPk(userId),
      Role.findOne({
        where: { key: roleKey },
      }),
    ]);

    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }

    if (!role) {
      throw new HttpError(400, 'Role inválida.');
    }

    await UserRoleAssignment.findOrCreate({
      where: {
        userId,
        roleId: role.id,
      },
    });

    return RbacService.getAuthContext(userId);
  }

  public static async revokeRole(userId: number, roleKey: string) {
    const [user, role] = await Promise.all([
      User.findByPk(userId),
      Role.findOne({
        where: { key: roleKey },
      }),
    ]);

    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }

    if (!role) {
      throw new HttpError(400, 'Role inválida.');
    }

    const assignment = await UserRoleAssignment.findOne({
      where: {
        userId,
        roleId: role.id,
      },
    });

    if (!assignment) {
      throw new HttpError(400, 'O usuário não possui esta role.');
    }

    if (role.isSuperAdmin) {
      await RbacService.ensureAnotherSuperAdminRemains(userId);
    }

    await assignment.destroy();

    return RbacService.getAuthContext(userId);
  }

  private static async ensureAnotherSuperAdminRemains(
    excludingUserId: number,
  ) {
    const superAdminRoles = await Role.findAll({
      where: { isSuperAdmin: true },
    });

    const roleIds = superAdminRoles.map((role) => role.id);

    const remainingSuperAdmins = await UserRoleAssignment.count({
      where: {
        roleId: {
          [Op.in]: roleIds,
        },
        userId: {
          [Op.ne]: excludingUserId,
        },
      },
    });

    if (remainingSuperAdmins === 0) {
      throw new HttpError(
        400,
        'Não é possível remover o último Administrador Master da plataforma.',
      );
    }
  }
}