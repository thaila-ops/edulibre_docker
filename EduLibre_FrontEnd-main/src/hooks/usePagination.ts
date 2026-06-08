import { useState } from 'react';

export default function usePagination() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  return { page, pageSize, setPage };
}
