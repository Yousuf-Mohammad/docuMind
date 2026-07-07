import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Startup sanity check for CONVEX_URL.
 *
 * Two silent misconfigurations previously caused hard-to-diagnose upload 502s:
 *   1. The API's CONVEX_URL (from root .env) pointed at a different deployment
 *      than the one the Convex CLI deploys to (packages/vector-store/.env.local).
 *      Result: uploads hit a deployment with no functions / wrong schema.
 *   2. A trailing slash on CONVEX_URL made the Convex client emit empty-message errors.
 *
 * This guard logs a loud warning (it does not throw) so the mismatch is visible
 * the moment the server boots, instead of surfacing as an opaque 502 on upload.
 */
export function checkConvexUrl(effectiveUrl: string | null | undefined): void {
  const url = (effectiveUrl ?? '').trim();

  if (!url) {
    console.warn('[convex-guard] CONVEX_URL is not set — uploads and search will fail.');
    return;
  }

  if (url.endsWith('/')) {
    console.warn(
      `[convex-guard] CONVEX_URL has a trailing slash ("${url}"). ` +
        'This can cause empty-message Convex errors — remove the trailing slash.'
    );
  }

  const deployUrl = readVectorStoreConvexUrl();
  if (deployUrl && normalize(deployUrl) !== normalize(url)) {
    console.warn(
      '[convex-guard] CONVEX_URL mismatch detected:\n' +
        `  API (root .env):                 ${url}\n` +
        `  Convex CLI (vector-store .env.local): ${deployUrl}\n` +
        '  The API will read/write a DIFFERENT deployment than the one the Convex CLI\n' +
        '  deploys functions/schema to. Align both to the same deployment URL, or\n' +
        '  uploads may 502 / hit a deployment with no functions.'
    );
  }
}

function normalize(u: string): string {
  return u.trim().replace(/\/+$/, '').toLowerCase();
}

/** Read CONVEX_URL from packages/vector-store/.env.local, if present. */
function readVectorStoreConvexUrl(): string | null {
  const here = dirname(fileURLToPath(import.meta.url));
  // From apps/api/src/config → repo root is four levels up; from dist it's three.
  const candidates = [
    join(here, '..', '..', '..', '..', 'packages', 'vector-store', '.env.local'),
    join(here, '..', '..', '..', 'packages', 'vector-store', '.env.local'),
  ];
  const path = candidates.find((p) => existsSync(p));
  if (!path) return null;

  try {
    const contents = readFileSync(path, 'utf8');
    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const match = line.match(/^CONVEX_URL\s*=\s*(.*)$/);
      if (match) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // Non-fatal: the guard is best-effort.
  }
  return null;
}
