import type { EmbeddingsInterface } from '@langchain/core/embeddings';
import type { Document } from '@langchain/core/documents';
import { ConvexVectorStore } from './ConvexVectorStore.js';
import type { IVectorStore, VectorStoreConfig } from './types.js';

/**
 * High-level vector store service. Default backend: Convex.
 * Swap implementation (e.g. setStore) to use Pinecone, Weaviate, etc.
 */
export class VectorStoreService {
  private store: IVectorStore;

  constructor(
    embeddings: EmbeddingsInterface,
    config: VectorStoreConfig = {}
  ) {
    this.store = new ConvexVectorStore(embeddings, {
      convexUrl: config.convexUrl,
    });
  }

  /** Initialize (or ensure) the collection exists. Convex creates tables on deploy. */
  async initializeCollection(): Promise<void> {
    return Promise.resolve();
  }

  /** Add document embeddings to the store. */
  async addDocuments(documents: Document[]): Promise<void> {
    await this.store.addDocuments(documents);
  }

  /** Perform similarity search; return top K relevant chunks. */
  async similaritySearch(
    query: string,
    topK: number = 4,
    filter?: Record<string, unknown>
  ): Promise<Document[]> {
    return this.store.similaritySearch(query, topK, filter);
  }

  /** Delete the collection (and all vectors). */
  async deleteCollection(): Promise<void> {
    await this.store.deleteCollection();
  }

  /** Use a custom store implementation (e.g. for testing or Pinecone). */
  setStore(store: IVectorStore): void {
    this.store = store;
  }
}
