import { useState } from 'react';
import Feedback from '../components/Feedback';
import StatsGrid from '../components/StatsGrid';
import LessonModerationCard from '../components/admin/LessonModerationCard';
import useAdminDashboard from '../hooks/useAdminDashboard';
import {
  AnnouncementTemplateKey,
  publishAnnouncement,
} from '../services/admin';
import { getErrorMessage } from '../utils/validation';

const QUICK_ANNOUNCEMENTS: Array<{
  key: AnnouncementTemplateKey;
  label: string;
  description: string;
}> = [
  {
    key: 'maintenance',
    label: 'Manutenção programada',
    description: 'Avise sobre uma janela de manutenção.',
  },
  {
    key: 'instability',
    label: 'Instabilidade',
    description: 'Informe que a equipe está analisando um problema.',
  },
  {
    key: 'restored',
    label: 'Serviço normalizado',
    description: 'Comunique que a plataforma voltou ao normal.',
  },
  {
    key: 'news',
    label: 'Novidades',
    description: 'Convide os usuários a explorar recursos novos.',
  },
];

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
  const [announcementLoading, setAnnouncementLoading] = useState<AnnouncementTemplateKey | null>(null);
  const [announcementFeedback, setAnnouncementFeedback] = useState('');
  const [announcementError, setAnnouncementError] = useState('');

  async function handleAnnouncement(templateKey: AnnouncementTemplateKey) {
    try {
      setAnnouncementError('');
      setAnnouncementFeedback('');
      setAnnouncementLoading(templateKey);
      const announcement = await publishAnnouncement(templateKey);
      const emailStatus = announcement.emailFailureCount
        ? `${announcement.emailedCount} de ${announcement.recipientCount} e-mails enviados.`
        : `${announcement.emailedCount} e-mail(s) enviado(s).`;
      setAnnouncementFeedback(
        `Comunicado “${announcement.title}” transmitido em tempo real. ${emailStatus}`,
      );
    } catch (requestError) {
      setAnnouncementError(getErrorMessage(requestError));
    } finally {
      setAnnouncementLoading(null);
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

      <section className="form-card announcement-panel">
        <p className="eyebrow">Mensageria em tempo real</p>
        <h2>Comunicados rápidos</h2>
        <p className="muted">
          Dispare um aviso em tempo real e por e-mail para todos os usuários cadastrados.
        </p>
        <div className="announcement-grid">
          {QUICK_ANNOUNCEMENTS.map((announcement) => (
            <article className="announcement-card" key={announcement.key}>
              <h3>{announcement.label}</h3>
              <p>{announcement.description}</p>
              <button
                className="secondary-button"
                type="button"
                disabled={announcementLoading !== null}
                onClick={() => void handleAnnouncement(announcement.key)}
              >
                {announcementLoading === announcement.key ? 'Enviando...' : 'Enviar comunicado'}
              </button>
            </article>
          ))}
        </div>
        {announcementFeedback ? <Feedback variant="success" message={announcementFeedback} /> : null}
        {announcementError ? <Feedback message={announcementError} /> : null}
      </section>

      <section className="form-card moderation-panel">
        <h2>Moderar aulas</h2>

        {lessons.length === 0 ? (
          <p className="muted">Nenhuma aula encontrada.</p>
        ) : (
          <div className="grid-3 moderation-grid">
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
