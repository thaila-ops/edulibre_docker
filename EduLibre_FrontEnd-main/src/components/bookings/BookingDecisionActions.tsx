import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Booking } from '../../types';

export type BookingDecision = 'aceitar' | 'recusar';
type Props = {
  booking: Booking;
  onDecision: (booking: Booking, decision: BookingDecision) => Promise<void>;
};

export default function BookingDecisionActions({ booking, onDecision }: Props) {
  const [selection, setSelection] = useState<BookingDecision>();
  const [saving, setSaving] = useState(false);
  const decision =
    selection ?? (booking.bookingStatus === 'recusado' ? 'recusar' : 'aceitar');
  const isPaid = booking.paymentStatus === 'pago';

  async function save() {
    setSaving(true);
    try {
      await onDecision(booking, decision);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <select
        className="decision-select"
        aria-label={`Decisão do agendamento ${booking.id}`}
        value={decision}
        disabled={saving}
        onChange={(event) =>
          setSelection(event.target.value as BookingDecision)
        }
      >
        <option value="aceitar">Aceitar</option>
        <option value="recusar" disabled={isPaid}>
          Recusar
        </option>
      </select>
      <button
        onClick={() => void save()}
        disabled={saving || (isPaid && decision === 'recusar')}
      >
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
      <Link to={`/agendamentos/${booking.id}`}>Detalhes</Link>
    </>
  );
}
