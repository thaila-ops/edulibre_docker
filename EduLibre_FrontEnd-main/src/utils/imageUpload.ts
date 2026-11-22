const MAX_IMAGE_SIZE = 5* 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function isAllowedImageType(file: File) {
  return ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
}

function isAllowedSize(file: File) {
  return file.size <= MAX_IMAGE_SIZE;
}

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File) {
  if (!isAllowedImageType(file)) {
    throw new Error(`O sistema aceita apenas imagens ${getAcceptedImageTypesLabel()}.`);
  }
  if (!isAllowedSize(file)) {
    throw new Error('A imagem deve ter no máximo 5 MB.');
  }
}

export function getAcceptedImageTypesLabel() {
  return 'PNG, JPG, JPEG ou WEBP';
}

export function getAcceptedImageTypesAttribute() {
  return '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp';
}

export async function imageFileToDataUrl(file: File) {
  validateImageFile(file);
  return readDataUrl(file);
}

export async function optimizeImageFile(file: File) {
  validateImageFile(file);

  const mediaApiUrl =
    process.env.REACT_APP_MEDIA_API_URL || 'http://localhost:3000';
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${mediaApiUrl.replace(/\/$/, '')}/optimize`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await response.json() as { error?: string };
      if (body.error) throw new Error(body.error);
    }

    throw new Error(
      response.status === 413
        ? 'A imagem enviada ultrapassa o limite suportado pelo serviço.'
        : 'Não foi possível otimizar a imagem.',
    );
  }

  const blob = await response.blob();
  if (!blob.type.includes('image/webp')) {
    throw new Error('O serviço não retornou uma imagem WebP válida.');
  }

  const disposition = response.headers.get('content-disposition') || '';
  const fileNameMatch = disposition.match(/filename="?([^";]+)"?/);
  const fileName = fileNameMatch?.[1] || `imagem-${Date.now()}.webp`;

  return new File([blob], fileName, { type: 'image/webp' });
}
