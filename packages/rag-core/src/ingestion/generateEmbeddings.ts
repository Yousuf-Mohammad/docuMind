import type { Document } from '@langchain/core/documents';
import type { EmbeddingVector } from '@documind/shared/types';

export interface EmbeddingServiceLike {
  createBatchEmbeddings(texts: string[]): Promise<EmbeddingVector[]>;
}

/**
 * Generate embeddings for a list of documents (batch).
 * Reusable; no vector store dependency.
 */
export async function generateEmbeddings(
  embeddingService: EmbeddingServiceLike,
  documents: Document[]
): Promise<EmbeddingVector[]> {
  const texts = documents.map((d) => d.pageContent ?? '');
  return embeddingService.createBatchEmbeddings(texts);
}
