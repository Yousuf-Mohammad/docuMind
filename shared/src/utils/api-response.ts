/**
 * Consistent API response helpers
 */

import type { ApiError } from '../types/index.js';

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function success<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: ApiError): ErrorResponse {
  return { success: false, error };
}
