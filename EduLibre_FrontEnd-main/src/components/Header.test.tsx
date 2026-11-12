import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

jest.mock('../services/notifications', () => ({
  fetchNotifications: jest.fn().mockResolvedValue([]),
  markNotificationAsRead: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ token: null, user: null, logout: jest.fn() }),
}));

test('opens navigation, closes on Escape and restores focus', () => {
  render(<MemoryRouter><Header /></MemoryRouter>);
  const button = screen.getByRole('button', { name: 'Menu' });
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(screen.getByRole('navigation'), { key: 'Escape' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveFocus();
});

test('closes navigation after selecting a destination', () => {
  render(<MemoryRouter><Header /></MemoryRouter>);
  const button = screen.getByRole('button', { name: 'Menu' });
  fireEvent.click(button);
  fireEvent.click(screen.getByRole('link', { name: 'Professores' }));
  expect(button).toHaveAttribute('aria-expanded', 'false');
});
