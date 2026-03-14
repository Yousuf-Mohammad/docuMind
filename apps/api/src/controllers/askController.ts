import type { Request, Response, NextFunction } from 'express';
import { queryRAG } from '../services/ragService.js';
import { success } from '@documind/shared/utils';
import type { AskBody } from '../utils/validation.js';

export async function ask(
  req: Request<object, object, AskBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { question, docIds, topK } = req.body;
    const result = await queryRAG({
      question,
      docIds,
      topK: topK ?? 4,
    });
    res.json(success(result));
  } catch (e) {
    next(e);
  }
}
