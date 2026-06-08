import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Feedback from '../components/Feedback';
import FormField from '../components/FormField';
import { createUser } from '../services/http';
import { getErrorMessage, isAdult, validateBirthDate, validateCpf, validateEmail, validatePassword } from '../utils/validation';

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  function setField(field: string, value: string) {
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      cpf: form.cpf.trim(),
      dataNascimento: form.dataNascimento.trim(),
      password: form.password.trim(),
      confirmPassword: form.confirmPassword.trim(),
    };

    if (!validateEmail(normalizedForm.email)) return setError('Informe um e-mail válido.');
    if (!validateCpf(normalizedForm.cpf)) return setError('Informe um CPF com 11 dígitos.');
    if (!validateBirthDate(normalizedForm.dataNascimento)) return setError('Informe uma data de nascimento válida.');
    if (!isAdult(normalizedForm.dataNascimento)) return setError('Você precisa ser maior de 18 anos para comprar ou vender aulas.');
    if (!validatePassword(normalizedForm.password)) return setError('Use uma senha com pelo menos 8 caracteres, letra, número e símbolo.');
    if (normalizedForm.password !== normalizedForm.confirmPassword) return setError('A confirmação de senha não confere.');

    try {
      await createUser({
        name: normalizedForm.name,
        email: normalizedForm.email,
        cpf: normalizedForm.cpf,
        dataNascimento: normalizedForm.dataNascimento,
        password: normalizedForm.password,
      });
      navigate('/login');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <main className="center-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Criar conta</p>
        <h1>Crie sua conta para agendar, vender ou fazer os dois</h1>
        <FormField label="Nome" name="name" value={form.name} onChange={(value) => setField('name', value)} />
        <FormField label="E-mail" name="email" type="email" value={form.email} onChange={(value) => setField('email', value)} />
        <FormField label="CPF" name="cpf" value={form.cpf} onChange={(value) => setField('cpf', value)} />
        <FormField label="Data de nascimento" name="dataNascimento" type="date" value={form.dataNascimento} onChange={(value) => setField('dataNascimento', value)} />
        <FormField label="Senha" name="password" type="password" value={form.password} onChange={(value) => setField('password', value)} />
        <FormField label="Confirmar senha" name="confirmPassword" type="password" value={form.confirmPassword} onChange={(value) => setField('confirmPassword', value)} />
        {error ? <Feedback message={error} /> : null}
        <button className="primary-button" type="submit">Criar conta</button>
      </form>
    </main>
  );
}

export default SignupPage;
