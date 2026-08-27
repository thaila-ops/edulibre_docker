import { randomUUID } from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import HttpError from '../utils/http-error';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const safeName =
      path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) || 'imagem';

    callback(
      null,
      `${safeName}-${Date.now()}-${randomUUID()}${extension}`,
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const validMimeType = allowedMimeTypes.includes(file.mimetype);
    const validExtension = allowedExtensions.includes(extension);

    if (!validMimeType || !validExtension) {
      return callback(
        new HttpError(
          400,
          'Envie uma imagem JPG, JPEG, PNG ou WEBP.',
        ),
      );
    }

    return callback(null, true);
  },
});

export default upload;
export { uploadDirectory };