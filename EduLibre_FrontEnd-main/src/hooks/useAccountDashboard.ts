import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { becomeProfessor } from '../services/auth';
import { fetchBookings } from '../services/bookings';
import { deleteLesson, fetchLessons } from '../services/lessons';
import { Booking, Lesson } from '../types';
import { getErrorMessage } from '../utils/validation';

export default function useAccountDashboard() {
  const { user, refreshUser } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');

  const isProfessor = user?.isSuperAdmin || user?.roles?.includes('professor');

  async function handleBecomeProfessor() {
    try {
      await becomeProfessor();
      await refreshUser();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }
  useEffect(() => {
    if (!user) return;
    let active = true;

    fetchLessons({ page: 1, pageSize: 20, professorId: user.id })
      .then((response) => {
        if (active) setLessons(response.data);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      });

    fetchBookings({ page: 1, pageSize: 20, alunoId: user.id })
      .then((response) => {
        if (active) setBookings(response.data);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleDeleteLesson(lessonId: number) {
    if (!window.confirm('Tem certeza que deseja excluir esta aula?')) return;

    try {
      await deleteLesson(lessonId);
      setLessons((current) =>
        current.filter((lesson) => lesson.id !== lessonId),
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  const soldBookings = lessons.reduce(
    (total, lesson) => total + (lesson.bookingCount ?? 0),
    0,
  );
  const paidBookings = lessons.reduce(
    (total, lesson) => total + (lesson.paidBookingCount ?? 0),
    0,
  );

  return {
    user,
    lessons,
    bookings,
    error,
    isProfessor,
    soldBookings,
    paidBookings,
    handleBecomeProfessor,
    handleDeleteLesson,
  };
}
