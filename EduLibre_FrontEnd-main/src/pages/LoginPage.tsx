import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Feedback from '../components/Feedback';
import FormField from '../components/FormField';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage, validateEmail, validatePassword } from '../utils/validation';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateEmail(email)) return setError('Informe um e-mail válido.');
    if (!validatePassword(password)) return setError('A senha deve seguir a política de segurança.');
    try {
      await login(email, password);
      navigate('/conta');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <main className="center-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Entrar</p>
        <h1>Entre para agendar ou vender aulas</h1>
        <FormField label="E-mail" name="email" type="email" value={email} onChange={setEmail} />
        <FormField label="Senha" name="password" type="password" value={password} onChange={setPassword} />
        {error ? <Feedback message={error} /> : null}
        <button className="primary-button" type="submit">Entrar</button>
        <p className="muted">Ainda não tem conta? <Link to="/cadastro">Crie a sua gratuitamente</Link>.</p>
      </form>
    </main>
  );
}

export default LoginPage;
