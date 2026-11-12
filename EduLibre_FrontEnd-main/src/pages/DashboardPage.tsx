import { Link } from 'react-router-dom';
import Feedback from '../components/Feedback';
import StatsGrid from '../components/StatsGrid';
import BookingSummaryCard from '../components/dashboard/BookingSummaryCard';
import OwnedLessonCard from '../components/dashboard/OwnedLessonCard';
import useAccountDashboard from '../hooks/useAccountDashboard';

function DashboardPage() {
  const {
    user,
    lessons,
    bookings,
    error,
    isProfessor,
    soldBookings,
    paidBookings,
    handleBecomeProfessor,
    handleDeleteLesson,
  } = useAccountDashboard();

  return (
    <main className="marketing-shell">
      <section className="hero-card compact">
        {user?.avatarUrl ? (
          <img
            className="teacher_img teacher_photo"
            src={user.avatarUrl}
            alt={user.name}
          />
        ) : null}
        <p className="eyebrow">Minha conta</p>
        <h2>Olá, {user?.name}</h2>
        <p className="muted">
          {user?.bio ??
            'Você pode agendar aulas, vender aulas ou fazer os dois com a mesma conta.'}
        </p>
        <div className="hero-actions">
          <Link className="secondary-button" to="/professores">
            Agendar aula
          </Link>
          {isProfessor ? (
            <>
              <Link className="primary-button" to="/criar-aula">
                Publicar aula
              </Link>

              <Link className="secondary-button" to="/agendamentos-recebidos">
                Agendamentos recebidos
              </Link>
            </>
          ) : (
            <button
              className="primary-button"
              onClick={() => void handleBecomeProfessor()}
            >
              Quero publicar aulas
            </button>
          )}
          <Link className="secondary-button" to="/perfil/editar">
            Editar foto de perfil
          </Link>
          <Link className="secondary-button" to="/perfil">
            Ver perfil
          </Link>
        </div>
      </section>

      {error ? <Feedback message={error} /> : null}

      <StatsGrid
        items={[
          { label: 'Minhas aulas', value: lessons.length },
          { label: 'Agendamentos recebidos', value: soldBookings },
          { label: 'Pagamentos confirmados', value: paidBookings },
        ]}
      />

      <section className="teachers">
        <h2>Aulas que você vende</h2>
        <div className="hero-actions" style={{ marginBottom: 12 }}>
          <Link className="secondary-button" to="/minhas-aulas">
            Abrir Minhas aulas
          </Link>
        </div>
        {!lessons.length ? (
          <p className="muted">Você não tem aulas à venda.</p>
        ) : null}
        <div className="teachers_grid">
          {lessons.map((lesson) => (
            <OwnedLessonCard
              key={lesson.id}
              lesson={lesson}
              onDelete={handleDeleteLesson}
            />
          ))}
        </div>
      </section>

      <section className="teachers">
        <h2>Meus agendamentos como aluno</h2>
        <div className="teachers_grid">
          {bookings.map((booking) => (
            <BookingSummaryCard key={booking.id} booking={booking} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
