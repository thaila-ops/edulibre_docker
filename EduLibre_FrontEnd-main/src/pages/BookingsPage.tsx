import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import Table from '../components/Table';
import BookingStatus from '../components/bookings/BookingStatus';
import { useAuth } from '../contexts/AuthContext';
import usePaginatedResource from '../hooks/usePaginatedResource';
import usePagination from '../hooks/usePagination';
import { deleteBooking, fetchBookings, payBooking } from '../services/bookings';
import { Booking } from '../types';
import { getErrorMessage } from '../utils/validation';

function BookingsPage() {
  const { user } = useAuth();
  const { page, pageSize, setPage } = usePagination();
  const loadPage = useCallback(
    () => fetchBookings({ page, pageSize, alunoId: user?.id }),
    [page, pageSize, user?.id],
  );
  const { items, setItems, totalPages, error, setError } =
    usePaginatedResource<Booking>(loadPage, Boolean(user));

  async function handleDelete(id: number) {
    try {
      setError('');
      await deleteBooking(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handlePay(booking: Booking) {
    try {
      const updated = await payBooking(booking.id);
      setItems((current) =>
        current.map((item) => (item.id === booking.id ? updated : item)),
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <main className="marketing-shell">
      <PageHeader
        title="Meus agendamentos"
        description="Veja as aulas marcadas, o professor responsável e as datas já combinadas."
        actionLabel="Agendar aula"
        actionTo="/professores"
      />
      {error ? <Feedback message={error} /> : null}
      <Table
        headers={[
          'Aula',
          'Professor',
          'Data',
          'Status da solicitação',
          'Status do pagamento',
          'Ações',
        ]}
        isEmpty={!items.length}
        emptyMessage="Você ainda não possui agendamentos."
      >
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.aula?.materia ?? '-'}</td>
            <td>{item.aula?.professor?.name ?? '-'}</td>
            <td>{new Date(item.data).toLocaleString('pt-BR')}</td>
            <td>
              <BookingStatus status={item.bookingStatus} />
            </td>
            <td>{item.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}</td>
            <td className="actions">
              <Link to={`/agendamentos/${item.id}`}>Detalhes</Link>
              <button
                onClick={() => handlePay(item)}
                disabled={
                  item.paymentStatus === 'pago' ||
                  item.bookingStatus !== 'aceito'
                }
              >
                {item.paymentStatus === 'pago'
                  ? 'Pago'
                  : item.bookingStatus === 'aceito'
                    ? 'Pagar'
                    : item.bookingStatus === 'recusado'
                      ? 'Recusado'
                      : 'Aguardando aceite'}
              </button>
              <button onClick={() => void handleDelete(item.id)}>
                Cancelar
              </button>
            </td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default BookingsPage;
