/**
 * Centralized error handling utilities
 */

import type { ApiError } from '../types/index.js';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function toApiError(err: unknown): ApiError {
  if (isAppError(err)) {
    const api = err.toApiError();
    return { ...api, message: api.message || 'An unexpected error occurred' };
  }
  if (err instanceof Error) {
    const message =
      err.message?.trim() ||
      (err.cause instanceof Error ? err.cause.message?.trim() : undefined) ||
      err.name ||
      'An unexpected error occurred';
    return {
      code: 'INTERNAL_ERROR',
      message,
      statusCode: 500,
    };
  }
  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}

export function getStatusCode(err: unknown): number {
  if (isAppError(err)) return err.statusCode;
  return 500;
}
