import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/frontend/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F5F5F3',
          card: '#FFFFFF',
          imgBg: '#EEEEEC',
          imgBgDark: '#E4E4E0',
          accent: '#9FD842',
          accentHover: '#8EC731',
          accentLight: '#F3FCDA',
          accentDark: '#709E1E',
          dark: '#171717',
          darkMuted: '#777777',
          lightMuted: '#A0A0A0',
          border: '#E8E8E5',
          borderSubtle: 'rgba(0, 0, 0, 0.05)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        manrope: ['Manrope', '"Plus Jakarta Sans"', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        'neu-card': '0 8px 24px -4px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'neu-card-hover': '0 16px 36px -6px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'neu-search': '0 6px 20px -2px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
        'neu-btn-accent': '0 8px 20px -3px rgba(159, 216, 66, 0.4)',
        'neu-btn-dark': '0 8px 20px -3px rgba(23, 23, 23, 0.25)',
        'glass-nav': '0 12px 32px -4px rgba(0, 0, 0, 0.05)',
        'glass-pill': '0 4px 16px -2px rgba(0, 0, 0, 0.04)',
        'glass-modal': '0 24px 60px -10px rgba(0, 0, 0, 0.15)',
        'float-bottom': '0 -4px 28px -4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'sm-control': '14px',
        'btn': '18px',
        'card': '26px',
        'card-lg': '30px',
        'img': '26px',
        'container': '32px',
        'pill': '9999px',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4.5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.92', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        shopeaseTheme: {
          "primary": "#9FD842",
          "primary-content": "#171717",
          "secondary": "#171717",
          "secondary-content": "#FFFFFF",
          "accent": "#9FD842",
          "neutral": "#171717",
          "base-100": "#FFFFFF",
          "base-200": "#EEEEEC",
          "base-300": "#F5F5F3",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
    base: false,
    styled: true,
    utils: true,
  },
}
