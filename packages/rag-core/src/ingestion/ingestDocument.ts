import type { Document } from '@langchain/core/documents';
import { createId, sanitizeFilename } from '@documind/shared/utils';
import type { UploadResult } from '@documind/shared/types';
import { loadPDFFromBuffer } from '@documind/document-loader';
import { chunkDocument } from '../chunking/index.js';
import type { ChunkOptions } from '../chunking/index.js';

export interface IngestDocumentDeps {
  embedAndStore: (documents: Document[]) => Promise<void>;
}

export interface IngestDocumentOptions extends ChunkOptions {
  tempId?: string;
}

/**
 * Ingest a PDF: load, chunk, then delegate embed+store to caller.
 * Caller injects embedAndStore (uses EmbeddingService + VectorStoreService).
 * Composable and testable with mock embedAndStore.
 */
export async function ingestDocument(
  buffer: Buffer,
  filename: string,
  deps: IngestDocumentDeps,
  options: IngestDocumentOptions = {}
): Promise<UploadResult> {
  const docId = options.tempId ?? createId();
  const safeName = sanitizeFilename(filename);

  const rawDocs = await loadPDFFromBuffer(buffer, { tempId: docId });
  const docsWithMeta: Document[] = rawDocs.map((d) => ({
    ...d,
    metadata: {
      ...d.metadata,
      docId,
      source: safeName,
    },
  }));

  const chunked = await chunkDocument(docsWithMeta, {
    chunkSize: options.chunkSize,
    chunkOverlap: options.chunkOverlap,
  });

  await deps.embedAndStore(chunked);

  return {
    docId,
    filename: safeName,
    chunkCount: chunked.length,
  };
}
