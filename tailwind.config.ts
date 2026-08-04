import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FBFAF6',
          sunken: '#F3F1EA',
          raised: '#FFFFFF',
        },
        line: {
          DEFAULT: '#E5E1D6',
          strong: '#D0CABA',
          dark: '#1D4536',
        },
        ink: {
          DEFAULT: '#141F1A',
          muted: '#4C5A53',
          soft: '#78867D',
        },
        forest: {
          950: '#07231B',
          900: '#0A2E24',
          800: '#0E3E30',
          700: '#12513E',
          600: '#186A51',
          500: '#218A69',
          300: '#8CC3AB',
          100: '#DCEEE5',
        },
        brass: {
          700: '#7A5F16',
          600: '#9C7B1F',
          500: '#BC9730',
          400: '#D9B85C',
          100: '#F4EACB',
          50: '#FAF5E6',
        },
        clay: {
          700: '#8C3421',
          600: '#A9412A',
          100: '#F7E4DE',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 31, 26, 0.04), 0 8px 24px -18px rgba(20, 31, 26, 0.25)',
        lift: '0 2px 4px rgba(20, 31, 26, 0.05), 0 18px 40px -24px rgba(20, 31, 26, 0.35)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      maxWidth: {
        prose: '68ch',
      },
      keyframes: {
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        rise: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fade: 'fade .18s ease-out',
        rise: 'rise .22s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
