import { z } from 'zod';

export const uploadSchema = z.object({
  file: z.custom<Express.Multer.File>((v) => v != null),
});

export const askBodySchema = z.object({
  question: z.string().min(1, 'Question is required').max(2000),
  docIds: z.array(z.string()).optional(),
  topK: z.number().int().min(1).max(20).optional(),
});

export type AskBody = z.infer<typeof askBodySchema>;
