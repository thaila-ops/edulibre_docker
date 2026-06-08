import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

jest.mock('../services/http', () => ({
  fetchFeaturedLessons: () => Promise.resolve([]),
}));

test('renders home call to action', async () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/Aprenda com quem/i)).toBeInTheDocument();
});
