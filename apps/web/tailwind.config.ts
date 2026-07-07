import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        raised: 'var(--raised)',
        paper: 'var(--paper)',
        line: 'var(--line)',
        ink: {
          DEFAULT: 'var(--ink)',
          dim: 'var(--ink-dim)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          soft: 'var(--gold-soft)',
        },
        sage: 'var(--sage)',
        rust: 'var(--rust)',
        // legacy aliases so stray classes still resolve
        border: 'var(--line)',
        background: 'var(--bg)',
        foreground: 'var(--ink)',
        ring: 'var(--ring)',
      },
    },
  },
  plugins: [],
};

export default config;
