import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedLessons } from '../services/http';
import { Lesson } from '../types';
import './home.css';
import professorAluna from '../assets/AlunaProfessor.png';

function HomePage() {
  const [featuredLessons, setFeaturedLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    fetchFeaturedLessons().then(setFeaturedLessons).catch(() => setFeaturedLessons([]));
  }, []);

  return (

    <main className="home">
  <section className="hero">
    <div className="hero_container">
      <div className="hero_left">
  <div className="hero_eyebrow">
    Aprender hoje. Construir amanhã.
  </div>

  <h1>
    Aprenda com quem
    <br />
    <span>entende você.</span>
  </h1>

  <p>
    Encontre professores qualificados e descubra novas possibilidades.
    Na EduLivre, você aprende no seu ritmo e segue em direção aos
    seus objetivos.
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


<section className="benefits">
  <div className="benefit_card benefit_card--tecnologia">
    <h3>Professores verificados</h3>
    <p>
      Perfis reais com imagem, biografia e aulas publicadas na plataforma.
    </p>
  </div>

  <div className="benefit_card benefit_card--idiomas">
    <h3>Agendamento fácil</h3>
    <p>
      Marque suas aulas em poucos segundos e acompanhe o status do pagamento.
    </p>
  </div>

  <div className="benefit_card benefit_card--humanidades">
    <h3>Avaliações reais</h3>
    <p>
      Veja a nota média de cada aula antes de decidir com quem estudar.
    </p>
  </div>
</section>
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
        Conectamos alunos e professores para transformar curiosidade
        em conhecimento. Encontre profissionais qualificados e
        descubra aulas que combinam com seus objetivos.
      </p>

      <p>
        Um ambiente acolhedor para aprender com autonomia, explorar
        novas possibilidades e evoluir no seu ritmo.
      </p>

      <Link to="/professores" className="about_cta">
        Conheça os professores
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  </div>
</section>
<div className="home_bottom">
      <section className="teachers">
        <h2>Professores em destaque</h2>

        <div className="teachers_grid">
          {featuredLessons.map((lesson) => (
            <div className="featured_card" key={lesson.id}>
              {lesson.professor?.avatarUrl ? (
                <img className="teacher_img teacher_photo" src={lesson.professor.avatarUrl} alt={lesson.professor.name} />
              ) : (
                <div className="teacher_img"></div>
              )}
              <h4>{lesson.professor?.name ?? 'Professor'}</h4>
              <span>{lesson.materia}</span>
              <p className="muted">Nota {lesson.averageRating ?? 0} · {lesson.reviewCount ?? 0} avaliações</p>
            <Link to={`/aula/${lesson.id}`} className="teacher_button">
  Agendar aula
</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="teachers">
        <h2>Aulas em destaque</h2>
        <div className="teachers_grid">
          {featuredLessons.map((lesson) => (
            <div className="featured_card" key={`lesson-${lesson.id}`}>
              {lesson.imageUrl ? <img className="teacher_img teacher_photo" src={lesson.imageUrl} alt={lesson.materia} /> : <div className="teacher_img"></div>}
              <h4>{lesson.materia}</h4>
              <span>R$ {lesson.valor}</span>
              <p className="muted">{lesson.professor?.name}</p>
              <Link to={`/aula/${lesson.id}`} className="teacher_button">
  Ver detalhes
</Link>
               </div>
          ))}
        </div>
      </section>

      <section className="steps">
        <h2>Como funciona</h2>

        <div className="steps_grid">
          <div className="step">
            <h3>1</h3>
            <p>Escolha a aula ideal no marketplace.</p>
          </div>
          <div className="step">
            <h3>2</h3>
            <p>Agende a data e faça o pagamento de teste.</p>
          </div>
          <div className="step">
            <h3>3</h3>
            <p>Avalie a aula depois da experiência.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Comece a aprender hoje mesmo</h2>
        <Link to="/professores" className="cta_button">
  Encontrar professor
</Link>
          </section>
          </div>
    </main>
  );
}

export default HomePage;
