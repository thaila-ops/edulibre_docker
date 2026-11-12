import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import BookingDetailPage from '../pages/BookingDetailPage';
import BookingFormPage from '../pages/BookingFormPage';
import BookingsPage from '../pages/BookingsPage';
import DashboardPage from '../pages/DashboardPage';
import HomePage from '../pages/HomePage';
import LessonDetailPage from '../pages/LessonDetailPage';
import LessonFormPage from '../pages/LessonFormPage';
import LessonStudentsPage from '../pages/LessonStudentsPage';
import LessonsPage from '../pages/LessonsPage';
import LoginPage from '../pages/LoginPage';
import MarketplacePage from '../pages/MarketplacePage';
import ProfilePage from '../pages/ProfilePage';
import ReceivedBookingsPage from '../pages/ReceivedBookingsPage';
import SignupPage from '../pages/SignupPage';
import UserFormPage from '../pages/UserFormPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/professores" element={<MarketplacePage />} />
      <Route path="/aula/:id" element={<LessonDetailPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/agendamentos" element={<BookingsPage />} />
        <Route path="/agendamentos/:id" element={<BookingDetailPage />} />
        <Route path="/agendar-aula/:id" element={<BookingFormPage />} />
        <Route path="/agendamentos/:id/editar" element={<BookingFormPage />} />
        <Route path="/conta" element={<DashboardPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/perfil/editar" element={<UserFormPage />} />
      </Route>
      <Route element={<ProtectedRoute requiredRole="professor" />}>
        <Route
          path="/agendamentos-recebidos"
          element={<ReceivedBookingsPage />}
        />
        <Route path="/criar-aula" element={<LessonFormPage />} />
        <Route path="/minhas-aulas/:id/editar" element={<LessonFormPage />} />
        <Route path="/minhas-aulas" element={<LessonsPage />} />
        <Route
          path="/minhas-aulas/:id/alunos"
          element={<LessonStudentsPage />}
        />
      </Route>
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
