import { OllamaEmbeddings } from '@langchain/ollama';
import type { EmbeddingVector } from '@documind/shared/types';

export interface LocalEmbeddingServiceOptions {
  /** Ollama base URL (default http://localhost:11434) */
  baseUrl?: string;
  /** Model name (default nomic-embed-text) */
  model?: string;
  /** Max texts per batch for createBatchEmbeddings (default 50) */
  batchSize?: number;
}

/**
 * Local embedding service using Ollama with nomic-embed-text.
 * No API key required; runs on your machine.
 */
export class LocalEmbeddingService {
  private embeddings: OllamaEmbeddings;
  private batchSize: number;

  constructor(options: LocalEmbeddingServiceOptions = {}) {
    this.embeddings = new OllamaEmbeddings({
      baseUrl: options.baseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
      model: options.model ?? 'nomic-embed-text',
    });
    this.batchSize = options.batchSize ?? 50;
  }

  /** Generate embedding for a single text. */
  async createEmbedding(text: string): Promise<EmbeddingVector> {
    const vectors = await this.embeddings.embedDocuments([text]);
    return vectors[0] as EmbeddingVector;
  }

  /** Generate embeddings for multiple texts in batches. */
  async createBatchEmbeddings(texts: string[]): Promise<EmbeddingVector[]> {
    if (texts.length === 0) return [];
    const results: EmbeddingVector[] = [];
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const vectors = await this.embeddings.embedDocuments(batch);
      results.push(...(vectors as EmbeddingVector[]));
    }
    return results;
  }

  /** Expose LangChain embeddings for vector stores. */
  getLangChainEmbeddings(): OllamaEmbeddings {
    return this.embeddings;
  }
}
