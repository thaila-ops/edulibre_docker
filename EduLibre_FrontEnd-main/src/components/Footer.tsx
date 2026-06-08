import { Link } from 'react-router-dom';
import './footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer_container">
        <div className="footer_brand">
          <h2>EduLivre</h2>
          <p>
            Conectando alunos e professores para transformar aprendizado em oportunidades reais.
          </p>
        </div>

        <div className="footer_links">
          <h4>Navegação</h4>
          <Link to="/">Home</Link>
          <Link to="/professores">Professores</Link>
          <Link to="/agendamentos">Agendamentos</Link>
          <Link to="/login">Login</Link>
        </div>

        <div className="footer_links">
          <h4>Conta</h4>
          <Link to="/cadastro">Criar conta</Link>
          <Link to="/conta">Minha conta</Link>
          <Link to="/criar-aula">Publicar aula</Link>
        </div>
      </div>

      <div className="footer_bottom">
        © 2026 EduLivre - Todos os direitos reservados
      </div>
    </footer>
  );
}

export default Footer;
