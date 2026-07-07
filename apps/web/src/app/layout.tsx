import type { Metadata } from 'next';
import { Fraunces, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Display — characterful serif for identity and the hero thesis
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '900'],
  style: ['normal', 'italic'],
});

// Reading — the content itself (answers, source excerpts) is typeset
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

// Apparatus — labels, markers, metadata, controls
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'DocuMind — grounded answers from your documents',
  description:
    'Upload a PDF and ask. DocuMind answers only from the page, with the sources to prove it.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${newsreader.variable} ${mono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
