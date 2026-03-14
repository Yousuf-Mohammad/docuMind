import type { EmbeddingsInterface } from '@langchain/core/embeddings';
import type { Document } from '@langchain/core/documents';
import { VectorStoreService } from './VectorStoreService.js';
import { ConvexVectorStore } from './ConvexVectorStore.js';

export { VectorStoreService, ConvexVectorStore };
export type { IVectorStore, VectorStoreConfig } from './types.js';
export type { ConvexVectorStoreConfig } from './ConvexVectorStore.js';
export type { Document, EmbeddingsInterface };
