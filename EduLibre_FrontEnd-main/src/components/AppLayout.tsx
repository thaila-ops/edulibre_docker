import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">EduLivre</p>
          <h1>Minha conta</h1>
          <p className="muted">{user?.name} · usuário</p>
        </div>
        <nav className="nav-stack">
          <NavLink to="/conta">Resumo</NavLink>
          <NavLink to="/professores">Explorar aulas</NavLink>
          <NavLink to="/perfil">Meu perfil</NavLink>
          <NavLink to="/agendamentos">Meus agendamentos</NavLink>
        </nav>
        <button className="secondary-button" onClick={logout}>Sair</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
