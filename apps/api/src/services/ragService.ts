import { RAGService as RAGServiceCore } from '@documind/rag-core';
import { LocalEmbeddingService } from '@documind/embeddings';
import { VectorStoreService } from '@documind/vector-store';
import { apiConfig } from '../config/index.js';
import { AppError } from '@documind/shared/utils';
import type { RAGQuery, RAGResponse } from '@documind/shared/types';

let ragServiceInstance: RAGServiceCore | null = null;

function getRAGService(): RAGServiceCore {
  if (!ragServiceInstance) {
    const embeddingService = new LocalEmbeddingService();
    const embeddings = embeddingService.getLangChainEmbeddings();
    const store = new VectorStoreService(embeddings, {
      convexUrl: apiConfig.convexUrl ?? undefined,
    });
    ragServiceInstance = new RAGServiceCore(store);
  }
  return ragServiceInstance;
}

function isLLMRateLimitOrQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  return (
    lower.includes('rate limit') ||
    lower.includes('quota') ||
    lower.includes('429') ||
    lower.includes('too many requests')
  );
}

/**
 * Business logic for RAG query. API layer calls this only; no RAG logic in routes.
 * Maps LLM failures and rate limits to AppError for graceful API responses.
 */
export async function queryRAG(input: RAGQuery): Promise<RAGResponse> {
  try {
    const service = getRAGService();
    return await service.query(input);
  } catch (e) {
    if (isLLMRateLimitOrQuotaError(e)) {
      throw new AppError(
        'LLM_RATE_LIMIT',
        'LLM service is temporarily rate limited. Please try again shortly.',
        429
      );
    }
    if (e instanceof Error && e.message?.includes('GROQ_API_KEY')) {
      throw new AppError('LLM_CONFIG', 'LLM service is not configured. Check GROQ_API_KEY.', 503);
    }
    throw e;
  }
}
