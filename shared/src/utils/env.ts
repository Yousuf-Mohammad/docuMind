/**
 * Environment variable helpers with validation
 */

export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getEnvOptional(key: string, defaultValue?: string): string | undefined {
  const value = process.env[key];
  if (value === undefined || value === '') return defaultValue;
  return value;
}

export function getEnvNumber(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return defaultValue;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return defaultValue;
  return n;
}

export function getEnvBool(key: string, defaultValue: boolean): boolean {
  const raw = process.env[key]?.toLowerCase();
  if (raw === undefined || raw === '') return defaultValue;
  return raw === '1' || raw === 'true' || raw === 'yes';
}
