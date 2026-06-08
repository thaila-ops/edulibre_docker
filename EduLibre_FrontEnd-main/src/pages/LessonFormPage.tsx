import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Feedback from '../components/Feedback';
import FormField from '../components/FormField';
import ImageUploadField from '../components/ImageUploadField';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { createLesson, fetchLesson, updateLesson } from '../services/http';
import { getErrorMessage } from '../utils/validation';

function LessonFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const [form, setForm] = useState({ materia: '', valor: '0', descricao: '', imageUrl: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchLesson(id)
      .then((lesson) => setForm({
        materia: lesson.materia,
        valor: String(lesson.valor),
        descricao: lesson.descricao ?? '',
        imageUrl: lesson.imageUrl ?? '',
      }))
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [id]);

  function setField(field: string, value: string) {
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    try {
      const payload = {
        materia: form.materia,
        valor: Number(form.valor),
        descricao: form.descricao,
        imageUrl: form.imageUrl,
        professorId: user.id,
      };
      if (isEditing && id) await updateLesson(id, payload);
      if (!isEditing) await createLesson(payload);
      navigate('/conta');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <main className="marketing-shell">
      <PageHeader title={isEditing ? 'Editar aula' : 'Nova aula'} description="Adicione imagem, descrição e preço para vender sua aula no marketplace." />
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <FormField label="Matéria" name="materia" value={form.materia} onChange={(value) => setField('materia', value)} />
          <FormField label="Valor" name="valor" type="number" value={form.valor} onChange={(value) => setField('valor', value)} />
          <ImageUploadField
            label="Imagem da aula"
            name="imageUrl"
            value={form.imageUrl}
            onChange={(value) => setField('imageUrl', value)}
            onError={setError}
          />
          <label className="field field-wide">
            <span>Descrição</span>
            <textarea value={form.descricao} onChange={(event) => setField('descricao', event.target.value)} />
          </label>
        </div>
        {error ? <Feedback message={error} /> : null}
        <button className="primary-button" type="submit">Salvar</button>
      </form>
    </main>
  );
}

export default LessonFormPage;
