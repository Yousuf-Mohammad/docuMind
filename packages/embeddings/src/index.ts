import type { EmbeddingsInterface } from '@langchain/core/embeddings';
import { LocalEmbeddingService } from './LocalEmbeddingService.js';
import type { LocalEmbeddingServiceOptions } from './LocalEmbeddingService.js';

export { LocalEmbeddingService } from './LocalEmbeddingService.js';
export type { LocalEmbeddingServiceOptions } from './LocalEmbeddingService.js';

/**
 * Create default local embeddings (Ollama nomic-embed-text) for the RAG pipeline.
 */
export function createEmbeddings(options: LocalEmbeddingServiceOptions = {}): EmbeddingsInterface {
  const service = new LocalEmbeddingService(options);
  return service.getLangChainEmbeddings();
}
