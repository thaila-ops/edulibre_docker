const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
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

export function getAcceptedImageTypesLabel() {
  return 'PNG, JPG, JPEG ou WEBP';
}

export function getAcceptedImageTypesAttribute() {
  return '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp';
}

export async function imageFileToDataUrl(file: File) {
  if (!isAllowedImageType(file)) {
    throw new Error(`O sistema aceita apenas imagens ${getAcceptedImageTypesLabel()}.`);
  }
  if (!isAllowedSize(file)) throw new Error('A imagem deve ter no máximo 2 MB.');
  return readDataUrl(file);
}
