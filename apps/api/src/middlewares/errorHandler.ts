import type { Request, Response, NextFunction } from 'express';
import { toApiError, getStatusCode } from '@documind/shared/utils';
import { logger } from '@documind/shared/utils';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = getStatusCode(err);
  const apiError = toApiError(err);

  const cause = err instanceof Error && err.cause instanceof Error ? err.cause.message : undefined;
  const stack = err instanceof Error ? err.stack : undefined;
  logger.error('Request error', {
    code: apiError.code,
    message: apiError.message,
    statusCode,
    ...(cause ? { cause } : {}),
    ...(stack && !apiError.message ? { stack: stack.slice(0, 500) } : {}),
  });

  res.status(statusCode).json({
    success: false,
    error: apiError,
  });
}
