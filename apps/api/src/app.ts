import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/uploadRoutes.js';
import askRoutes from './routes/askRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter, uploadLimiter } from './middlewares/rateLimit.js';
import { apiConfig } from './config/index.js';

const app = express();

app.use(cors({ origin: apiConfig.corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/upload', uploadLimiter, uploadRoutes);
app.use('/ask', apiLimiter, askRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'documind-api' });
});

app.use(errorHandler);

export default app;
