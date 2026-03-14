import type { Document } from '@langchain/core/documents';
import type { RAGSource } from '@documind/shared/types';
import { GroqLLMService } from '@documind/llm';

export interface GenerateAnswerOptions {
  groqApiKey?: string;
  model?: string;
  promptTemplate?: string;
  /** Optional Groq LLM service instance (otherwise created from options/env). */
  llmService?: GroqLLMService;
}

/**
 * Generate an answer from context and question using Groq LLM.
 * Composable; no vector store dependency.
 */
export async function generateAnswer(
  context: string,
  question: string,
  options: GenerateAnswerOptions = {}
): Promise<string> {
  const llm = options.llmService ?? new GroqLLMService({
    apiKey: options.groqApiKey ?? process.env.GROQ_API_KEY,
    model: options.model,
    promptTemplate: options.promptTemplate,
  });
  return llm.generateAnswer(context, question);
}

/**
 * Build context string from retrieved documents.
 */
export function buildContextFromDocuments(docs: Document[]): string {
  return docs.map((d) => d.pageContent).join('\n\n---\n\n');
}

/**
 * Map LangChain documents to RAGSource format.
 */
export function documentsToSources(docs: Document[]): RAGSource[] {
  return docs.map((d) => ({
    content: d.pageContent,
    metadata: (d.metadata ?? {}) as RAGSource['metadata'],
  }));
}
