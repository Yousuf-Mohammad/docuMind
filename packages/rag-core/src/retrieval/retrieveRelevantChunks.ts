import type { Document } from '@langchain/core/documents';

export interface VectorStoreLike {
  similaritySearch(
    query: string,
    k?: number,
    filter?: Record<string, unknown>
  ): Promise<Document[]>;
}

export interface RetrieveOptions {
  topK?: number;
  filter?: Record<string, unknown>;
}

/**
 * Retrieve top-K relevant chunks from the vector store.
 * Composable; depends only on VectorStoreLike interface.
 */
export async function retrieveRelevantChunks(
  store: VectorStoreLike,
  query: string,
  options: RetrieveOptions = {}
): Promise<Document[]> {
  const topK = options.topK ?? 4;
  return store.similaritySearch(query, topK, options.filter);
}
