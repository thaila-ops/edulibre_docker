import { ChangeEvent, useEffect, useId, useState } from 'react';
import { getAcceptedImageTypesAttribute, getAcceptedImageTypesLabel, imageFileToDataUrl } from '../utils/imageUpload';

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
};

async function handleFile(
  event: ChangeEvent<HTMLInputElement>,
  onChange: (value: string) => void,
  onError: (message: string) => void,
  setSelectedFileName: (value: string) => void,
) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    onError('');
    onChange(await imageFileToDataUrl(file));
    setSelectedFileName(file.name);
  } catch (error) {
    setSelectedFileName('');
    onError(error instanceof Error ? error.message : 'Não foi possível carregar a imagem.');
  } finally {
    event.target.value = '';
  }
}

function ImageUploadField({ label, name, value, onChange, onError }: Props) {
  const inputId = useId();
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    if (!value) {
      setSelectedFileName('');
      return;
    }
    if (!selectedFileName) {
      setSelectedFileName('Imagem carregada');
    }
  }, [selectedFileName, value]);

  return (
    <label className="field field-wide">
      <span>{label}</span>
      <input
        id={inputId}
        aria-label={label}
        name={name}
        type="file"
        accept={getAcceptedImageTypesAttribute()}
        onChange={(event) => {
          void handleFile(event, onChange, onError, setSelectedFileName);
        }}
      />
      <p className="muted upload-help">
        Formatos aceitos: {getAcceptedImageTypesLabel()}. GIF não é suportado. Tamanho máximo: 2 MB.
      </p>
      <p className="muted upload-help">
        Arquivo selecionado: {selectedFileName || 'Selecione uma imagem'}
      </p>
      <div className="image-upload-preview">
        {value ? <img src={value} alt={label} className="image-upload-thumb" /> : <div className="image-upload-empty">Nenhuma imagem selecionada.</div>}
      </div>
      {value ? (
        <button
          className="secondary-button image-upload-clear"
          type="button"
          onClick={() => {
            setSelectedFileName('');
            onChange('');
          }}
        >
          Remover imagem
        </button>
      ) : null}
    </label>
  );
}

export default ImageUploadField;
