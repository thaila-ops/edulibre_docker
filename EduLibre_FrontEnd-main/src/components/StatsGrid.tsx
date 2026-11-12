import { ReactNode } from 'react';

type Stat = { label: string; value: ReactNode };

export default function StatsGrid({ items }: { items: Stat[] }) {
  return (
    <section className="grid-3">
      {items.map(({ label, value }) => (
        <article className="info-card" key={label}>
          <h3>{label}</h3>
          <p>{value}</p>
        </article>
      ))}
    </section>
  );
}
