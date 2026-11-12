import { Link } from 'react-router-dom';
import { Lesson } from '../../types';
import LessonImage from './LessonImage';
import LessonRating from './LessonRating';

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <article className="info-card">
      <LessonImage src={lesson.imageUrl} alt={lesson.materia} />
      <p className="eyebrow">{lesson.professor?.name ?? 'Professor'}</p>
      <h3>{lesson.materia}</h3>
      <p className="muted">
        {lesson.descricao ?? 'Aula individual anunciada no EduLivre.'}
      </p>
      <p>
        <strong>Valor:</strong> R$ {lesson.valor}
      </p>
      <LessonRating lesson={lesson} />
      <div className="hero-actions">
        <Link className="secondary-button" to={`/aula/${lesson.id}`}>
          Ver detalhes
        </Link>
        <Link className="primary-button" to={`/agendar-aula/${lesson.id}`}>
          Agendar aula
        </Link>
      </div>
    </article>
  );
}
