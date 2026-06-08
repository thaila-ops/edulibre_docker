import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import usePagination from '../hooks/usePagination';
import { useAuth } from '../contexts/AuthContext';
import { deleteBooking, fetchBookings, payBooking } from '../services/http';
import { Booking } from '../types';
import { getErrorMessage } from '../utils/validation';

function BookingsPage() {
  const { user } = useAuth();
  const { page, pageSize, setPage } = usePagination();
  const [items, setItems] = useState<Booking[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    fetchBookings({ page, pageSize, alunoId: user.id })
      .then((response) => {
        setItems(response.data);
        setTotalPages(response.totalPages);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [page, pageSize, user]);

  async function handleDelete(id: number) {
    await deleteBooking(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function handlePay(booking: Booking) {
    try {
      const updated = await payBooking(booking.id);
      setItems((current) => current.map((item) => (item.id === booking.id ? updated : item)));
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  function getRequestStatusLabel(status?: Booking['bookingStatus']) {
    if (status === 'aceito') return 'Aprovado';
    if (status === 'recusado') return 'Negado';
    return 'Aguardando';
  }

  function getRequestStatusClass(status?: Booking['bookingStatus']) {
    if (status === 'aceito') return 'status-pill status-approved';
    if (status === 'recusado') return 'status-pill status-rejected';
    return 'status-pill status-pending';
  }

  return (
    <main className="marketing-shell">
      <PageHeader title="Meus agendamentos" description="Veja as aulas marcadas, o professor responsável e as datas já combinadas." actionLabel="Agendar aula" actionTo="/professores" />
      {error ? <Feedback message={error} /> : null}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Aula</th>
              <th>Professor</th>
              <th>Data</th>
              <th>Status da solicitação</th>
              <th>Status do pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.aula?.materia ?? '-'}</td>
                <td>{item.aula?.professor?.name ?? '-'}</td>
                <td>{new Date(item.data).toLocaleString('pt-BR')}</td>
                <td><span className={getRequestStatusClass(item.bookingStatus)}>{getRequestStatusLabel(item.bookingStatus)}</span></td>
                <td>{item.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}</td>
                <td className="actions">
                  <Link to={`/agendamentos/${item.id}`}>Detalhes</Link>
                  <button
                    onClick={() => handlePay(item)}
                    disabled={item.paymentStatus === 'pago' || item.bookingStatus !== 'aceito'}
                  >
                    {item.paymentStatus === 'pago'
                      ? 'Pago'
                      : item.bookingStatus === 'aceito'
                        ? 'Pagar'
                        : item.bookingStatus === 'recusado'
                          ? 'Recusado'
                          : 'Aguardando aceite'}
                  </button>
                  <button onClick={() => void handleDelete(item.id)}>Cancelar</button>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td colSpan={6}>Você ainda não possui agendamentos.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default BookingsPage;
