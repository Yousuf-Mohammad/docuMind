import type { Document } from '@langchain/core/documents';

export interface NormalizedDocument {
  content: string;
  metadata: Record<string, unknown>;
}

/**
 * Normalize text: trim, collapse whitespace, remove null bytes.
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize a LangChain Document into a consistent shape.
 */
export function normalizeDocument(doc: Document): NormalizedDocument {
  const content = normalizeText(doc.pageContent ?? '');
  const metadata: Record<string, unknown> = {
    ...(doc.metadata && typeof doc.metadata === 'object' ? doc.metadata : {}),
  };
  return { content, metadata };
}

/**
 * Normalize multiple documents.
 */
export function normalizeDocuments(docs: Document[]): NormalizedDocument[] {
  return docs.map(normalizeDocument);
}
