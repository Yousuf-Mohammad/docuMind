'use client';

import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SourceList } from './SourceList';
import type { RAGSource } from '@documind/shared/types';

export interface ChatWindowProps {
  onAsk: (question: string) => Promise<void>;
  answering: boolean;
  answer: string | null;
  sources: RAGSource[];
  className?: string;
}

export function ChatWindow({
  onAsk,
  answering,
  answer,
  sources,
  className = '',
}: ChatWindowProps) {
  return (
    <section aria-label="Ask a question" className={`space-y-4 ${className}`}>
      <p className="eyebrow">02 · The question</p>

      <ChatInput onSend={onAsk} disabled={answering} />

      {answering && (
        <p className="flex items-center gap-2 font-mono text-xs text-ink-dim">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
          Retrieving passages and reading the page…
        </p>
      )}

      {!answering && answer && (
        <article className="rise space-y-6 rounded-lg border border-line bg-paper p-6 sm:p-8">
          <div className="space-y-3">
            <p className="eyebrow text-gold">Answer</p>
            <ChatMessage role="assistant" content={answer} />
          </div>
          {sources.length > 0 && (
            <div className="border-t border-line pt-5">
              <SourceList sources={sources} />
            </div>
          )}
        </article>
      )}
    </section>
  );
}
