import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

test('shows regex validation message for invalid email', async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'email-invalido' } });
  fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'Senha@123' } });
  fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

  expect(await screen.findByText(/Informe um e-mail válido/i)).toBeInTheDocument();
});
