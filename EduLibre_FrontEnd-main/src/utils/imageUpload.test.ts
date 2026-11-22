import { imageFileToDataUrl, optimizeImageFile } from './imageUpload';

describe('imageUpload', () => {
  test('rejects gif uploads', async () => {
    const file = new File(['gif-content'], 'animacao.gif', { type: 'image/gif' });

    await expect(imageFileToDataUrl(file)).rejects.toThrow('O sistema aceita apenas imagens PNG, JPG, JPEG ou WEBP.');
  });

  test('returns an optimized webp file', async () => {
    const original = new File(['image-content'], 'foto.jpg', { type: 'image/jpeg' });
    const optimizedBlob = new Blob(['webp-content'], { type: 'image/webp' });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name.toLowerCase() === 'content-disposition'
            ? 'inline; filename="foto-otimizada.webp"'
            : 'image/webp',
      },
      blob: async () => optimizedBlob,
    });

    const result = await optimizeImageFile(original);

    expect(result.name).toBe('foto-otimizada.webp');
    expect(result.type).toBe('image/webp');
  });

  test('preserves the service error message', async () => {
    const original = new File(['image-content'], 'foto.png', { type: 'image/png' });

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: (name: string) =>
          name.toLowerCase() === 'content-type'
            ? 'application/json'
            : null,
      },
      json: async () => ({ error: 'Não foi possível processar a imagem.' }),
    });

    await expect(optimizeImageFile(original)).rejects.toThrow(
      'Não foi possível processar a imagem.',
    );
  });
});
