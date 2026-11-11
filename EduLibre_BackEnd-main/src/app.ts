import 'dotenv/config';
import routes from './routes';
import errorMiddleware from './middlewares/error.middleware';
import { uploadDirectory } from './config/upload';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadDirectory));
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://edulibre.local'],
    credentials: false,
  }),
);
app.use(limiter);

app.use(routes);
app.use(errorMiddleware);

export default app;
