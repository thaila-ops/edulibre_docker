import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Table from './Table';

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
  emptyMessage?: string;
};

function DataTable<T extends { id: number }>({
  columns,
  items,
  editBasePath,
  onDelete,
  emptyMessage,
}: Props<T>) {
  return (
    <Table
      headers={[...columns.map((column) => column.label), 'Ações']}
      isEmpty={items.length === 0}
      emptyMessage={emptyMessage}
    >
      {items.map((item) => (
        <tr key={item.id}>
          {columns.map((column) => (
            <td key={`${item.id}-${column.key}`}>{column.render(item)}</td>
          ))}
          <td className="actions">
            <Link to={`${editBasePath}/${item.id}/editar`}>Editar</Link>
            <button onClick={() => onDelete(item.id)}>Excluir</button>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default DataTable;
