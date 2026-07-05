import { Embeddings, type EmbeddingsParams } from '@langchain/core/embeddings';
import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

export interface TransformersEmbeddingsParams extends EmbeddingsParams {
  /** Transformers.js model name (default Xenova/all-MiniLM-L6-v2, 384-dim). */
  model?: string;
}

/**
 * LangChain-compatible embeddings backed by Transformers.js, running in-process.
 * No API key and no external server: the model (~90 MB) is downloaded to a local
 * cache on first use, then mean-pooled and L2-normalized like a sentence-transformer.
 */
export class TransformersEmbeddings extends Embeddings {
  readonly model: string;
  private pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

  constructor(fields: TransformersEmbeddingsParams = {}) {
    super(fields);
    this.model = fields.model ?? 'Xenova/all-MiniLM-L6-v2';
  }

  private getPipeline(): Promise<FeatureExtractionPipeline> {
    if (!this.pipelinePromise) {
      this.pipelinePromise = pipeline('feature-extraction', this.model);
    }
    return this.pipelinePromise;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const extractor = await this.getPipeline();
    const results: number[][] = [];
    for (const text of texts) {
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      results.push(Array.from(output.data as Float32Array));
    }
    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embedDocuments([text]);
    return vector;
  }
}
