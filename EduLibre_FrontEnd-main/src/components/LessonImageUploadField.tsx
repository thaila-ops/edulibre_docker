import { ChangeEvent, useEffect, useId, useState } from 'react';
import {
  getAcceptedImageTypesAttribute,
  getAcceptedImageTypesLabel,
} from '../utils/imageUpload';

type Props = {
  label: string;
  name: string;
  value: File | null;
  currentImageUrl?: string | null;
  onChange: (file: File | null) => void;
  onError: (message: string) => void;
};

function LessonImageUploadField({
  label,
  name,
  value,
  currentImageUrl,
  onChange,
  onError,
}: Props) {
  const inputId = useId();
  const [selectedFileName, setSelectedFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl ?? null,
  );

  useEffect(() => {
    if (!value) {
      setPreviewUrl(currentImageUrl ?? null);
      return;
    }

    const localPreviewUrl = URL.createObjectURL(value);
    setPreviewUrl(localPreviewUrl);

    return () => URL.revokeObjectURL(localPreviewUrl);
  }, [value, currentImageUrl]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      onError(`O sistema aceita apenas imagens ${getAcceptedImageTypesLabel()}.`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('A imagem deve ter no máximo 5 MB.');
      return;
    }

    onError('');
    setSelectedFileName(file.name);
    onChange(file);

    event.target.value = '';
  }

  function removeImage() {
    setSelectedFileName('');
    onChange(null);
  }

  return (
    <label className="field field-wide">
      <span>{label}</span>

      <input
        id={inputId}
        aria-label={label}
        name={name}
        type="file"
        accept={getAcceptedImageTypesAttribute()}
        onChange={handleFile}
      />

      <p className="muted upload-help">
        Formatos aceitos: {getAcceptedImageTypesLabel()}. Tamanho máximo: 5 MB.
      </p>

      <p className="muted upload-help">
        Arquivo selecionado: {selectedFileName || 'Selecione uma imagem'}
      </p>

      <div className="image-upload-preview">
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="image-upload-thumb" />
        ) : (
          <div className="image-upload-empty">
            Nenhuma imagem selecionada.
          </div>
        )}
      </div>

      {(value || currentImageUrl) ? (
        <button
          className="secondary-button image-upload-clear"
          type="button"
          onClick={removeImage}
        >
          Remover imagem
        </button>
      ) : null}
    </label>
  );
}

export default LessonImageUploadField;