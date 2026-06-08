import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import usePagination from '../hooks/usePagination';
import { fetchBookings, fetchLesson } from '../services/http';
import { Booking, Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

function LessonStudentsPage() {
  const { id } = useParams();
  const { page, pageSize, setPage } = usePagination();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    fetchLesson(id)
      .then(setLesson)
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetchBookings({ page, pageSize, aulaId: Number(id) })
      .then((response) => {
        setBookings(response.data);
        setTotalPages(response.totalPages);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [id, page, pageSize]);

  const paidCount = useMemo(
    () => bookings.filter((booking) => booking.paymentStatus === 'pago').length,
    [bookings],
  );

  return (
    <main className="marketing-shell">
      <PageHeader
        title="Alunos da aula"
        description={lesson ? `Aula: ${lesson.materia}` : 'Veja quem agendou essa aula e o status de pagamento.'}
        actionLabel="Voltar para minhas aulas"
        actionTo="/minhas-aulas"
      />

      {error ? <Feedback message={error} /> : null}

      <section className="grid-3">
        <article className="info-card">
          <h3>Total de agendamentos</h3>
          <p>{bookings.length}</p>
        </article>
        <article className="info-card">
          <h3>Pagos</h3>
          <p>{paidCount}</p>
        </article>
        <article className="info-card">
          <h3>Pendentes</h3>
          <p>{Math.max(bookings.length - paidCount, 0)}</p>
        </article>
      </section>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>E-mail</th>
              <th>Data</th>
              <th>Status do pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.aluno?.name ?? '-'}</td>
                <td>{booking.aluno?.email ?? '-'}</td>
                <td>{new Date(booking.data).toLocaleString('pt-BR')}</td>
                <td>{booking.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}</td>
                <td className="actions">
                  <Link to={`/agendamentos/${booking.id}`}>Ver agendamento</Link>
                </td>
              </tr>
            ))}
            {!bookings.length ? (
              <tr>
                <td colSpan={5}>Ainda não há alunos agendados para essa aula.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default LessonStudentsPage;
