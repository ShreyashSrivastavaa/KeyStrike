/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#06070a',
          900: '#0b0e14',
          800: '#151922',
          700: '#222938',
          600: '#323c50'
        },
        parry: {
          light: '#ff4d6d',
          DEFAULT: '#ef233c',
          dark: '#d90429'
        },
        break: {
          light: '#ffe169',
          DEFAULT: '#fad02c',
          dark: '#e0a905'
        },
        surge: {
          light: '#38bdf8',
          DEFAULT: '#0284c7',
          dark: '#0369a1'
        },
        counter: {
          DEFAULT: '#3b82f6',
          glow: '#60a5fa'
        }
      },
      fontFamily: {
        display: ['"Russo One"', '"Outfit"', 'system-ui', 'sans-serif'],
        typing: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        body: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'shake-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(2, 132, 199, 0.8))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 1))' },
        },
        'parry-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(239, 35, 60, 0.7), inset 0 0 15px rgba(239, 35, 60, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(239, 35, 60, 1), inset 0 0 25px rgba(239, 35, 60, 0.7)' },
        },
        'break-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(250, 208, 44, 0.7), inset 0 0 15px rgba(250, 208, 44, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(250, 208, 44, 1), inset 0 0 25px rgba(250, 208, 44, 0.7)' },
        }
      },
      animation: {
        'shake': 'shake-x 0.25s ease-in-out',
        'pulse-glow': 'pulse-glow 1.5s infinite',
        'parry-pulse': 'parry-pulse 0.8s infinite',
        'break-pulse': 'break-pulse 0.8s infinite',
      }
    },
  },
  plugins: [],
};
