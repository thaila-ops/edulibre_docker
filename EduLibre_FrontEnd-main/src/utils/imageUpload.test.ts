import { imageFileToDataUrl } from './imageUpload';

describe('imageUpload', () => {
  test('rejects gif uploads', async () => {
    const file = new File(['gif-content'], 'animacao.gif', { type: 'image/gif' });

    await expect(imageFileToDataUrl(file)).rejects.toThrow('O sistema aceita apenas imagens PNG, JPG, JPEG ou WEBP.');
  });
});
