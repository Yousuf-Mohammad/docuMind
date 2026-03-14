'use client';

import type { RAGSource } from '@documind/shared/types';

export interface SourceListProps {
  sources: RAGSource[];
  maxPreviewLength?: number;
  className?: string;
}

export function SourceList({
  sources,
  maxPreviewLength = 160,
  className = '',
}: SourceListProps) {
  if (sources.length === 0) return null;

  return (
    <div className={`pt-2 border-t border-border ${className}`}>
      <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {sources.map((s, i) => (
          <li key={i} className="line-clamp-2">
            {s.content.slice(0, maxPreviewLength)}
            {s.content.length > maxPreviewLength ? '…' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
