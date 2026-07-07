'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'What does the document say about…',
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    await onSend(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-lg border border-line bg-raised px-2 py-2 transition-colors focus-within:border-gold/60"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent px-3 py-1.5 text-[0.95rem] text-ink placeholder:text-ink-dim/70 focus:outline-none disabled:opacity-50"
      />
      <Button type="submit" size="sm" disabled={disabled || !value.trim()}>
        {disabled ? 'Asking' : 'Ask'}
      </Button>
    </form>
  );
}
