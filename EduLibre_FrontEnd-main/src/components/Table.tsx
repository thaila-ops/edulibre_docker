import { ReactNode } from 'react';

type Props = {
  headers: string[];
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
};

export default function Table({
  headers,
  children,
  isEmpty,
  emptyMessage,
}: Props) {
  return (
    <div className="table-card" role="region" aria-label="Tabela de resultados, role horizontalmente para ver todas as colunas" tabIndex={0}>
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={headers.length}>{emptyMessage}</td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
