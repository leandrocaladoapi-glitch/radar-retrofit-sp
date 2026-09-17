import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        muted: 'var(--muted)',
        fg: {
          DEFAULT: 'var(--fg)',
          muted: 'var(--fg-muted)',
          subtle: 'var(--fg-subtle)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          fg: 'var(--accent-fg)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          fg: 'var(--gold-fg)',
          muted: 'var(--gold-muted)',
        },
        success: {
          DEFAULT: 'var(--success)',
          fg: 'var(--success-fg)',
          muted: 'var(--success-muted)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          fg: 'var(--warning-fg)',
          muted: 'var(--warning-muted)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          fg: 'var(--danger-fg)',
          muted: 'var(--danger-muted)',
        },
        info: {
          DEFAULT: 'var(--info)',
          fg: 'var(--info-fg)',
          muted: 'var(--info-muted)',
        },
        purple: {
          DEFAULT: 'var(--purple)',
          fg: 'var(--purple-fg)',
          muted: 'var(--purple-muted)',
        },
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '600' }],
        'title': ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '600' }],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
      transitionDuration: {
        150: '150ms',
        180: '180ms',
        200: '200ms',
        250: '250ms',
        300: '300ms',
      },
      transitionTimingFunction: {
        radar: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'radar-pulse': {
          '0%': { transform: 'scale(0.6)', opacity: '0.55' },
          '70%': { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'radar-pulse': 'radar-pulse 2.8s ease-out infinite',
        'fade-up': 'fade-up 400ms var(--ease) both',
      },
    },
  },
  plugins: [],
}

export default config
