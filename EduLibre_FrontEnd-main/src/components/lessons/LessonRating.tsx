import { Lesson } from '../../types';

export default function LessonRating({ lesson }: { lesson: Lesson }) {
  return (
    <p className="muted">
      Nota {lesson.averageRating ?? 0} · {lesson.reviewCount ?? 0} avaliações
    </p>
  );
}
