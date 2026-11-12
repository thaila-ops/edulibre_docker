import { useCallback } from 'react';
import DataTable from '../components/DataTable';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import usePaginatedResource from '../hooks/usePaginatedResource';
import usePagination from '../hooks/usePagination';
import { deleteUser, fetchUsers } from '../services/users';
import { User } from '../types';
import { getErrorMessage } from '../utils/validation';

function UsersPage() {
  const { page, pageSize, setPage } = usePagination();
  const loadPage = useCallback(
    () => fetchUsers({ page, pageSize }),
    [page, pageSize],
  );
  const { items, setItems, totalPages, error, setError } =
    usePaginatedResource<User>(loadPage);

  async function handleDelete(id: number) {
    try {
      setError('');
      await deleteUser(id);
      setItems((current: User[]) =>
        current.filter((item: User) => item.id !== id),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Utilizadores"
        description="CRUD completo de utilizadores com CPF, senha forte e e-mail imutável."
        actionLabel="Novo utilizador"
        actionTo="/app/usuarios/novo"
      />
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
