import Feedback from '../components/Feedback';
import StatsGrid from '../components/StatsGrid';
import LessonModerationCard from '../components/admin/LessonModerationCard';
import useAdminDashboard from '../hooks/useAdminDashboard';

function AdminDashboardPage() {
  const {
    stats,
    lessons,
    error,
    loading,
    actionLoadingId,
    handleBlock,
    handleUnblock,
  } = useAdminDashboard();

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
        <p className="muted">Visão geral e moderação da plataforma.</p>
      </section>

      {error ? <Feedback message={error} /> : null}

      {stats ? (
        <StatsGrid
          items={[
            { label: 'Usuários', value: stats.totalUsuarios },
            { label: 'Alunos', value: stats.totalAlunos },
            { label: 'Professores', value: stats.totalProfessores },
            { label: 'Administradores', value: stats.totalAdmins },
            { label: 'Moderadores', value: stats.totalModeradores },
            { label: 'Total de aulas', value: stats.totalAulas },
            { label: 'Aulas ativas', value: stats.aulasAtivas },
            { label: 'Aulas bloqueadas', value: stats.aulasBloqueadas },
          ]}
        />
      ) : null}

      <section className="form-card">
        <h2>Moderar aulas</h2>

        {lessons.length === 0 ? (
          <p className="muted">Nenhuma aula encontrada.</p>
        ) : (
          <div className="grid-3">
            {lessons.map((lesson) => (
              <LessonModerationCard
                key={lesson.id}
                lesson={lesson}
                isLoading={actionLoadingId === lesson.id}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboardPage;
