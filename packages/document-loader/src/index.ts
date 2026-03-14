import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import type { Document } from '@langchain/core/documents';
import { createId } from '@documind/shared/utils';
import { extractText, extractTextFromDocuments } from './extract.js';

export interface LoadPDFOptions {
  splitPages?: boolean;
}

/**
 * Load and parse a PDF file into LangChain Document format.
 */
export async function loadPDF(
  filePath: string,
  options: LoadPDFOptions = {}
): Promise<Document[]> {
  const loader = new PDFLoader(filePath, {
    splitPages: options.splitPages ?? true,
  });
  const docs = await loader.load();
  return docs.map((d) => ({
    ...d,
    metadata: {
      ...d.metadata,
      docId: d.metadata?.docId ?? createId(),
    },
  }));
}

/**
 * Load PDF from a Buffer (e.g. upload stream).
 */
export async function loadPDFFromBuffer(
  buffer: Buffer,
  options: LoadPDFOptions & { tempId?: string } = {}
): Promise<Document[]> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const os = await import('node:os');
  const tempId = options.tempId ?? createId();
  const tempPath = path.join(os.tmpdir(), `documind-${tempId}.pdf`);
  await fs.writeFile(tempPath, buffer);
  try {
    return await loadPDF(tempPath, options);
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

export { extractText, extractTextFromDocuments };
export { extractTextFromPDF, extractTextFromBuffer } from './extract.js';
export { normalizeDocument, normalizeDocuments, normalizeText } from './normalize.js';
export type { NormalizedDocument } from './normalize.js';
export { PDFLoader };
export type { Document };
