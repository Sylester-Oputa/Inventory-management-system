import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`Backend listening on http://localhost:${env.PORT}`);
});

process.on('SIGINT', () => {
  logger.warn('SIGINT received, shutting down');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  logger.warn('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});
