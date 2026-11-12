import { Link } from 'react-router-dom';

export default function HomeCallToAction() {
  return (
    <section className="cta">
      <h2>Comece a aprender hoje mesmo</h2>
      <Link to="/professores" className="cta_button">
        Encontrar professor
      </Link>
    </section>
  );
}
