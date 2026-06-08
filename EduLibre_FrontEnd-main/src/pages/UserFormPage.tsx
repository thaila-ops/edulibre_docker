import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Feedback from '../components/Feedback';
import FormField from '../components/FormField';
import ImageUploadField from '../components/ImageUploadField';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { fetchMe, updateUser } from '../services/http';
import { getErrorMessage, isAdult, validateBirthDate, validateCpf, validatePassword } from '../utils/validation';

function UserFormPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    avatarUrl: '',
    bio: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMe().then((currentUser) => {
      setForm((current) => ({
        ...current,
        name: currentUser.name,
        email: currentUser.email,
        cpf: currentUser.cpf,
        dataNascimento: currentUser.dataNascimento ?? '',
        avatarUrl: currentUser.avatarUrl ?? '',
        bio: currentUser.bio ?? '',
      }));
    });
  }, []);

  function setField(field: string, value: string) {
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCpf(form.cpf)) return setError('Informe um CPF com 11 dígitos.');
    if (!validateBirthDate(form.dataNascimento)) return setError('Informe uma data de nascimento válida.');
    if (!isAdult(form.dataNascimento)) return setError('Você precisa ser maior de 18 anos para comprar ou vender aulas.');
    if (form.password && !validatePassword(form.password)) {
      return setError('Use uma senha com pelo menos 8 caracteres, letra, número e símbolo.');
    }
    if (form.password !== form.confirmPassword) return setError('A confirmação de senha não confere.');

    try {
      if (!user) return;
      await updateUser(String(user.id), {
        name: form.name,
        cpf: form.cpf,
        dataNascimento: form.dataNascimento,
        avatarUrl: form.avatarUrl,
        bio: form.bio,
        password: form.password || undefined,
      });
      await refreshUser();
      navigate('/perfil');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <main className="marketing-shell">
      <PageHeader title="Editar perfil" description="Atualize sua foto, bio, data de nascimento e senha quando quiser." />
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <FormField label="Nome" name="name" value={form.name} onChange={(value) => setField('name', value)} />
          <FormField label="E-mail" name="email" type="email" value={form.email} onChange={(value) => setField('email', value)} />
          <FormField label="CPF" name="cpf" value={form.cpf} onChange={(value) => setField('cpf', value)} />
          <FormField label="Data de nascimento" name="dataNascimento" type="date" value={form.dataNascimento} onChange={(value) => setField('dataNascimento', value)} />
          <FormField
            label="URL da foto (opcional)"
            name="avatarUrl"
            value={form.avatarUrl}
            onChange={(value) => setField('avatarUrl', value)}
            placeholder="https://exemplo.com/minha-foto.jpg"
          />
          <ImageUploadField
            label="Ou envie uma foto do computador"
            name="avatarUrl"
            value={form.avatarUrl}
            onChange={(value) => setField('avatarUrl', value)}
            onError={setError}
          />
          <label className="field field-wide">
            <span>Biografia</span>
            <textarea value={form.bio} onChange={(event) => setField('bio', event.target.value)} />
          </label>
          <FormField label="Senha" name="password" type="password" value={form.password} onChange={(value) => setField('password', value)} />
          <FormField label="Confirmar senha" name="confirmPassword" type="password" value={form.confirmPassword} onChange={(value) => setField('confirmPassword', value)} />
        </div>
        <p className="muted">O e-mail aparece apenas para consulta e não pode ser alterado. Se você usar URL e upload, o último valor informado será o salvo.</p>
        {error ? <Feedback message={error} /> : null}
        <button className="primary-button" type="submit">Salvar</button>
      </form>
    </main>
  );
}

export default UserFormPage;
