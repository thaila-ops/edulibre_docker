import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import BookingFormPage from './pages/BookingFormPage';
import BookingsPage from './pages/BookingsPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LessonDetailPage from './pages/LessonDetailPage';
import LessonsPage from './pages/LessonsPage';
import LoginPage from './pages/LoginPage';
import MarketplacePage from './pages/MarketplacePage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProfilePage from './pages/ProfilePage';
import SignupPage from './pages/SignupPage';
import UserFormPage from './pages/UserFormPage';
import LessonFormPage from './pages/LessonFormPage';
import LessonStudentsPage from './pages/LessonStudentsPage';
import ReceivedBookingsPage from './pages/ReceivedBookingsPage';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="/professores" element={<MarketplacePage />} />
        <Route path="/aula/:id" element={<LessonDetailPage />} />
        <Route
          path="/agendamentos"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agendamentos-recebidos"
          element={
            <ProtectedRoute>
              <ReceivedBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agendamentos/:id"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agendar-aula/:id"
          element={
            <ProtectedRoute>
              <BookingFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agendamentos/:id/editar"
          element={
            <ProtectedRoute>
              <BookingFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/criar-aula"
          element={
            <ProtectedRoute>
              <LessonFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/minhas-aulas/:id/editar"
          element={
            <ProtectedRoute>
              <LessonFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/minhas-aulas"
          element={
            <ProtectedRoute>
              <LessonsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/minhas-aulas/:id/alunos"
          element={
            <ProtectedRoute>
              <LessonStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conta"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil/editar"
          element={
            <ProtectedRoute>
              <UserFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
