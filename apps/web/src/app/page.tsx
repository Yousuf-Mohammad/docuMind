'use client';

import { DocumentUploader } from '@/components/DocumentUploader';
import { ChatWindow } from '@/components/ChatWindow';
import { useUpload } from '@/lib/useUpload';
import { useAsk } from '@/lib/useAsk';

export default function Home() {
  const { upload, uploading, result } = useUpload();
  const { ask, answering, answer, sources } = useAsk();

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">DocuMind AI</h1>
        <p className="text-muted-foreground">
          Upload PDFs and ask questions about your documents
        </p>
      </header>

      <DocumentUploader
        onUpload={upload}
        uploading={uploading}
        result={result}
      />

      <ChatWindow
        onAsk={ask}
        answering={answering}
        answer={answer}
        sources={sources}
      />
    </main>
  );
}
