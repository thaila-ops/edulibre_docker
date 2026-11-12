import { Lesson } from '../../types';

type Props = {
  lesson: Lesson;
  isLoading: boolean;
  onBlock: (lesson: Lesson) => Promise<void>;
  onUnblock: (lesson: Lesson) => Promise<void>;
};

export default function LessonModerationCard({
  lesson,
  isLoading,
  onBlock,
  onUnblock,
}: Props) {
  const isBlocked = lesson.status === 'bloqueada';
  return (
    <article className="info-card">
      <h3>{lesson.materia}</h3>

      <p className="muted">
        Professor: {lesson.professor?.name ?? 'Não informado'}
      </p>

      <p>
        Status: <strong>{isBlocked ? 'Bloqueada' : 'Ativa'}</strong>
      </p>

      {isBlocked && lesson.motivoBloqueio ? (
        <p className="muted">Motivo: {lesson.motivoBloqueio}</p>
      ) : null}

      {isBlocked ? (
        <button
          className="secondary-button"
          type="button"
          disabled={isLoading}
          onClick={() => {
            void onUnblock(lesson);
          }}
        >
          {isLoading ? 'Desbloqueando...' : 'Desbloquear aula'}
        </button>
      ) : (
        <button
          className="primary-button"
          type="button"
          disabled={isLoading}
          onClick={() => {
            void onBlock(lesson);
          }}
        >
          {isLoading ? 'Bloqueando...' : 'Bloquear aula'}
        </button>
      )}
    </article>
  );
}
