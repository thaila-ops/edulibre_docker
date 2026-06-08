import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import usePagination from '../hooks/usePagination';
import { deleteUser, fetchUsers } from '../services/http';
import { User } from '../types';
import { getErrorMessage } from '../utils/validation';

function UsersPage() {
  const { page, pageSize, setPage } = usePagination();
  const [items, setItems] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers({ page, pageSize })
      .then((response) => {
        setItems(response.data);
        setTotalPages(response.totalPages);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [page, pageSize]);

  async function handleDelete(id: number) {
    await deleteUser(id);
    setItems((current: User[]) => current.filter((item: User) => item.id !== id));
  }

  return (
    <section>
      <PageHeader title="Utilizadores" description="CRUD completo de utilizadores com CPF, senha forte e e-mail imutável." actionLabel="Novo utilizador" actionTo="/app/usuarios/novo" />
      {error ? <Feedback message={error} /> : null}
      <DataTable<User>
        items={items}
        editBasePath="/app/usuarios"
        onDelete={handleDelete}
        columns={[
          { key: 'name', label: 'Nome', render: (item) => item.name },
          { key: 'email', label: 'E-mail', render: (item) => item.email },
          { key: 'cpf', label: 'CPF', render: (item) => item.cpf },
          { key: 'tipo', label: 'Perfil', render: (item) => item.tipo },
        ]}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

export default UsersPage;
