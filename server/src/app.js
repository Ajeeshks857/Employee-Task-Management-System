import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { verifySecurityToken } from './middlewares/authMiddleware.js';
import { NotFoundError } from './utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*', // Allow frontend dev & preview & production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-auth-token'],
  })
);

// High-capacity payload limits for large data operations
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Mount API routes protected by security token
app.use('/api', verifySecurityToken, routes);

// Serve static client build if built
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for undefined API routes
app.use((req, res, next) => {
  next(new NotFoundError(`Endpoint '${req.originalUrl}' not found.`));
});

// Centralized error handler
app.use(errorHandler);

export default app;
