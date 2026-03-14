import type { EmbeddingsInterface } from '@langchain/core/embeddings';
import type { Document } from '@langchain/core/documents';
import { ConvexHttpClient } from 'convex/browser';
import type { IVectorStore } from './types.js';

/** Config for Convex vector store. */
export interface ConvexVectorStoreConfig {
  /** Convex deployment URL (e.g. from CONVEX_URL env). */
  convexUrl?: string;
}

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
    await this.client.mutation(
      api.insertDocument.batchInsertDocuments as Parameters<ConvexHttpClient['mutation']>[0],
      { documents: payload } as Parameters<ConvexHttpClient['mutation']>[1]
    );
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
    const results = await this.client.action(
      api.vectorSearch.vectorSimilaritySearch as Parameters<ConvexHttpClient['action']>[0],
      {
        queryEmbedding: queryVector as number[],
        limit: k,
        docIds,
      } as Parameters<ConvexHttpClient['action']>[1]
    ) as Array<{ content: string; metadata: Record<string, unknown>; source: string }>;
    return results.map((r) => ({
      pageContent: r.content,
      metadata: { ...r.metadata, source: r.source },
    })) as Document[];
  }

  async deleteCollection(): Promise<void> {
    return Promise.resolve();
  }
}
