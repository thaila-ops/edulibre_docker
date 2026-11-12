import { Link } from 'react-router-dom';
import { Lesson } from '../../types';
import LessonImage from '../lessons/LessonImage';
import LessonRating from '../lessons/LessonRating';

type Props = { lessons: Lesson[]; variant: 'teachers' | 'lessons' };

export default function FeaturedLessons({ lessons, variant }: Props) {
  const showTeachers = variant === 'teachers';

  return (
    <section className="teachers">
      <h2>{showTeachers ? 'Professores em destaque' : 'Aulas em destaque'}</h2>
      <div className="teachers_grid">
        {lessons.map((lesson) => (
          <div className="featured_card" key={lesson.id}>
            <LessonImage
              src={showTeachers ? lesson.professor?.avatarUrl : lesson.imageUrl}
              alt={
                showTeachers
                  ? (lesson.professor?.name ?? 'Professor')
                  : lesson.materia
              }
            />
            <h4>
              {showTeachers
                ? (lesson.professor?.name ?? 'Professor')
                : lesson.materia}
            </h4>
            <span>{showTeachers ? lesson.materia : `R$ ${lesson.valor}`}</span>
            {showTeachers ? (
              <LessonRating lesson={lesson} />
            ) : (
              <p className="muted">{lesson.professor?.name}</p>
            )}
            <Link to={`/aula/${lesson.id}`} className="teacher_button">
              {showTeachers ? 'Agendar aula' : 'Ver detalhes'}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
