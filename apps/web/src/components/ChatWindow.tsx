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
    <div className={`rounded-xl border border-border bg-zinc-900/50 p-6 space-y-4 ${className}`}>
      <h2 className="text-lg font-semibold">Ask a question</h2>
      <ChatInput onSend={onAsk} disabled={answering} />
      {answer && (
        <div className="space-y-2">
          <ChatMessage role="assistant" content={answer} />
          <SourceList sources={sources} />
        </div>
      )}
    </div>
  );
}
