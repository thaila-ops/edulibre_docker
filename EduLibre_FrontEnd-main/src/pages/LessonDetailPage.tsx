import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Feedback from '../components/Feedback';
import { useAuth } from '../contexts/AuthContext';
import { createReview, fetchLesson } from '../services/http';
import { Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

function LessonDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState('');
  const [review, setReview] = useState({ nota: '5', comentario: '' });

  useEffect(() => {
    if (!id) return;
    fetchLesson(id).then(setLesson).catch((requestError) => setError(getErrorMessage(requestError)));
  }, [id]);

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lesson || !user) return;
    try {
      await createReview(lesson.id, {
        aulaId: lesson.id,
        alunoId: user.id,
        nota: Number(review.nota),
        comentario: review.comentario,
      });
      const refreshed = await fetchLesson(String(lesson.id));
      setLesson(refreshed);
      setReview({ nota: '5', comentario: '' });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  if (!lesson) return <main className="marketing-shell"><div className="center-card">Carregando aula...</div></main>;

  return (
    <main className="marketing-shell">
      <section className="hero-card compact">
        {lesson.imageUrl ? <img className="teacher_img teacher_photo" src={lesson.imageUrl} alt={lesson.materia} /> : null}
        <p className="eyebrow">{lesson.professor?.name}</p>
        <h2>{lesson.materia}</h2>
        <p className="muted">{lesson.descricao}</p>
        <p>R$ {lesson.valor}</p>
        <p className="muted">Agendamentos: {lesson.bookingCount ?? 0} · Pagos: {lesson.paidBookingCount ?? 0}</p>
        <div className="hero-actions">
          <Link className="primary-button" to={`/agendar-aula/${lesson.id}`}>Agendar aula</Link>
          <Link className="secondary-button" to="/professores">Voltar</Link>
        </div>
      </section>

      {error ? <Feedback message={error} /> : null}

      <section className="form-card">
        <p className="eyebrow">Avaliações</p>
        <h3>Nota média {lesson.averageRating ?? 0}</h3>
        <div className="grid-3">
          {(lesson.avaliacoes ?? []).map((item) => (
            <article className="info-card" key={item.id}>
              <h4>{item.aluno?.name ?? 'Aluno'}</h4>
              <p className="muted">Nota {item.nota}</p>
              <p>{item.comentario ?? 'Sem comentário.'}</p>
            </article>
          ))}
        </div>
      </section>

      {user ? (
        <form className="form-card" onSubmit={handleReview}>
          <p className="eyebrow">Avaliar aula</p>
          <div className="form-grid">
            <label className="field">
              <span>Nota</span>
              <select value={review.nota} onChange={(event) => setReview((current) => ({ ...current, nota: event.target.value }))}>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </label>
            <label className="field field-wide">
              <span>Comentário</span>
              <textarea value={review.comentario} onChange={(event) => setReview((current) => ({ ...current, comentario: event.target.value }))} />
            </label>
          </div>
          <button className="primary-button" type="submit">Enviar avaliação</button>
        </form>
      ) : null}
    </main>
  );
}

export default LessonDetailPage;
