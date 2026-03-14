import type { Request, Response, NextFunction } from 'express';
import { ingestDocument } from '../services/documentService.js';
import { success, AppError } from '@documind/shared/utils';

export async function uploadPdf(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      next(new AppError('MISSING_FILE', 'No file uploaded', 400));
      return;
    }
    const result = await ingestDocument(file.buffer, file.originalname);
    res.status(201).json(success(result));
  } catch (e) {
    next(e);
  }
}
