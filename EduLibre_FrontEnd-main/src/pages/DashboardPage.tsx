import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Feedback from '../components/Feedback';
import { useAuth } from '../contexts/AuthContext';
import { deleteLesson, fetchBookings, fetchLessons } from '../services/http';
import { Booking, Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

function DashboardPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    fetchLessons({ page: 1, pageSize: 20, professorId: user.id })
      .then((response) => setLessons(response.data))
      .catch((requestError) => setError(getErrorMessage(requestError)));

    fetchBookings({ page: 1, pageSize: 20, alunoId: user.id })
      .then((response) => setBookings(response.data))
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [user]);

  async function handleDeleteLesson(lessonId: number) {
    if (!window.confirm('Tem certeza que deseja excluir esta aula?')) return;

    try {
      await deleteLesson(lessonId);
      setLessons((current) => current.filter((lesson) => lesson.id !== lessonId));
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  const soldBookings = lessons.reduce((total, lesson) => total + (lesson.bookingCount ?? 0), 0);
  const paidBookings = lessons.reduce((total, lesson) => total + (lesson.paidBookingCount ?? 0), 0);

  return (
    <main className="marketing-shell">
      <section className="hero-card compact">
        {user?.avatarUrl ? <img className="teacher_img teacher_photo" src={user.avatarUrl} alt={user.name} /> : null}
        <p className="eyebrow">Minha conta</p>
        <h2>Olá, {user?.name}</h2>
        <p className="muted">{user?.bio ?? 'Você pode agendar aulas, vender aulas ou fazer os dois com a mesma conta.'}</p>
        <div className="hero-actions">
          <Link className="primary-button" to="/criar-aula">Publicar aula</Link>
          <Link className="secondary-button" to="/professores">Agendar aula</Link>
          <Link className="secondary-button" to="/agendamentos-recebidos">Agendamentos recebidos</Link>
          <Link className="secondary-button" to="/perfil/editar">Editar foto de perfil</Link>
          <Link className="secondary-button" to="/perfil">Ver perfil</Link>
        </div>
      </section>

      {error ? <Feedback message={error} /> : null}

      <section className="grid-3">
        <article className="info-card">
          <h3>Minhas aulas</h3>
          <p>{lessons.length}</p>
        </article>
        <article className="info-card">
          <h3>Agendamentos recebidos</h3>
          <p>{soldBookings}</p>
        </article>
        <article className="info-card">
          <h3>Pagamentos confirmados</h3>
          <p>{paidBookings}</p>
        </article>
      </section>

      <section className="teachers">
        <h2>Aulas que você vende</h2>
        <div className="hero-actions" style={{ marginBottom: 12 }}>
          <Link className="secondary-button" to="/minhas-aulas">Abrir Minhas aulas</Link>
        </div>
        {!lessons.length ? <p className="muted">Você não tem aulas à venda.</p> : null}
        <div className="teachers_grid">
          {lessons.map((lesson) => (
            <div className="teacher_card" key={lesson.id}>
              {lesson.imageUrl ? <img className="teacher_img teacher_photo" src={lesson.imageUrl} alt={lesson.materia} /> : <div className="teacher_img"></div>}
              <h4>{lesson.materia}</h4>
              <span>{lesson.bookingCount ?? 0} agendamentos · {lesson.paidBookingCount ?? 0} pagos</span>
              <Link to={`/minhas-aulas/${lesson.id}/editar`}><button>Editar aula</button></Link>
              <Link to={`/minhas-aulas/${lesson.id}/alunos`}><button>Ver alunos</button></Link>
              <button onClick={() => void handleDeleteLesson(lesson.id)}>Deletar aula</button>
            </div>
          ))}
        </div>
      </section>

      <section className="teachers">
        <h2>Meus agendamentos como aluno</h2>
        <div className="teachers_grid">
          {bookings.map((booking) => (
            <div className="teacher_card" key={booking.id}>
              <h4>{booking.aula?.materia}</h4>
              <span>{booking.aula?.professor?.name}</span>
              <p className="muted">{new Date(booking.data).toLocaleString('pt-BR')}</p>
              <Link to={`/agendamentos/${booking.id}`}><button>Ver agendamento</button></Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
