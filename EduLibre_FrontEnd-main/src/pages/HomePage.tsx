import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedLessons } from '../services/http';
import { Lesson } from '../types';
import './home.css';

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
      <h1>
        Aprenda com quem <br />
        <span>entende você</span>
      </h1>

      <p>
        Encontre professores qualificados, veja aulas em destaque e evolua no seu ritmo com uma experiência simples e elegante.
      </p>

      <div className="search_box">
        <Link to="/professores">
          <input readOnly value="O que você quer aprender?" />
        </Link>
        <Link to="/professores">
          <button>Buscar</button>
        </Link>
      </div>
    </div>

  

  </div>
</section>

      <section className="benefits">
        <div className="benefit_card">
          <h3>Professores verificados</h3>
          <p>Perfis reais com imagem, biografia e aulas publicadas na plataforma.</p>
        </div>
        <div className="benefit_card">
          <h3>Agendamento fácil</h3>
          <p>Marque suas aulas em poucos segundos e acompanhe o status do pagamento.</p>
        </div>
        <div className="benefit_card">
          <h3>Avaliações reais</h3>
          <p>Veja a nota média de cada aula antes de decidir com quem estudar.</p>
        </div>
      </section>
      <section className="about">
  <div className="about_container">

    <div className="about_image"></div>

    <div className="about_text">
      <h2>Sobre a plataforma</h2>

      <p>
        Nossa plataforma conecta alunos e professores de forma simples, elegante e eficiente. 
        Aqui você encontra profissionais qualificados, agenda aulas com facilidade e acompanha toda sua evolução.
      </p>

      <p>
        Criamos um ambiente acolhedor, pensado para quem valoriza aprendizado com qualidade e autonomia.
      </p>

      <Link to="/professores">
        <button>Conheça os professores</button>
      </Link>
    </div>

  </div>
</section>

      <section className="teachers">
        <h2>Professores em destaque</h2>

        <div className="teachers_grid">
          {featuredLessons.map((lesson) => (
            <div className="teacher_card" key={lesson.id}>
              {lesson.professor?.avatarUrl ? (
                <img className="teacher_img teacher_photo" src={lesson.professor.avatarUrl} alt={lesson.professor.name} />
              ) : (
                <div className="teacher_img"></div>
              )}
              <h4>{lesson.professor?.name ?? 'Professor'}</h4>
              <span>{lesson.materia}</span>
              <p className="muted">Nota {lesson.averageRating ?? 0} · {lesson.reviewCount ?? 0} avaliações</p>
              <Link to={`/aula/${lesson.id}`}><button>Agendar aula</button></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="teachers">
        <h2>Aulas em destaque</h2>
        <div className="teachers_grid">
          {featuredLessons.map((lesson) => (
            <div className="teacher_card" key={`lesson-${lesson.id}`}>
              {lesson.imageUrl ? <img className="teacher_img teacher_photo" src={lesson.imageUrl} alt={lesson.materia} /> : <div className="teacher_img"></div>}
              <h4>{lesson.materia}</h4>
              <span>R$ {lesson.valor}</span>
              <p className="muted">{lesson.professor?.name}</p>
              <Link to={`/aula/${lesson.id}`}><button>Ver detalhes</button></Link>
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
        <Link to="/professores"><button>Encontrar professor</button></Link>
      </section>
    </main>
  );
}

export default HomePage;
