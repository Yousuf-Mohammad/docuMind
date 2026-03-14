import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { Document } from '@langchain/core/documents';

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 200;

/**
 * Split documents into smaller chunks using RecursiveCharacterTextSplitter.
 * Independently testable; no I/O.
 */
export async function chunkDocument(
  documents: Document[],
  options: ChunkOptions = {}
): Promise<Document[]> {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap ?? DEFAULT_OVERLAP;
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  return splitter.splitDocuments(documents);
}
