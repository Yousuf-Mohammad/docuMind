import type { EmbeddingsInterface } from '@langchain/core/embeddings';
import type { Document } from '@langchain/core/documents';
import { ConvexHttpClient } from 'convex/browser';
import type { IVectorStore } from './types.js';

/** Config for Convex vector store. */
export interface ConvexVectorStoreConfig {
  /** Convex deployment URL (e.g. from CONVEX_URL env). */
  convexUrl?: string;
}

/** Transient Convex gateway/network errors worth retrying (not schema/logic errors). */
function isTransientConvexError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('502') ||
    msg.includes('bad gateway') ||
    msg.includes('<!doctype html') ||
    msg.includes('fetch failed') ||
    msg.includes('503') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout')
  );
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Run an operation, retrying transient Convex gateway errors with exponential backoff.
 * Non-transient errors (e.g. dimension mismatch) throw immediately.
 */
async function withRetry<T>(op: () => Promise<T>, attempts = 8, label = 'convex-op'): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await op();
    } catch (err) {
      lastErr = err;
      const transient = isTransientConvexError(err);
      const raw = (err instanceof Error ? err.message : String(err)).split('\n')[0].slice(0, 200);
      if (i === attempts - 1 || !transient) {
        console.error(
          `[convex-retry] ${label} failed on attempt ${i + 1}/${attempts} ` +
            `(transient=${transient}): ${raw}`
        );
        throw err;
      }
      const backoff = Math.min(500 * 2 ** i, 8000); // 0.5,1,2,4,8,8,8s -> ~31.5s budget
      console.warn(
        `[convex-retry] ${label} transient error on attempt ${i + 1}/${attempts}, ` +
          `retrying in ${backoff}ms: ${raw}`
      );
      await sleep(backoff);
    }
  }
  throw lastErr;
}

/** Max documents per Convex mutation. Large PDFs are inserted in several smaller transactions. */
const INSERT_BATCH_SIZE = 64;

/** Lazy-load Convex generated API (requires `npx convex codegen` from packages/vector-store). */
function getConvexApi(): {
  insertDocument: { batchInsertDocuments: unknown };
  vectorSearch: { vectorSimilaritySearch: unknown };
} {
  try {
    return require('../convex/_generated/api.js').api;
  } catch {
    throw new Error(
      'Convex API not found. Run `npx convex codegen` from packages/vector-store.'
    );
  }
}

/**
 * Convex-backed vector store. Implements IVectorStore so the system
 * can still switch to Pinecone or other backends later.
 */
export class ConvexVectorStore implements IVectorStore {
  private embeddings: EmbeddingsInterface;
  private client: ConvexHttpClient;

  constructor(embeddings: EmbeddingsInterface, config: ConvexVectorStoreConfig = {}) {
    this.embeddings = embeddings;
    const url = config.convexUrl ?? process.env.CONVEX_URL;
    if (!url) {
      throw new Error('CONVEX_URL or config.convexUrl is required for Convex vector store.');
    }
    this.client = new ConvexHttpClient(url);
  }

  async addDocuments(documents: Document[]): Promise<void> {
    if (documents.length === 0) return;
    const vectors = await this.embeddings.embedDocuments(
      documents.map((d) => d.pageContent ?? '')
    );
    const api = getConvexApi();
    const payload = documents.map((doc, i) => ({
      content: doc.pageContent ?? '',
      embedding: vectors[i] as number[],
      metadata: (doc.metadata ?? {}) as Record<string, unknown>,
      source: (doc.metadata?.source as string) ?? '',
      docId: doc.metadata?.docId as string | undefined,
    }));
    // Insert in sub-batches so large PDFs don't exceed Convex per-mutation limits.
    for (let i = 0; i < payload.length; i += INSERT_BATCH_SIZE) {
      const slice = payload.slice(i, i + INSERT_BATCH_SIZE);
      const batchNo = Math.floor(i / INSERT_BATCH_SIZE) + 1;
      await withRetry(
        () =>
          this.client.mutation(
            api.insertDocument.batchInsertDocuments as Parameters<ConvexHttpClient['mutation']>[0],
            { documents: slice } as Parameters<ConvexHttpClient['mutation']>[1]
          ),
        8,
        `insert batch ${batchNo} (${slice.length} docs)`
      );
    }
  }

  async similaritySearch(
    query: string,
    k: number = 4,
    filter?: Record<string, unknown>
  ): Promise<Document[]> {
    const [queryVector] = await this.embeddings.embedDocuments([query]);
    const docIdFilter = filter?.docId as { $in?: string[] } | undefined;
    const docIds = docIdFilter?.$in;
    const api = getConvexApi();
    const results = (await withRetry(
      () =>
        this.client.action(
          api.vectorSearch.vectorSimilaritySearch as Parameters<ConvexHttpClient['action']>[0],
          {
            queryEmbedding: queryVector as number[],
            limit: k,
            docIds,
          } as Parameters<ConvexHttpClient['action']>[1]
        ),
      8,
      'vectorSearch'
    )) as Array<{ content: string; metadata: Record<string, unknown>; source: string }>;
    return results.map((r) => ({
      pageContent: r.content,
      metadata: { ...r.metadata, source: r.source },
    })) as Document[];
  }

  async deleteCollection(): Promise<void> {
    return Promise.resolve();
  }
}
