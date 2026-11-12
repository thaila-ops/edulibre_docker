import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

const mockFetchFeaturedLessons = jest.fn();

jest.mock('../services/lessons', () => ({
  fetchFeaturedLessons: () => mockFetchFeaturedLessons(),
}));

beforeEach(() => mockFetchFeaturedLessons.mockResolvedValue([]));

test('renders home call to action', async () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/Aprenda com quem/i)).toBeInTheDocument();
});

test('renders teacher and lesson cards with their original detail links', async () => {
  mockFetchFeaturedLessons.mockResolvedValue([
    {
      id: 7,
      materia: 'Matemática',
      valor: 80,
      professorId: 2,
      professor: { name: 'Professora Ana', avatarUrl: '/avatar.png' },
      imageUrl: '/aula.png',
      averageRating: 4.5,
      reviewCount: 2,
    },
  ]);

  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole('heading', { name: 'Professora Ana' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Matemática' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Nota 4.5 · 2 avaliações')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Agendar aula' })).toHaveAttribute(
    'href',
    '/aula/7',
  );
  expect(screen.getByRole('link', { name: 'Ver detalhes' })).toHaveAttribute(
    'href',
    '/aula/7',
  );
});
