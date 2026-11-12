import { useEffect, useState } from 'react';
import { PaginatedResponse } from '../types';
import { getErrorMessage } from '../utils/validation';

// Pass a loader stabilized with useCallback so renders do not repeat requests.
export default function usePaginatedResource<T>(
  load: () => Promise<PaginatedResponse<T>>,
  enabled = true,
) {
  const [items, setItems] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setItems([]);
      setTotalPages(1);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    async function fetchPage() {
      try {
        const response = await load();
        if (active) {
          setItems(response.data);
          setTotalPages(response.totalPages);
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchPage();
    return () => {
      active = false;
    };
  }, [load, enabled]);

  return { items, setItems, totalPages, error, setError, loading };
}
