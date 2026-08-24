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
          purple: '#6257FF',
          violet: '#8B5CF6',
          pink: '#EC5AC8',
          lavender: '#F5F3FF',
          lavenderLight: '#FAF9FF',
          lavenderBorder: '#EAE6FD',
          dark: '#15152A',
          darkMuted: '#626276',
          darkFooter: '#121124',
          cardBg: '#FFFFFF',
          badgeBg: '#FFF0FB',
          badgeText: '#E639B0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(98, 87, 255, 0.08)',
        'soft-lg': '0 20px 50px -15px rgba(98, 87, 255, 0.12)',
        'card': '0 8px 30px rgba(98, 87, 255, 0.06)',
        'card-hover': '0 20px 40px rgba(98, 87, 255, 0.14)',
        'nav': '0 12px 36px rgba(98, 87, 255, 0.09)',
        'glow-purple': '0 0 40px rgba(98, 87, 255, 0.35)',
        'glow-pink': '0 0 40px rgba(236, 90, 200, 0.35)',
        'btn': '0 10px 25px -5px rgba(98, 87, 255, 0.4)',
      },
      borderRadius: {
        'card': '20px',
        'container': '28px',
        'pill': '9999px',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4.5s ease-in-out infinite',
        'float-fast': 'float 3.5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
}
