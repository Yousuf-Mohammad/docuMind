'use client';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  className?: string;
}

export function ChatMessage({ role, content, className = '' }: ChatMessageProps) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <p
        className={`font-mono text-xs leading-relaxed text-ink-dim ${className}`}
      >
        <span className="text-gold">?</span> {content}
      </p>
    );
  }

  // Assistant answers are typeset — the "document" voice
  return (
    <p
      className={`whitespace-pre-wrap font-serif text-[1.15rem] leading-[1.7] text-ink ${className}`}
    >
      {content}
    </p>
  );
}
