/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        process: {
          ready: '#3b82f6',
          running: '#10b981',
          complete: '#6b7280',
          waiting: '#f59e0b',
        },
      },
      keyframes: {
        'move-to-cpu': {
          '0%': {
            transform: 'translateX(0) scale(1) rotate(0deg)',
            opacity: '1',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
          '25%': {
            transform: 'translateX(25%) scale(1.05) rotate(2deg)',
            opacity: '0.9',
            boxShadow: '0 10px 15px -3px rgba(251, 146, 60, 0.3)',
          },
          '75%': {
            transform: 'translateX(75%) scale(1.08) rotate(-1deg)',
            opacity: '0.9',
            boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
          },
          '100%': {
            transform: 'translateX(100%) scale(1) rotate(0deg)',
            opacity: '1',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
        'pulse-cpu': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 0 15px rgba(16, 185, 129, 0)',
            transform: 'scale(1.02)',
          },
        },
        'highlight-queue': {
          '0%, 100%': {
            backgroundColor: 'rgb(255, 255, 255)',
            transform: 'scale(1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
          '50%': {
            backgroundColor: 'rgb(219, 234, 254)',
            transform: 'scale(1.02)',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)',
          },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'move-to-cpu': 'move-to-cpu 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'pulse-cpu': 'pulse-cpu 2s infinite',
        'highlight-queue': 'highlight-queue 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      scale: {
        102: '1.02',
      },
    },
  },
  plugins: [],
}
