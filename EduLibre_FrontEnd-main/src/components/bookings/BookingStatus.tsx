import { Booking } from '../../types';

const statuses = {
  aceito: { label: 'Aprovado', className: 'status-approved' },
  recusado: { label: 'Negado', className: 'status-rejected' },
  pendente: { label: 'Aguardando', className: 'status-pending' },
};

export default function BookingStatus({
  status,
}: {
  status?: Booking['bookingStatus'];
}) {
  const presentation = statuses[status ?? 'pendente'] ?? statuses.pendente;
  return (
    <span className={`status-pill ${presentation.className}`}>
      {presentation.label}
    </span>
  );
}
