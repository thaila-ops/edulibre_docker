import type * as express from 'express';
import { MulterError } from 'multer';
import { UniqueConstraintError } from 'sequelize';
import HttpError from '../utils/http-error';

const errorMiddleware = (
  error: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  console.error('ERRO CAPTURADO:', error.message, error.stack);
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'A imagem deve ter no máximo 5 MB.',
      });
    }

    return res.status(400).json({
      message: 'Não foi possível processar o upload da imagem.',
    });
  }
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  if (error instanceof UniqueConstraintError) {
    return res
      .status(409)
      .json({ message: 'Já existe um registo com estes dados.' });
  }
  return res.status(500).json({ message: 'Erro interno do servidor.' });
};

export default errorMiddleware;
