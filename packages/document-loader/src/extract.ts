import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import type { Document } from '@langchain/core/documents';

/**
 * Extract raw text from a PDF file path (Node.js only).
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const docs = await loader.load();
  return docs.map((d) => d.pageContent).join('\n\n');
}

/**
 * Extract text from PDF buffer by writing to temp file then loading.
 */
export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const os = await import('node:os');
  const { createId } = await import('@documind/shared/utils');
  const tempPath = path.join(os.tmpdir(), `documind-${createId()}.pdf`);
  await fs.writeFile(tempPath, buffer);
  try {
    return await extractTextFromPDF(tempPath);
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

/**
 * Extract text from a LangChain Document (single page or combined).
 */
export function extractText(doc: Document): string {
  return doc.pageContent ?? '';
}

/**
 * Extract text from multiple documents.
 */
export function extractTextFromDocuments(docs: Document[]): string {
  return docs.map(extractText).join('\n\n');
}
