import type { Document } from '@langchain/core/documents';

export interface StoreWithAddDocuments {
  addDocuments(documents: Document[]): Promise<void>;
}

/**
 * Store document vectors (store handles embedding internally when using LangChain Chroma).
 * Abstraction allows switching to stores that accept pre-computed vectors later.
 */
export async function storeVectors(
  store: StoreWithAddDocuments,
  documents: Document[]
): Promise<void> {
  await store.addDocuments(documents);
}
