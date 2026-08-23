import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F1115',
          card: '#1A1D24',
          hover: '#242830',
          muted: '#15181E',
        },
        brand: '#6C8CFF',
        success: '#4ECB71',
        error: '#F87171',
        text: {
          primary: '#E8EAED',
          secondary: '#B4B8C0',
          muted: '#7A7F8A',
          faint: '#4E535C',
        },
        border: {
          DEFAULT: '#2E333D',
          light: '#242830',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-sm': '0 2px 12px rgba(0, 0, 0, 0.3)',
        'brand': '0 0 0 3px rgba(108, 140, 255, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
