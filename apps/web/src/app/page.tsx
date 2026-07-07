'use client';

import { DocumentUploader } from '@/components/DocumentUploader';
import { ChatWindow } from '@/components/ChatWindow';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useUpload } from '@/lib/useUpload';
import { useAsk } from '@/lib/useAsk';

export default function Home() {
  const { upload, uploading, result } = useUpload();
  const { ask, answering, answer, sources } = useAsk();

  const hasAnswered = Boolean(answer) || answering;

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-medium tracking-tight text-ink">
            Docu<span className="text-gold">Mind</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="eyebrow hidden sm:block">
              {result ? `${result.chunkCount} passages indexed` : 'Retrieval-augmented reading'}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28 pt-12 sm:pt-16">
        {/* Hero thesis — retires once a conversation begins */}
        {!hasAnswered && (
          <section className="rise mb-14 space-y-5">
            <p className="eyebrow">Grounded, not guessed</p>
            <h1 className="font-display text-4xl font-normal leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Every answer, traced back
              <br />
              to the{' '}
              <em className="font-medium italic text-gold">page it came from.</em>
            </h1>
            <p className="max-w-xl font-serif text-lg leading-relaxed text-ink-dim">
              Upload a PDF and ask. DocuMind retrieves the passages that matter and
              answers only from what&apos;s on the page — with the sources to prove it.
            </p>
          </section>
        )}

        <div className="space-y-12">
          <DocumentUploader onUpload={upload} uploading={uploading} result={result} />

          <div className="h-px w-full bg-line" />

          <ChatWindow
            onAsk={ask}
            answering={answering}
            answer={answer}
            sources={sources}
          />
        </div>
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-10">
        <p className="eyebrow !text-[0.625rem] opacity-60">
          Answers grounded in your documents · retrieval-augmented generation
        </p>
      </footer>
    </div>
  );
}
