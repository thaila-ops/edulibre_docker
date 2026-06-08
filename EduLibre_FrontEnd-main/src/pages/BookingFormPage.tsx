import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Feedback from '../components/Feedback';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { createBooking, fetchBooking, fetchLessons, updateBooking } from '../services/http';
import { Booking, Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

function BookingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = window.location.pathname.includes('/editar');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState({ alunoId: user ? String(user.id) : '0', aulaId: isEditing ? '0' : id ?? '0', data: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLessons({ page: 1, pageSize: 50 }).then((response) => setLessons(response.data));
    if (user) {
      setForm((current) => ({ ...current, alunoId: String(user.id) }));
    }
  }, [user]);

  useEffect(() => {
    if (!isEditing || !id) return;

    fetchBooking(id)
      .then((currentBooking) => {
        setBooking(currentBooking);
        setForm({
          alunoId: String(currentBooking.alunoId),
          aulaId: String(currentBooking.aulaId),
          data: currentBooking.data.slice(0, 16),
        });
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [id, isEditing]);

  function setField(field: string, value: string) {
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const payload = {
        alunoId: Number(form.alunoId),
        aulaId: Number(form.aulaId),
        data: new Date(form.data).toISOString(),
      };

      if (isEditing && id) {
        await updateBooking(id, payload);
      } else {
        await createBooking(payload);
      }

      navigate('/agendamentos');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <main className="marketing-shell">
      <PageHeader
        title={isEditing ? 'Editar agendamento' : 'Agendar aula'}
        description={isEditing ? 'Atualize a aula e a data do seu agendamento.' : 'Escolha a aula e defina a data do seu agendamento.'}
      />
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Aluno</span>
            <input value={user?.name ?? ''} disabled />
          </label>
          <label className="field">
            <span>Aula</span>
            <select value={form.aulaId} onChange={(event) => setField('aulaId', event.target.value)}>
              <option value="0">Selecione</option>
              {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.materia}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Data e hora</span>
            <input type="datetime-local" value={form.data} onChange={(event) => setField('data', event.target.value)} />
          </label>
        </div>
        {isEditing && booking && booking.alunoId !== user?.id ? <Feedback message="Você só pode editar os seus próprios agendamentos." /> : null}
        {error ? <Feedback message={error} /> : null}
        <button className="primary-button" type="submit" disabled={isEditing && booking?.alunoId !== user?.id}>
          {isEditing ? 'Salvar alterações' : 'Confirmar agendamento'}
        </button>
      </form>
    </main>
  );
}

export default BookingFormPage;
