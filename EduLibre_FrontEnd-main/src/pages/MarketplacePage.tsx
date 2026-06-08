import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Feedback from '../components/Feedback';
import Pagination from '../components/Pagination';
import { useAuth } from '../contexts/AuthContext';
import usePagination from '../hooks/usePagination';
import { fetchLessons } from '../services/http';
import { Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

function MarketplacePage() {
  const { token } = useAuth();
  const { page, pageSize, setPage } = usePagination();
  const [items, setItems] = useState<Lesson[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLessons({ page, pageSize })
      .then((response) => {
        setItems(response.data);
        setTotalPages(response.totalPages);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [page, pageSize]);

  return (
    <main className="marketing-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Professores e aulas</p>
          <h2>Escolha um professor e agende sua próxima aula</h2>
          <p className="muted">Cada aula tem sua própria página, imagem, avaliações e contagem de agendamentos.</p>
        </div>
        <Link className="primary-button" to={token ? '/criar-aula' : '/login'}>
          Quero vender minhas aulas
        </Link>
      </div>

      {error ? <Feedback message={error} /> : null}

      <section className="grid-3">
        {items.map((lesson) => (
          <article className="info-card" key={lesson.id}>
            {lesson.imageUrl ? <img className="teacher_img teacher_photo" src={lesson.imageUrl} alt={lesson.materia} /> : <div className="teacher_img"></div>}
            <p className="eyebrow">{lesson.professor?.name ?? 'Professor'}</p>
            <h3>{lesson.materia}</h3>
            <p className="muted">{lesson.descricao ?? 'Aula individual anunciada no EduLivre.'}</p>
            <p><strong>Valor:</strong> R$ {lesson.valor}</p>
            <p className="muted">Nota {lesson.averageRating ?? 0} · {lesson.reviewCount ?? 0} avaliações</p>
            <div className="hero-actions">
              <Link className="secondary-button" to={`/aula/${lesson.id}`}>Ver detalhes</Link>
              <Link className="primary-button" to={`/agendar-aula/${lesson.id}`}>Agendar aula</Link>
            </div>
          </article>
        ))}
      </section>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default MarketplacePage;
