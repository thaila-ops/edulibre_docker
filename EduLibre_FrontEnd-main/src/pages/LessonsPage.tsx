import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import usePagination from '../hooks/usePagination';
import { useAuth } from '../contexts/AuthContext';
import { deleteLesson, fetchLessons } from '../services/http';
import { Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

function LessonsPage() {
  const { user } = useAuth();
  const { page, pageSize, setPage } = usePagination();
  const [items, setItems] = useState<Lesson[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    fetchLessons({ page, pageSize, professorId: user.id })
      .then((response) => {
        setItems(response.data);
        setTotalPages(response.totalPages);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [page, pageSize, user]);

  async function handleDelete(id: number) {
    await deleteLesson(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <main className="marketing-shell">
      <PageHeader title="Minhas aulas" description="Gerencie as aulas que você publicou para receber novos agendamentos." actionLabel="Publicar aula" actionTo="/criar-aula" />
      {error ? <Feedback message={error} /> : null}
      <DataTable<Lesson>
        items={items}
        editBasePath="/minhas-aulas"
        onDelete={handleDelete}
        columns={[
          { key: 'materia', label: 'Matéria', render: (item) => item.materia },
          { key: 'valor', label: 'Valor', render: (item) => `R$ ${item.valor}` },
          { key: 'professor', label: 'Professor', render: (item) => item.professor?.name ?? '-' },
          {
            key: 'alunos',
            label: 'Alunos',
            render: (item) => <Link to={`/minhas-aulas/${item.id}/alunos`}>Ver alunos</Link>,
          },
        ]}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default LessonsPage;
