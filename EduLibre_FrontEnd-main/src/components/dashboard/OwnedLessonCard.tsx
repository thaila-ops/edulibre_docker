import { Link } from 'react-router-dom';
import { Lesson } from '../../types';
import LessonImage from '../lessons/LessonImage';

export default function OwnedLessonCard({
  lesson,
  onDelete,
}: {
  lesson: Lesson;
  onDelete: (id: number) => Promise<void>;
}) {
  return (
    <div className="teacher_card">
      <LessonImage src={lesson.imageUrl} alt={lesson.materia} />
      <h4>{lesson.materia}</h4>
      <span>
        {lesson.bookingCount ?? 0} agendamentos · {lesson.paidBookingCount ?? 0}{' '}
        pagos
      </span>
      <div className="conta-aula-acoes">
        <Link className="conta-acao" to={`/minhas-aulas/${lesson.id}/editar`}>
          Editar aula
        </Link>

        <Link className="conta-acao" to={`/minhas-aulas/${lesson.id}/alunos`}>
          Ver alunos
        </Link>

        <button
          className="conta-acao conta-acao--excluir"
          type="button"
          onClick={() => void onDelete(lesson.id)}
        >
          Excluir aula
        </button>
      </div>
    </div>
  );
}
