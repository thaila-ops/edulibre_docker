import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Feedback from '../components/Feedback';
import FormField from '../components/FormField';
import { confirmPasswordReset, requestPasswordReset } from '../services/auth';
import {
  getErrorMessage,
  validateEmail,
  validatePassword,
} from '../utils/validation';

function PasswordResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requested, setRequested] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateEmail(email)) return setError('Informe um e-mail válido.');

    try {
      setLoading(true);
      setError('');
      const response = await requestPasswordReset(email.trim());
      setMessage(response.message);
      setRequested(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      return setError('Informe o código de seis dígitos.');
    }
    if (!validatePassword(password)) {
      return setError(
        'Use uma senha com pelo menos 8 caracteres, letra, número e símbolo.',
      );
    }
    if (password !== confirmPassword) {
      return setError('A confirmação de senha não confere.');
    }

    try {
      setLoading(true);
      setError('');
      const response = await confirmPasswordReset({
        email: email.trim(),
        code,
        password,
      });
      setMessage(response.message);
      window.setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="center-shell">
      <form
        className="auth-card password-reset-card"
        onSubmit={requested ? handleConfirm : handleRequest}
      >
        <p className="eyebrow">Recuperar acesso</p>
        <h1>{requested ? 'Crie uma nova senha' : 'Esqueceu sua senha?'}</h1>
        <p className="muted">
          {requested
            ? 'Digite o código enviado ao seu e-mail. Ele expira em 15 minutos.'
            : 'Informe seu e-mail e enviaremos um código de seis dígitos.'}
        </p>
        {!requested ? (
          <FormField
            label="E-mail"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
          />
        ) : null}
        {requested ? (
          <>
            <FormField
              label="Código"
              name="code"
              value={code}
              onChange={(value) =>
                setCode(value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="000000"
            />
            <FormField
              label="Nova senha"
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
            />
            <FormField
              label="Confirmar nova senha"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </>
        ) : null}
        {message ? <Feedback message={message} variant="success" /> : null}
        {error ? <Feedback message={error} /> : null}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Aguarde...' : requested ? 'Redefinir senha' : 'Enviar código'}
        </button>
        {requested ? (
          <button
            className="secondary-button"
            type="button"
            disabled={loading}
            onClick={() => {
              setRequested(false);
              setCode('');
              setError('');
              setMessage('');
            }}
          >
            Usar outro e-mail
          </button>
        ) : null}
        <p className="muted"><Link to="/login">Voltar para entrar</Link></p>
      </form>
    </main>
  );
}

export default PasswordResetPage;
