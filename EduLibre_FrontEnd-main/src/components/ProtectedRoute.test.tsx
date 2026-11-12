import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const mockSession = {
  token: 'token' as string | null,
  loading: false,
  user: { roles: ['professor'], isSuperAdmin: false },
};
jest.mock('../contexts/AuthContext', () => ({ useAuth: () => mockSession }));

beforeEach(() => {
  mockSession.token = 'token';
  mockSession.loading = false;
  mockSession.user = { roles: ['professor'], isSuperAdmin: false };
});

function renderProtectedPage() {
  return render(
    <MemoryRouter
      initialEntries={['/restrito']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route element={<ProtectedRoute requiredRole="professor" />}>
          <Route path="/restrito" element={<p>Área do professor</p>} />
        </Route>
        <Route path="/login" element={<p>Entrar na conta</p>} />
        <Route path="/conta" element={<p>Minha conta</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

test('renders nested content for the required role', () => {
  renderProtectedPage();
  expect(screen.getByText('Área do professor')).toBeInTheDocument();
});

test('redirects unauthenticated visitors to login', () => {
  mockSession.token = null;
  renderProtectedPage();
  expect(screen.getByText('Entrar na conta')).toBeInTheDocument();
});

test('redirects users without the required role to their account', () => {
  mockSession.user.roles = ['aluno'];
  renderProtectedPage();
  expect(screen.getByText('Minha conta')).toBeInTheDocument();
});

test('allows a super administrator without an explicit professor role', () => {
  mockSession.user = { roles: [], isSuperAdmin: true };
  renderProtectedPage();
  expect(screen.getByText('Área do professor')).toBeInTheDocument();
});

test('waits for session loading before rendering protected content', () => {
  mockSession.loading = true;
  renderProtectedPage();
  expect(screen.getByText('Carregando sessão...')).toBeInTheDocument();
  expect(screen.queryByText('Área do professor')).not.toBeInTheDocument();
});
