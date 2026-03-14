import { ingestDocument as ragIngestDocument } from '@documind/rag-core';
import { LocalEmbeddingService } from '@documind/embeddings';
import { VectorStoreService } from '@documind/vector-store';
import { apiConfig } from '../config/index.js';
import { AppError } from '@documind/shared/utils';
import type { UploadResult } from '@documind/shared/types';
import type { Document } from '@langchain/core/documents';

/**
 * Business logic for document ingestion. Uses rag-core only; no RAG logic here.
 */
export async function ingestDocument(buffer: Buffer, filename: string): Promise<UploadResult> {
  const embeddingService = new LocalEmbeddingService();
  const embeddings = embeddingService.getLangChainEmbeddings();
  const vectorStore = new VectorStoreService(embeddings, {
    convexUrl: apiConfig.convexUrl ?? undefined,
  });

  await vectorStore.initializeCollection();

  const embedAndStore = async (documents: Document[]) => {
    await vectorStore.addDocuments(documents);
  };

  try {
    return await ragIngestDocument(buffer, filename, { embedAndStore });
  } catch (err) {
    const message = (err instanceof Error ? err.message : String(err))?.trim();
    if (message === 'fetch failed' || message?.includes('fetch failed')) {
      throw new AppError(
        'UPLOAD_FAILED',
        'Upload failed: check that CONVEX_URL is your deployment URL (e.g. https://xxx.convex.cloud) and that Ollama is running (embeddings) at ' +
          (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434') +
          '. Original error: ' + (message || 'connection failed'),
        503
      );
    }
    if (
      message?.includes('502') ||
      message?.includes('Bad gateway') ||
      message?.includes('<!DOCTYPE html')
    ) {
      throw new AppError(
        'CONVEX_UNAVAILABLE',
        'Convex returned an error (502 Bad Gateway). Redeploy from packages/vector-store: npx convex deploy. If it persists, check status.convex.dev or your Convex dashboard.',
        503
      );
    }
    if (!message || message === '') {
      throw new AppError(
        'UPLOAD_FAILED',
        'Upload failed. Check that Ollama is running (ollama serve, ollama pull nomic-embed-text) and Convex is deployed (npx convex deploy from packages/vector-store). Check API server logs for details.',
        503
      );
    }
    throw err;
  }
}
