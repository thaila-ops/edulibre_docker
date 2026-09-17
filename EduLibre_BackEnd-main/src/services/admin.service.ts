import User from '../models/User';
import Aula from '../models/Aula';
import Role from '../models/Role';
import UserRoleAssignment from '../models/UserRoleAssignment';

export default class AdminService {
  private static async countUsersWithRole(roleKey: string) {
    const role = await Role.findOne({
      where: { key: roleKey },
    });

    if (!role) {
      return 0;
    }

    return UserRoleAssignment.count({
      distinct: true,
      col: 'userId',
      where: {
        roleId: role.id,
      },
    });
  }

  public static async dashboard() {
    const [
      totalUsuarios,
      totalAlunos,
      totalProfessores,
      totalAdmins,
      totalModeradores,
      totalAulas,
      aulasAtivas,
      aulasBloqueadas,
    ] = await Promise.all([
      User.count(),
      AdminService.countUsersWithRole('aluno'),
      AdminService.countUsersWithRole('professor'),
      AdminService.countUsersWithRole('admin'),
      AdminService.countUsersWithRole('moderador'),
      Aula.count(),
      Aula.count({
        where: { status: 'ativa' },
      }),
      Aula.count({
        where: { status: 'bloqueada' },
      }),
    ]);

    return {
      totalUsuarios,
      totalAlunos,
      totalProfessores,
      totalAdmins,
      totalModeradores,
      totalAulas,
      aulasAtivas,
      aulasBloqueadas,
    };
  }
}