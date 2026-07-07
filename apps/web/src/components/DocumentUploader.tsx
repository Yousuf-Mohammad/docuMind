'use client';

import { useRef, useState } from 'react';
import { FileText, Loader2, Check } from 'lucide-react';
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
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (f: File): boolean => {
    setError(null);
    if (accept && !f.type.match(accept.replace('*', '.*'))) {
      setError('That is not a PDF. Pick a .pdf file to index.');
      setFile(null);
      return false;
    }
    if (maxSizeMb && f.size > maxSizeMb * 1024 * 1024) {
      setError(`Too large — keep it under ${maxSizeMb}MB.`);
      setFile(null);
      return false;
    }
    setFile(f);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    validate(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validate(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    try {
      await onUpload(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Try again.');
    }
  };

  const fmtSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <section aria-label="Upload document" className="space-y-3">
      <p className="eyebrow">01 · The source</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
          dragging
            ? 'border-gold bg-gold-soft'
            : 'border-line bg-raised/40 hover:border-gold/50'
        }`}
      >
        <FileText
          className={`h-6 w-6 transition-colors ${
            dragging ? 'text-gold' : 'text-ink-dim group-hover:text-gold/80'
          }`}
          strokeWidth={1.5}
        />
        {file ? (
          <p className="font-mono text-xs text-ink">
            {file.name}{' '}
            <span className="text-ink-dim">· {fmtSize(file.size)}</span>
          </p>
        ) : (
          <p className="text-sm text-ink-dim">
            Drop a PDF here, or{' '}
            <span className="text-gold underline decoration-gold/40 underline-offset-4">
              browse
            </span>
          </p>
        )}
        <p className="eyebrow !text-[0.625rem] opacity-70">
          PDF · up to {maxSizeMb}MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex min-h-[2.5rem] flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          {error && <p className="font-mono text-xs text-rust">{error}</p>}
          {!error && result && (
            <p className="flex items-center gap-2 font-mono text-xs text-sage">
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Indexed {result.filename} — {result.chunkCount} passages ready
            </p>
          )}
        </div>
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Indexing
            </>
          ) : (
            'Index document'
          )}
        </Button>
      </div>
    </section>
  );
}
