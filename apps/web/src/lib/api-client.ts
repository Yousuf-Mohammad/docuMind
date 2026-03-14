import type { UploadResult } from '@documind/shared/types';
import type { QueryRequest, QueryResponse } from '@documind/shared/types';

const getBaseUrl = () =>
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001')
    : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface ApiClientOptions {
  baseUrl?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? getBaseUrl();
  }

  async uploadPdf(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error?.message ?? 'Upload failed');
    }
    const body = await res.json();
    return (body?.success && body?.data != null ? body.data : body) as UploadResult;
  }

  async ask(request: QueryRequest): Promise<QueryResponse> {
    const res = await fetch(`${this.baseUrl}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error?.message ?? 'Query failed');
    }
    const body = await res.json();
    return (body?.success && body?.data != null ? body.data : body) as QueryResponse;
  }
}

export const defaultApiClient = new ApiClient();
