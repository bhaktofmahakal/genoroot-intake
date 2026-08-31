import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F8F6F0',
          muted: '#F0ECE2',
        },
        surface: {
          card: '#FFFFFF',
          hover: '#FDFCFB',
          subtle: '#F1EDE4',
          tint: {
            sage: '#E7EFEA',
            warm: '#F9EBE7',
          },
        },
        green: {
          deep: '#1E3932',
          primary: '#2D4F3E',
          accent: '#3E6B54',
          soft: '#D4E9E2',
        },
        terracotta: {
          DEFAULT: '#BA5D3F',
          dark: '#9E4A30',
          pulse: 'rgba(186, 93, 63, 0.22)',
        },
        ink: {
          primary: '#1A2621',
          secondary: '#42544B',
          muted: '#66786F',
          inverse: '#FFFFFF',
        },
        border: {
          hairline: '#D6D1C4',
          active: '#2D4F3E',
          subtle: '#E8E4D9',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 6px rgba(26, 38, 33, 0.04), 0 1px 2px rgba(26, 38, 33, 0.02)',
        active: '0 4px 12px rgba(45, 79, 62, 0.10)',
        sticky: '0 -4px 16px rgba(26, 38, 33, 0.06)',
      },
      borderRadius: {
        card: '14px',
        section: '20px',
      },
      keyframes: {
        'organic-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.08)', opacity: '0.4' },
        },
        'wave-bar': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        },
      },
      animation: {
        'organic-pulse': 'organic-pulse 1.4s ease-in-out infinite',
        'wave-bar': 'wave-bar 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
