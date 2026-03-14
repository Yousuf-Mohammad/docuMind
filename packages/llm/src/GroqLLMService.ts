import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';

const DEFAULT_PROMPT = `You are a helpful assistant that answers questions based only on the provided context. If the context does not contain enough information, say so. Do not make up information.

Context:
{context}

Question: {question}

Answer:`;

export interface GroqLLMServiceOptions {
  apiKey?: string;
  model?: string;
  promptTemplate?: string;
}

/**
 * LLM service using Groq API. Accepts prompt + retrieved context, returns generated answer.
 */
export class GroqLLMService {
  private model: ChatGroq;
  private promptTemplate: string;

  constructor(options: GroqLLMServiceOptions = {}) {
    const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is required. Set it in environment or pass apiKey.');
    }
    this.model = new ChatGroq({
      apiKey,
      model: options.model ?? 'llama-3.1-8b-instant',
      temperature: 0,
    });
    this.promptTemplate = options.promptTemplate ?? DEFAULT_PROMPT;
  }

  /**
   * Send context + question to Groq API and return the generated answer.
   */
  async generateAnswer(context: string, question: string): Promise<string> {
    const template = PromptTemplate.fromTemplate(this.promptTemplate);
    const formatted = await template.format({ context, question });
    const response = await this.model.invoke([{ role: 'user' as const, content: formatted }]);
    const content = response.content;
    return typeof content === 'string' ? content : String(content ?? '');
  }
}
