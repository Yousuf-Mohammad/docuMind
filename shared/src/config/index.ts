/**
 * Environment-based configuration
 */

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOptional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue;
}

export const config = {
  groq: {
    apiKey: () => getEnv('GROQ_API_KEY'),
  },
  convex: {
    url: () => getEnvOptional('CONVEX_URL'),
  },
  api: {
    port: () => parseInt(getEnvOptional('API_PORT', '3001') ?? '3001', 10),
    nodeEnv: () => getEnvOptional('NODE_ENV', 'development'),
    corsOrigins: () =>
      getEnvOptional('CORS_ORIGINS', 'http://localhost:3000')?.split(',').map((o) => o.trim()) ?? [],
  },
  web: {
    apiUrl: () => getEnvOptional('NEXT_PUBLIC_API_URL', 'http://localhost:3001') ?? 'http://localhost:3001',
  },
} as const;
