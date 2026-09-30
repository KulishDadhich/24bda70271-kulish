/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f0',
          100: '#ffe8dc',
          200: '#ffd0b8',
          300: '#ffad8a',
          400: '#ff7a4d',
          500: '#ff4b1f', // Primary Vibrant Red-Orange
          600: '#f03107',
          700: '#c72204',
          800: '#9e1e0a',
          900: '#7f1d0e',
          glow: '#ff5e3a',
          accent: '#ff9900',
        },
        dark: {
          950: '#07090E', // Deepest background
          900: '#0D111A', // Main dark background
          850: '#131826', // Glass card base
          800: '#1B2236', // Elevated card
          700: '#27324E', // Borders & separators
          600: '#3D4D75',
          500: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(255, 75, 31, 0.25)',
        'glow-md': '0 0 25px rgba(255, 75, 31, 0.4)',
        'glow-lg': '0 0 40px rgba(255, 75, 31, 0.55)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 10px rgba(255,75,31,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(255,75,31,0.8))' },
        },
      },
    },
  },
  plugins: [],
}
