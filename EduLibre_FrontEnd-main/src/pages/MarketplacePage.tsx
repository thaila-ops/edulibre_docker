import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import Feedback from '../components/Feedback';
import Pagination from '../components/Pagination';
import LessonCard from '../components/lessons/LessonCard';
import { useAuth } from '../contexts/AuthContext';
import usePaginatedResource from '../hooks/usePaginatedResource';
import usePagination from '../hooks/usePagination';
import { fetchLessons } from '../services/lessons';
import { Lesson } from '../types';

function MarketplacePage() {
  const { token } = useAuth();
  const { page, pageSize, setPage } = usePagination();
  const loadPage = useCallback(
    () => fetchLessons({ page, pageSize }),
    [page, pageSize],
  );
  const { items, totalPages, error } = usePaginatedResource<Lesson>(loadPage);

  return (
    <main className="marketing-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Professores e aulas</p>
          <h2>Escolha um professor e agende sua próxima aula</h2>
          <p className="muted">
            Cada aula tem sua própria página, imagem, avaliações e contagem de
            agendamentos.
          </p>
        </div>
        <Link className="primary-button" to={token ? '/criar-aula' : '/login'}>
          Quero vender minhas aulas
        </Link>
      </div>

      {error ? <Feedback message={error} /> : null}
      <section className="grid-3 professores-grid">
        {items.map((lesson) => (
          <LessonCard lesson={lesson} key={lesson.id} />
        ))}
      </section>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default MarketplacePage;
