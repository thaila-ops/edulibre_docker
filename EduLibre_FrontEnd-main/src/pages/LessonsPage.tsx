import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { useAuth } from '../contexts/AuthContext';
import usePaginatedResource from '../hooks/usePaginatedResource';
import usePagination from '../hooks/usePagination';
import { deleteLesson, fetchLessons } from '../services/lessons';
import { Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

function LessonsPage() {
  const { user } = useAuth();
  const { page, pageSize, setPage } = usePagination();
  const loadPage = useCallback(
    () => fetchLessons({ page, pageSize, professorId: user?.id }),
    [page, pageSize, user?.id],
  );
  const { items, setItems, totalPages, error, setError } =
    usePaginatedResource<Lesson>(loadPage, Boolean(user));

  async function handleDelete(id: number) {
    try {
      setError('');
      await deleteLesson(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <main className="marketing-shell">
      <PageHeader
        title="Minhas aulas"
        description="Gerencie as aulas que você publicou para receber novos agendamentos."
        actionLabel="Publicar aula"
        actionTo="/criar-aula"
      />
      {error ? <Feedback message={error} /> : null}
      <DataTable<Lesson>
        items={items}
        editBasePath="/minhas-aulas"
        onDelete={handleDelete}
        columns={[
          { key: 'materia', label: 'Matéria', render: (item) => item.materia },
          {
            key: 'valor',
            label: 'Valor',
            render: (item) => `R$ ${item.valor}`,
          },
          {
            key: 'professor',
            label: 'Professor',
            render: (item) => item.professor?.name ?? '-',
          },
          {
            key: 'alunos',
            label: 'Alunos',
            render: (item) => (
              <Link to={`/minhas-aulas/${item.id}/alunos`}>Ver alunos</Link>
            ),
          },
        ]}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default LessonsPage;
