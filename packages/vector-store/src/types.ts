import type { Document } from '@langchain/core/documents';

/**
 * Abstraction for vector store backends (Chroma, Pinecone, Weaviate, etc.)
 */
export interface IVectorStore {
  addDocuments(documents: Document[]): Promise<void>;
  similaritySearch(query: string, k: number, filter?: Record<string, unknown>): Promise<Document[]>;
  deleteCollection(): Promise<void>;
}

export interface VectorStoreConfig {
  /** Convex deployment URL (for Convex backend). */
  convexUrl?: string;
  /** Legacy / other backends (e.g. collectionName for Pinecone). */
  collectionName?: string;
}

export type { Document };
