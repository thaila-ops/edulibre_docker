import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchLessons } from '../services/http';
import { Lesson } from '../types';

function ProfilePage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchLessons({ page: 1, pageSize: 50, professorId: user.id }).then((response) => setLessons(response.data));
  }, [user]);

  if (!user) return null;

  const ratedLessons = lessons.filter((lesson) => lesson.reviewCount && lesson.reviewCount > 0);
  const averageReputation = ratedLessons.length
    ? ratedLessons.reduce((total, lesson) => total + (lesson.averageRating ?? 0), 0) / ratedLessons.length
    : 0;

  return (
    <main className="marketing-shell">
      <div className="form-card">
        {user.avatarUrl ? <img className="teacher_img teacher_photo" src={user.avatarUrl} alt={user.name} /> : <div className="teacher_img"></div>}
        <p className="eyebrow">Meu perfil</p>
        <h2>{user.name}</h2>
        <p className="muted">{user.bio ?? 'Adicione uma biografia para fortalecer seu perfil no marketplace.'}</p>
        <div className="form-grid">
          <div className="info-card">
            <h3>E-mail</h3>
            <p>{user.email}</p>
          </div>
          <div className="info-card">
            <h3>CPF</h3>
            <p>{user.cpf}</p>
          </div>
          <div className="info-card">
            <h3>Reputação</h3>
            <p>{ratedLessons.length ? `${averageReputation.toFixed(1)} / 5` : 'Sem reputação ainda'}</p>
          </div>
        </div>
        <div className="hero-actions" style={{ marginTop: 24 }}>
          <Link className="primary-button" to="/perfil/editar">Editar perfil</Link>
          <Link className="secondary-button" to="/conta">Minha conta</Link>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
