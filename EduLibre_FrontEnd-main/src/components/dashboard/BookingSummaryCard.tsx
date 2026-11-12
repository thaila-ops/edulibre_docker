import { Link } from 'react-router-dom';
import { Booking } from '../../types';

export default function BookingSummaryCard({ booking }: { booking: Booking }) {
  return (
    <div className="teacher_card">
      <h4>{booking.aula?.materia}</h4>
      <span>{booking.aula?.professor?.name}</span>
      <p className="muted">{new Date(booking.data).toLocaleString('pt-BR')}</p>
      <Link to={`/agendamentos/${booking.id}`}>
        <button>Ver agendamento</button>
      </Link>
    </div>
  );
}
