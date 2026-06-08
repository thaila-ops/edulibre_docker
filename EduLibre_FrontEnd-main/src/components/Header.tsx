import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import './Headers.css';

function Header() {
  const { token, logout } = useAuth();

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
          <Link to="/agendamentos">Agendamentos</Link>
          {token ? <Link to="/agendamentos-recebidos">Agendamentos recebidos</Link> : null}

          {token ? (
            <Link to="/conta">Minha conta</Link>
          ) : (
            <Link to="/login">Login</Link>
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