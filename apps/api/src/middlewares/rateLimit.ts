import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000; // 15 minutes
const max = 100; // per window

export const apiLimiter = rateLimit({
  windowMs,
  max,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests', statusCode: 429 } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs,
  max: 20,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many uploads', statusCode: 429 } },
  standardHeaders: true,
  legacyHeaders: false,
});
