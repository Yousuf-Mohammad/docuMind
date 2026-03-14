'use client';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  className?: string;
}

export function ChatMessage({ role, content, className = '' }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <div
      className={`rounded-lg px-4 py-3 ${
        isUser
          ? 'bg-primary/10 text-foreground ml-auto max-w-[85%]'
          : 'bg-zinc-800/50 text-foreground mr-auto max-w-[85%]'
      } ${className}`}
    >
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
}
