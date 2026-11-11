import Aula from '../models/Aula';
import User from '../models/User';
import Avaliacao from '../models/Avaliacao';
import Agendamento from '../models/Agendamento';

export function serializeAula(aula: Aula) {
  const plain = aula.toJSON() as Aula & {
    professor?: User;
    avaliacoes?: Avaliacao[];
    agendamentos?: Agendamento[];
  };
  const reviews = plain.avaliacoes ?? [];
  const bookings = plain.agendamentos ?? [];
  const paidBookings = bookings.filter((item) => item.paymentStatus === 'pago');
  const average = reviews.length
    ? reviews.reduce((total, item) => total + item.nota, 0) / reviews.length
    : 0;

  return {
    id: plain.id,
    materia: plain.materia,
    valor: plain.valor,
    descricao: plain.descricao,
    imageUrl: plain.imageUrl,
    status: plain.status,
    motivoBloqueio: plain.motivoBloqueio,
    professorId: plain.professorId,
    professor: plain.professor,
    reviewCount: reviews.length,
    averageRating: Number(average.toFixed(1)),
    bookingCount: bookings.length,
    paidBookingCount: paidBookings.length,
    avaliacoes: reviews,
  };
}
