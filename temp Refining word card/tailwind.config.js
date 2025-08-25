/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jungle-green': '#2e7d32',
        'jungle-light': '#60ad5e',
        'jungle-dark': '#005005',
        'sunshine': '#ffc107',
        'sunshine-light': '#fff350',
        'sunshine-dark': '#c79100',
        'water': '#29b6f6',
        'water-light': '#73e8ff',
        'water-dark': '#0086c3',
        'earth': '#795548',
        'earth-light': '#a98274',
        'earth-dark': '#4b2c20',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'sway': 'sway 8s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'jungle-glow': 'jungle-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'mobile-slide-in': 'mobile-slide-in 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        'jungle-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(46, 125, 50, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(46, 125, 50, 0.8)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'mobile-slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

