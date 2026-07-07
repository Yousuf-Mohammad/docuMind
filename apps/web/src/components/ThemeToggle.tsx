'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Read the theme the pre-paint script already applied.
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'light' : 'dark');
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('documind-theme', next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    setTheme(next);
  };

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Switch to night reading' : 'Switch to daytime paper'}
      aria-pressed={isLight}
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-raised/60 px-2.5 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-dim transition-colors hover:border-gold/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      // Avoid a hydration mismatch: render inert until the client resolves the theme.
      suppressHydrationWarning
    >
      {theme === null ? (
        <span className="h-3.5 w-3.5" />
      ) : isLight ? (
        <Sun className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
      ) : (
        <Moon className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
      )}
      <span className="hidden sm:inline">{isLight ? 'Day' : 'Night'}</span>
    </button>
  );
}
