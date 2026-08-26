import { useEffect, useState } from 'react';
import Feedback from '../components/Feedback';
import { fetchAdminDashboard } from '../services/http';
import { AdminDashboardStats } from '../types';
import { getErrorMessage } from '../utils/validation';

function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetchAdminDashboard();
        setStats(response);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="marketing-shell">
        <section className="hero-card compact">
          <p>Carregando painel administrativo...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="marketing-shell">
      <section className="hero-card compact">
        <p className="eyebrow">Administração</p>
        <h2>Painel administrativo</h2>
        <p className="muted">
          Visão geral da plataforma EduLivre.
        </p>
      </section>

      {error ? <Feedback message={error} /> : null}

      {stats ? (
        <section className="grid-3">
          <article className="info-card">
            <h3>Usuários</h3>
            <p>{stats.totalUsuarios}</p>
          </article>

          <article className="info-card">
            <h3>Alunos</h3>
            <p>{stats.totalAlunos}</p>
          </article>

          <article className="info-card">
            <h3>Professores</h3>
            <p>{stats.totalProfessores}</p>
          </article>

          <article className="info-card">
            <h3>Administradores</h3>
            <p>{stats.totalAdmins}</p>
          </article>

          <article className="info-card">
            <h3>Moderadores</h3>
            <p>{stats.totalModeradores}</p>
          </article>

          <article className="info-card">
            <h3>Total de aulas</h3>
            <p>{stats.totalAulas}</p>
          </article>

          <article className="info-card">
            <h3>Aulas ativas</h3>
            <p>{stats.aulasAtivas}</p>
          </article>

          <article className="info-card">
            <h3>Aulas bloqueadas</h3>
            <p>{stats.aulasBloqueadas}</p>
          </article>
        </section>
      ) : null}
    </main>
  );
}

export default AdminDashboardPage;