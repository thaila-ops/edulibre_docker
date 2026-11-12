import { useCallback } from 'react';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import Table from '../components/Table';
import BookingDecisionActions, {
  BookingDecision,
} from '../components/bookings/BookingDecisionActions';
import BookingStatus from '../components/bookings/BookingStatus';
import { useAuth } from '../contexts/AuthContext';
import usePaginatedResource from '../hooks/usePaginatedResource';
import usePagination from '../hooks/usePagination';
import {
  acceptBooking,
  fetchBookings,
  rejectBooking,
} from '../services/bookings';
import { Booking } from '../types';
import { getErrorMessage } from '../utils/validation';

function ReceivedBookingsPage() {
  const { user } = useAuth();
  const { page, pageSize, setPage } = usePagination();
  const loadPage = useCallback(
    () => fetchBookings({ page, pageSize, professorId: user?.id }),
    [page, pageSize, user?.id],
  );
  const { items, setItems, totalPages, error, setError } =
    usePaginatedResource<Booking>(loadPage, Boolean(user));

  async function handleDecision(item: Booking, decision: BookingDecision) {
    try {
      const updated =
        decision === 'aceitar'
          ? await acceptBooking(item.id)
          : await rejectBooking(item.id);
      setItems((current) =>
        current.map((booking) => (booking.id === item.id ? updated : booking)),
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <main className="marketing-shell">
      <PageHeader
        title="Agendamentos recebidos"
        description="Aprove ou recuse solicitações antes de o aluno pagar."
        actionLabel="Voltar para minha conta"
        actionTo="/conta"
      />
      {error ? <Feedback message={error} /> : null}

      <Table
        headers={['Aula', 'Aluno', 'Data', 'Status', 'Pagamento', 'Ações']}
        isEmpty={!items.length}
        emptyMessage="Você ainda não recebeu agendamentos."
      >
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.aula?.materia ?? '-'}</td>
            <td>{item.aluno?.name ?? '-'}</td>
            <td>{new Date(item.data).toLocaleString('pt-BR')}</td>
            <td>
              <BookingStatus status={item.bookingStatus} />
            </td>
            <td>{item.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}</td>
            <td className="actions">
              <BookingDecisionActions
                booking={item}
                onDecision={handleDecision}
              />
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default ReceivedBookingsPage;
