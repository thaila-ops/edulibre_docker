import { useEffect, useState } from 'react';
import {
  blockLesson,
  fetchAdminDashboard,
  fetchAdminLessons,
  unblockLesson,
} from '../services/admin';
import { AdminDashboardStats, Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

export default function useAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const [dashboard, lessonsResponse] = await Promise.all([
          fetchAdminDashboard(),
          fetchAdminLessons(),
        ]);

        if (active) {
          setStats(dashboard);
          setLessons(lessonsResponse.data);
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  async function handleBlock(lesson: Lesson) {
    const motivo = window.prompt(
      `Informe o motivo para bloquear a aula "${lesson.materia}":`,
    );

    if (motivo === null) return;

    if (!motivo.trim()) {
      setError('Informe um motivo para bloquear a aula.');
      return;
    }

    await updateModeration(lesson.id, () => blockLesson(lesson.id, motivo));
  }

  async function handleUnblock(lesson: Lesson) {
    await updateModeration(lesson.id, () => unblockLesson(lesson.id));
  }

  async function updateModeration(id: number, update: () => Promise<Lesson>) {
    try {
      setError('');
      setActionLoadingId(id);

      const updatedLesson = await update();

      setLessons((current) =>
        current.map((item) =>
          item.id === updatedLesson.id ? updatedLesson : item,
        ),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoadingId(null);
    }
  }

  return {
    stats,
    lessons,
    error,
    loading,
    actionLoadingId,
    handleBlock,
    handleUnblock,
  };
}
