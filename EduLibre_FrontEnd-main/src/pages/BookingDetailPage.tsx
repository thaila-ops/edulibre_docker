import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Feedback from '../components/Feedback';
import { payBooking, fetchBooking } from '../services/http';
import { Booking } from '../types';
import { getErrorMessage } from '../utils/validation';

function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchBooking(id).then(setBooking).catch((requestError) => setError(getErrorMessage(requestError)));
  }, [id]);

  async function handlePay() {
    if (!booking) return;
    try {
      const updated = await payBooking(booking.id);
      setBooking(updated);
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

  if (!booking) return <main className="marketing-shell"><div className="center-card">Carregando agendamento...</div></main>;

  return (
    <main className="marketing-shell">
      <section className="hero-card compact">
        <p className="eyebrow">Agendamento #{booking.id}</p>
        <h2>{booking.aula?.materia}</h2>
        <p className="muted">Professor: {booking.aula?.professor?.name}</p>
        <p className="muted">Aluno: {booking.aluno?.name}</p>
        <p className="muted">Data: {new Date(booking.data).toLocaleString('pt-BR')}</p>
        <p><strong>Status da solicitação:</strong> <span className={getRequestStatusClass(booking.bookingStatus)}>{getRequestStatusLabel(booking.bookingStatus)}</span></p>
        <p><strong>Status do pagamento:</strong> {booking.paymentStatus}</p>
        <div className="hero-actions">
          <button
            className="primary-button"
            onClick={handlePay}
            disabled={booking.paymentStatus === 'pago' || booking.bookingStatus !== 'aceito'}
          >
            {booking.paymentStatus === 'pago'
              ? 'Pago'
              : booking.bookingStatus === 'aceito'
                ? 'Pagamento de teste'
                : booking.bookingStatus === 'recusado'
                  ? 'Recusado pelo professor'
                  : 'Aguardando aceite do professor'}
          </button>
          <Link className="secondary-button" to="/agendamentos">Voltar</Link>
        </div>
      </section>
      {error ? <Feedback message={error} /> : null}
    </main>
  );
}

export default BookingDetailPage;
