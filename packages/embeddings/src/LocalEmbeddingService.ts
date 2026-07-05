import { TransformersEmbeddings } from './TransformersEmbeddings.js';
import type { EmbeddingVector } from '@documind/shared/types';

export interface LocalEmbeddingServiceOptions {
  /** Transformers.js model name (default Xenova/all-MiniLM-L6-v2, 384-dim) */
  model?: string;
  /** Max texts per batch for createBatchEmbeddings (default 50) */
  batchSize?: number;
}

/**
 * Local embedding service using Transformers.js (all-MiniLM-L6-v2).
 * Runs in-process — no API key, no external server (no Ollama required).
 * The model (~90 MB) is downloaded to a local cache on first use.
 */
export class LocalEmbeddingService {
  private embeddings: TransformersEmbeddings;
  private batchSize: number;

  constructor(options: LocalEmbeddingServiceOptions = {}) {
    this.embeddings = new TransformersEmbeddings({
      model: options.model ?? 'Xenova/all-MiniLM-L6-v2',
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
  getLangChainEmbeddings(): TransformersEmbeddings {
    return this.embeddings;
  }
}
