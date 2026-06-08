import { Link } from 'react-router-dom';

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
};

function PageHeader({ title, description, actionLabel, actionTo }: Props) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{title}</p>
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>
      {actionLabel && actionTo ? <Link className="primary-button" to={actionTo}>{actionLabel}</Link> : null}
    </div>
  );
}

export default PageHeader;
