import { useState, useCallback } from 'react';
import type { UploadResult } from '@documind/shared/types';
import { defaultApiClient } from './api-client';

export function useUpload(apiClient = defaultApiClient) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setResult(null);
    try {
      const data = await apiClient.uploadPdf(file);
      setResult(data);
    } finally {
      setUploading(false);
    }
  }, [apiClient]);

  return { upload, uploading, result };
}
