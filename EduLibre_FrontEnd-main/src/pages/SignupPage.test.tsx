import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from './SignupPage';

const mockNavigate = jest.fn();
const mockCreateUser = jest.fn();

jest.mock('../services/http', () => ({
  createUser: (...args: unknown[]) => mockCreateUser(...args),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

test('requires birth date on signup', async () => {
  render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'ana@teste.com' } });
  fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '12345678901' } });
  fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { value: 'Senha@123' } });
  fireEvent.change(screen.getByLabelText(/Confirmar senha/i), { target: { value: 'Senha@123' } });
  fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

  expect(await screen.findByText(/Informe uma data de nascimento válida/i)).toBeInTheDocument();
  expect(mockCreateUser).not.toHaveBeenCalled();
});
