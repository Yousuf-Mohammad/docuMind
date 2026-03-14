'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UploadResult } from '@documind/shared/types';

export interface DocumentUploaderProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  result: UploadResult | null;
  accept?: string;
  maxSizeMb?: number;
}

export function DocumentUploader({
  onUpload,
  uploading,
  result,
  accept = 'application/pdf',
  maxSizeMb = 20,
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (accept && !f.type.match(accept.replace('*', '.*'))) {
      setError('Please select a PDF file.');
      setFile(null);
      return;
    }
    if (maxSizeMb && f.size > maxSizeMb * 1024 * 1024) {
      setError(`File must be under ${maxSizeMb}MB.`);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    try {
      await onUpload(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  return (
    <div className="rounded-xl border border-border bg-zinc-900/50 p-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload document
      </h2>
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium"
        />
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <p className="text-sm text-green-500">
          Uploaded {result.filename} ({result.chunkCount} chunks)
        </p>
      )}
    </div>
  );
}
