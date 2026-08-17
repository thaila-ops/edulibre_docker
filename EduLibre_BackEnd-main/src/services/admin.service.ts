import User from '../models/User';
import Aula from '../models/Aula';

export default class AdminService {
  public static async dashboard() {
    const [totalUsuarios, totalAdmins, totalAulas, aulasAtivas, aulasBloqueadas, professoresDistintos] = await Promise.all([
      User.count({ where: { tipo: 'usuario' } }),
      User.count({ where: { tipo: 'admin' } }),
      Aula.count(),
      Aula.count({ where: { status: 'ativa' } }),
      Aula.count({ where: { status: 'bloqueada' } }),
      Aula.count({ distinct: true, col: 'professorId' }),
    ]);

    return {
      totalAlunos: totalUsuarios - professoresDistintos >= 0 ? totalUsuarios - professoresDistintos : totalUsuarios,
      totalProfessores: professoresDistintos,
      totalUsuarios,
      totalAdmins,
      totalAulas,
      aulasAtivas,
      aulasBloqueadas,
    };
  }
}