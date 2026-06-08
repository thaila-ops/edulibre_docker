import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import usePagination from '../hooks/usePagination';
import { useAuth } from '../contexts/AuthContext';
import { acceptBooking, fetchBookings, rejectBooking } from '../services/http';
import { Booking } from '../types';
import { getErrorMessage } from '../utils/validation';

function ReceivedBookingsPage() {
  const { user } = useAuth();
  const { page, pageSize, setPage } = usePagination();
  const [items, setItems] = useState<Booking[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [decisionById, setDecisionById] = useState<Record<number, 'aceitar' | 'recusar'>>({});

  useEffect(() => {
    if (!user) return;

    fetchBookings({ page, pageSize, professorId: user.id })
      .then((response) => {
        setItems(response.data);
        setTotalPages(response.totalPages);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [page, pageSize, user]);

  async function handleDecision(item: Booking, decision: 'aceitar' | 'recusar') {
    try {
      const updated = decision === 'aceitar' ? await acceptBooking(item.id) : await rejectBooking(item.id);
      setItems((current) => current.map((booking) => (booking.id === item.id ? updated : booking)));
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
      <PageHeader
        title="Agendamentos recebidos"
        description="Aprove ou recuse solicitações antes de o aluno pagar."
        actionLabel="Voltar para minha conta"
        actionTo="/conta"
      />
      {error ? <Feedback message={error} /> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Aula</th>
              <th>Aluno</th>
              <th>Data</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.aula?.materia ?? '-'}</td>
                <td>{item.aluno?.name ?? '-'}</td>
                <td>{new Date(item.data).toLocaleString('pt-BR')}</td>
                <td><span className={getRequestStatusClass(item.bookingStatus)}>{getRequestStatusLabel(item.bookingStatus)}</span></td>
                <td>{item.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}</td>
                <td className="actions">
                  <select
                    className="decision-select"
                    value={decisionById[item.id] ?? (item.bookingStatus === 'recusado' ? 'recusar' : 'aceitar')}
                    onChange={(event) => {
                      const value = event.target.value as 'aceitar' | 'recusar';
                      setDecisionById((current) => ({ ...current, [item.id]: value }));
                    }}
                  >
                    <option value="aceitar">Aceitar</option>
                    <option value="recusar" disabled={item.paymentStatus === 'pago'}>Recusar</option>
                  </select>
                  <button
                    onClick={() => {
                      const decision = decisionById[item.id] ?? (item.bookingStatus === 'recusado' ? 'recusar' : 'aceitar');
                      void handleDecision(item, decision);
                    }}
                    disabled={item.paymentStatus === 'pago' && (decisionById[item.id] ?? (item.bookingStatus === 'recusado' ? 'recusar' : 'aceitar')) === 'recusar'}
                  >
                    Salvar
                  </button>
                  <Link to={`/agendamentos/${item.id}`}>Detalhes</Link>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td colSpan={6}>Você ainda não recebeu agendamentos.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default ReceivedBookingsPage;
