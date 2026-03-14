import type { RAGQuery, RAGResponse, RAGSource } from '@documind/shared/types';
import { retrieveRelevantChunks } from './retrieval/index.js';
import type { VectorStoreLike } from './retrieval/index.js';
import {
  generateAnswer,
  buildContextFromDocuments,
  documentsToSources,
} from './generation/index.js';
import type { GenerateAnswerOptions } from './generation/index.js';

export { chunkDocument } from './chunking/index.js';
export type { ChunkOptions } from './chunking/index.js';
export { ingestDocument, generateEmbeddings, storeVectors } from './ingestion/index.js';
export type { IngestDocumentDeps, IngestDocumentOptions, StoreWithAddDocuments } from './ingestion/index.js';
export { retrieveRelevantChunks } from './retrieval/index.js';
export type { VectorStoreLike, RetrieveOptions } from './retrieval/index.js';
export {
  generateAnswer,
  buildContextFromDocuments,
  documentsToSources,
} from './generation/index.js';
export type { GenerateAnswerOptions } from './generation/index.js';

export interface RAGServiceOptions extends GenerateAnswerOptions {}

/**
 * RAG service: retrieve relevant chunks then generate answer with LLM.
 * API layer calls this; no RAG logic in routes.
 */
export class RAGService {
  private store: VectorStoreLike;
  private options: RAGServiceOptions;

  constructor(store: VectorStoreLike, options: RAGServiceOptions = {}) {
    this.store = store;
    this.options = options;
  }

  async query(input: RAGQuery): Promise<RAGResponse> {
    const { question, docIds, topK = 4 } = input;
    const filter = docIds?.length ? { docId: { $in: docIds } } : undefined;

    const docs = await retrieveRelevantChunks(this.store, question, {
      topK,
      filter,
    });

    const context = buildContextFromDocuments(docs);
    const answer = await generateAnswer(context, question, this.options);
    const sources: RAGSource[] = documentsToSources(docs);

    return { answer, sources };
  }
}

export type { RAGQuery, RAGResponse, RAGSource };
