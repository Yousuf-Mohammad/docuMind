import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import { AppError } from '@documind/shared/utils';

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const msg = result.error.errors.map((e) => e.message).join('; ');
      next(new AppError('VALIDATION_ERROR', msg, 400, result.error.errors));
      return;
    }
    req.body = result.data;
    next();
  };
}
