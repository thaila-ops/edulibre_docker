import { useEffect, useState } from 'react';
import Feedback from '../components/Feedback';
import {
  blockLesson,
  fetchAdminDashboard,
  fetchAdminLessons,
  unblockLesson,
} from '../services/http';
import { AdminDashboardStats, Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboard, lessonsResponse] = await Promise.all([
          fetchAdminDashboard(),
          fetchAdminLessons(),
        ]);

        setStats(dashboard);
        setLessons(lessonsResponse.data);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  async function handleBlock(lesson: Lesson) {
    const motivo = window.prompt(
      `Informe o motivo para bloquear a aula "${lesson.materia}":`,
    );

    if (motivo === null) return;

    if (!motivo.trim()) {
      setError('Informe um motivo para bloquear a aula.');
      return;
    }

    try {
      setError('');
      setActionLoadingId(lesson.id);

      const updatedLesson = await blockLesson(lesson.id, motivo);

      setLessons((current) =>
        current.map((item) =>
          item.id === updatedLesson.id ? updatedLesson : item,
        ),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleUnblock(lesson: Lesson) {
    try {
      setError('');
      setActionLoadingId(lesson.id);

      const updatedLesson = await unblockLesson(lesson.id);

      setLessons((current) =>
        current.map((item) =>
          item.id === updatedLesson.id ? updatedLesson : item,
        ),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoadingId(null);
    }
  }

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

      <section className="form-card">
        <h2>Moderar aulas</h2>

        {lessons.length === 0 ? (
          <p className="muted">Nenhuma aula encontrada.</p>
        ) : (
          <div className="grid-3">
            {lessons.map((lesson) => {
              const isBlocked = lesson.status === 'bloqueada';
              const isLoading = actionLoadingId === lesson.id;

              return (
                <article className="info-card" key={lesson.id}>
                  <h3>{lesson.materia}</h3>

                  <p className="muted">
                    Professor: {lesson.professor?.name ?? 'Não informado'}
                  </p>

                  <p>
                    Status:{' '}
                    <strong>{isBlocked ? 'Bloqueada' : 'Ativa'}</strong>
                  </p>

                  {isBlocked && lesson.motivoBloqueio ? (
                    <p className="muted">
                      Motivo: {lesson.motivoBloqueio}
                    </p>
                  ) : null}

                  {isBlocked ? (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        void handleUnblock(lesson);
                      }}
                    >
                      {isLoading ? 'Desbloqueando...' : 'Desbloquear aula'}
                    </button>
                  ) : (
                    <button
                      className="primary-button"
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        void handleBlock(lesson);
                      }}
                    >
                      {isLoading ? 'Bloqueando...' : 'Bloquear aula'}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboardPage;