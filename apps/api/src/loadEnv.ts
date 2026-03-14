import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load .env from monorepo root (cwd is apps/api when run via npm run dev:api)
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnv = join(__dirname, '..', '..', '..', '.env');   // from src
const rootEnvDist = join(__dirname, '..', '..', '.env');     // from dist
const path = existsSync(rootEnv) ? rootEnv : rootEnvDist;
dotenv.config({ path });
