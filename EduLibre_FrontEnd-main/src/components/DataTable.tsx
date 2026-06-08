import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Column<T> = {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
};

type Props<T extends { id: number }> = {
  columns: Column<T>[];
  items: T[];
  editBasePath: string;
  onDelete: (id: number) => void;
};

function DataTable<T extends { id: number }>({ columns, items, editBasePath, onDelete }: Props<T>) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {columns.map((column) => <td key={`${item.id}-${column.key}`}>{column.render(item)}</td>)}
              <td className="actions">
                <Link to={`${editBasePath}/${item.id}/editar`}>Editar</Link>
                <button onClick={() => onDelete(item.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
