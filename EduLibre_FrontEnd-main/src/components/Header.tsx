import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import './Headers.css';

function Header() {
  const { token, user, logout } = useAuth();

  const isProfessor =
    user?.isSuperAdmin ||
    user?.roles?.includes('professor');

  const isAdmin =
    user?.isSuperAdmin ||
    user?.roles?.includes('admin');

  useEffect(() => {
    const header = document.querySelector('.header');

    const onScroll = () => {
      if (window.scrollY > 50) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="header">
      <div className="header_container">
        <Link to="/" className="logo-link">
          <img src={logo} alt="EduLivre" className="logo_img" />
          <strong>EduLivre</strong>
        </Link>

        <nav className="menu_header">
          <Link to="/">Home</Link>
          <Link to="/professores">Professores</Link>

          {token && <Link to="/agendamentos">Agendamentos</Link>}

          {token && isProfessor && (
            <>
              <Link to="/minhas-aulas">Minhas aulas</Link>
              <Link to="/criar-aula">Criar aula</Link>
              <Link to="/agendamentos-recebidos">
                Agendamentos recebidos
              </Link>
            </>
          )}

                  {token && isAdmin && (
            <Link to="/admin">Painel admin</Link>
          )}

          {token && <NotificationBell />}

        {token ? (
  <Link className="header_account" to="/conta">
    Minha conta
  </Link>
) : (
  <Link className="header_login" to="/login">
    Entrar
  </Link>
)}
          {token && (
            <button className="header_logout" onClick={logout}>
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;