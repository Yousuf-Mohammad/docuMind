/**
 * Shared types for DocuMind AI (frontend + backend)
 */

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: DocumentChunkMetadata;
}

export interface DocumentChunkMetadata {
  source?: string;
  page?: number;
  docId?: string;
  [key: string]: unknown;
}

/** Embedding vector (array of numbers) */
export type EmbeddingVector = number[];

export interface RAGQuery {
  question: string;
  docIds?: string[];
  topK?: number;
}

/** Alias for API ask request */
export type QueryRequest = RAGQuery;

export interface RAGResponse {
  answer: string;
  sources: RAGSource[];
}

/** Alias for API ask response */
export type QueryResponse = RAGResponse;

export interface RAGSource {
  content: string;
  metadata: DocumentChunkMetadata;
  score?: number;
}

export interface UploadResult {
  docId: string;
  filename: string;
  chunkCount: number;
}

/** Uploaded document metadata (for listing) */
export interface UploadedDocument {
  docId: string;
  filename: string;
  chunkCount: number;
  uploadedAt?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}
