import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { logger } from '../infra/Logger.js';

export function errorHandler(err: Error & { code?: string }, c: Context) {
  logger.error(err.message, { err });

  const status = getStatusCode(err.code);
  const message = status === 500 ? 'Internal Server Error' : err.message;
  return c.json({ message, code: err.code }, status as ContentfulStatusCode);
}

function getStatusCode(code: string | undefined): number {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'NOT_FOUND':
      return 404;
    case 'SERVICE_UNAVAILABLE':
      return 503;
    default:
      return 500;
  }
}
