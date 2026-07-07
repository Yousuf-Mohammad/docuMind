'use client';

import type { RAGSource } from '@documind/shared/types';

export interface SourceListProps {
  sources: RAGSource[];
  maxPreviewLength?: number;
  className?: string;
}

export function SourceList({
  sources,
  maxPreviewLength = 240,
  className = '',
}: SourceListProps) {
  if (sources.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="eyebrow">
        Sources · {sources.length} passage{sources.length === 1 ? '' : 's'}
      </p>
      <ul className="space-y-2.5">
        {sources.map((s, i) => (
          <li
            key={i}
            className="rise flex gap-3 rounded-r-md border-l-2 border-gold bg-gold-soft px-4 py-3"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="mt-0.5 shrink-0 font-mono text-[0.6875rem] font-semibold text-gold">
              S{i + 1}
            </span>
            <p className="text-sm leading-relaxed text-ink/85">
              {s.content.slice(0, maxPreviewLength)}
              {s.content.length > maxPreviewLength ? '…' : ''}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
