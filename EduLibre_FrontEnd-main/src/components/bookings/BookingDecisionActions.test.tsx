import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingDecisionActions from './BookingDecisionActions';
import { Booking } from '../../types';

const booking: Booking = {
  id: 4,
  alunoId: 1,
  aulaId: 2,
  data: '2026-12-01',
  bookingStatus: 'pendente',
  paymentStatus: 'pendente',
};

test('submits the chosen decision and prevents duplicate clicks while saving', async () => {
  let finish!: () => void;
  const onDecision = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(
    <MemoryRouter>
      <BookingDecisionActions booking={booking} onDecision={onDecision} />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'recusar' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  expect(onDecision).toHaveBeenCalledWith(booking, 'recusar');
  expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
  finish();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled(),
  );
});

test('does not allow rejection of a paid booking', () => {
  render(
    <MemoryRouter>
      <BookingDecisionActions
        booking={{ ...booking, paymentStatus: 'pago', bookingStatus: 'aceito' }}
        onDecision={jest.fn()}
      />
    </MemoryRouter>,
  );
  expect(screen.getByRole('option', { name: 'Recusar' })).toBeDisabled();
});
