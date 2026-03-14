import { useState, useCallback } from 'react';
import type { RAGResponse } from '@documind/shared/types';
import { defaultApiClient } from './api-client';

export function useAsk(apiClient = defaultApiClient) {
  const [answering, setAnswering] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<RAGResponse['sources']>([]);

  const ask = useCallback(async (question: string) => {
    setAnswering(true);
    setAnswer(null);
    setSources([]);
    try {
      const data = await apiClient.ask({ question });
      setAnswer(data.answer);
      setSources(data.sources ?? []);
    } finally {
      setAnswering(false);
    }
  }, [apiClient]);

  return { ask, answering, answer, sources };
}
