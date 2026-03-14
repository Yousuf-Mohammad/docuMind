import { getEnvOptional } from '@documind/shared/utils';

export interface EnvConfig {
  NODE_ENV: string;
  API_PORT: number;
  GROQ_API_KEY: string;
  CHROMA_HOST: string;
  CHROMA_PORT: number;
  CORS_ORIGINS: string[];
}

function parsePort(): number {
  const raw = getEnvOptional('API_PORT', '3001');
  const n = parseInt(raw ?? '3001', 10);
  return Number.isNaN(n) ? 3001 : n;
}

function parseCors(): string[] {
  const raw = getEnvOptional('CORS_ORIGINS', 'http://localhost:3000');
  return (raw ?? 'http://localhost:3000').split(',').map((o) => o.trim());
}

/**
 * Validate required env at startup. Throws if GROQ_API_KEY is missing in production.
 */
export function validateEnv(): EnvConfig {
  const nodeEnv = getEnvOptional('NODE_ENV', 'development') ?? 'development';
  const groqKey = getEnvOptional('GROQ_API_KEY');
  if (nodeEnv === 'production' && !groqKey) {
    throw new Error('GROQ_API_KEY is required in production');
  }
  return {
    NODE_ENV: nodeEnv,
    API_PORT: parsePort(),
    GROQ_API_KEY: groqKey ?? '',
    CHROMA_HOST: getEnvOptional('CHROMA_HOST', 'localhost') ?? 'localhost',
    CHROMA_PORT: parseInt(getEnvOptional('CHROMA_PORT', '8000') ?? '8000', 10),
    CORS_ORIGINS: parseCors(),
  };
}
