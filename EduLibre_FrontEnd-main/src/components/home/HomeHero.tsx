import { Link } from 'react-router-dom';
import professorAluna from '../../assets/AlunaProfessor.png';

export default function HomeHero() {
  return (
    <section className="hero">
      <div className="hero_container">
        <div className="hero_left">
          <div className="hero_eyebrow">Aprender hoje. Construir amanhã.</div>

          <h1>
            Aprenda com quem
            <br />
            <span>entende você.</span>
          </h1>

          <p>
            Encontre professores qualificados e descubra novas possibilidades.
            Na EduLivre, você aprende no seu ritmo e segue em direção aos seus
            objetivos.
          </p>

          <div className="hero_actions">
            <Link to="/professores" className="hero_cta">
              Explorar aulas
              <span aria-hidden="true">→</span>
            </Link>

            <a href="#beneficios" className="hero_secondary">
              Conheça a EduLivre
            </a>
          </div>

          <div className="hero_highlights">
            <span>Professores verificados</span>
            <span>Aprendizado no seu ritmo</span>
            <span>Avaliações reais</span>
          </div>
        </div>

        <div className="hero_visual">
          <img
            src={professorAluna}
            alt="Professor auxiliando aluna durante o estudo"
          />
        </div>
      </div>
    </section>
  );
}
