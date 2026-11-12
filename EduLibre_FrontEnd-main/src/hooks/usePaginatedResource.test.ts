import { act, renderHook, waitFor } from '@testing-library/react';
import { PaginatedResponse } from '../types';
import usePaginatedResource from './usePaginatedResource';

type Item = { id: number };
const page = (id: number): PaginatedResponse<Item> => ({
  data: [{ id }],
  page: id,
  pageSize: 10,
  total: 20,
  totalPages: 2,
});

test('ignores an older request that finishes after the current page', async () => {
  let resolveFirst!: (value: PaginatedResponse<Item>) => void;
  const first = jest.fn(
    () =>
      new Promise<PaginatedResponse<Item>>((resolve) => {
        resolveFirst = resolve;
      }),
  );
  const second = jest.fn(() => Promise.resolve(page(2)));
  const { result, rerender } = renderHook(
    ({ load }) => usePaginatedResource(load),
    {
      initialProps: { load: first },
    },
  );

  rerender({ load: second });
  await waitFor(() => expect(result.current.items).toEqual([{ id: 2 }]));
  await act(async () => {
    resolveFirst(page(1));
  });
  expect(result.current.items).toEqual([{ id: 2 }]);
  expect(result.current.loading).toBe(false);
});

test('does not request protected data while disabled', () => {
  const load = jest.fn(() => Promise.resolve(page(1)));
  const { result } = renderHook(() => usePaginatedResource(load, false));
  expect(load).not.toHaveBeenCalled();
  expect(result.current.items).toEqual([]);
});

test('clears a request error after a successful retry', async () => {
  const failed = jest.fn((): Promise<PaginatedResponse<Item>> =>
    Promise.reject(new Error('Falha')),
  );
  const success = jest.fn(() => Promise.resolve(page(1)));
  const { result, rerender } = renderHook(
    ({ load }) => usePaginatedResource(load),
    {
      initialProps: { load: failed },
    },
  );
  await waitFor(() => expect(result.current.error).not.toBe(''));
  rerender({ load: success });
  await waitFor(() => expect(result.current.items).toEqual([{ id: 1 }]));
  expect(result.current.error).toBe('');
});
