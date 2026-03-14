/**
 * Shared utilities for DocuMind AI
 */

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}

export function chunkText(text: string, maxChunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  const step = maxChunkSize - overlap;
  while (start < text.length) {
    chunks.push(text.slice(start, start + maxChunkSize));
    start += step;
  }
  return chunks.filter(Boolean);
}

export { logger } from './logger.js';
export { getEnv, getEnvOptional, getEnvNumber, getEnvBool } from './env.js';
export {
  AppError,
  isAppError,
  toApiError,
  getStatusCode,
} from './error-handler.js';
export { success, errorResponse } from './api-response.js';
export type { SuccessResponse, ErrorResponse, ApiResponse } from './api-response.js';
