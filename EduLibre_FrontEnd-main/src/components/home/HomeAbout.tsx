import { Link } from 'react-router-dom';

export default function HomeAbout() {
  return (
    <section className="about">
      <div className="about_container">
        <div className="about_image" aria-hidden="true" />

        <div className="about_text">
          <span className="about_eyebrow">Conheça a EduLivre</span>

          <h2>
            Seu próximo passo
            <br />
            <span>começa aqui.</span>
          </h2>

          <p>
            Conectamos alunos e professores para transformar curiosidade em
            conhecimento. Encontre profissionais qualificados e descubra aulas
            que combinam com seus objetivos.
          </p>

          <p>
            Um ambiente acolhedor para aprender com autonomia, explorar novas
            possibilidades e evoluir no seu ritmo.
          </p>

          <Link to="/professores" className="about_cta">
            Conheça os professores
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
