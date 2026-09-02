/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        dark: {
          800: '#1f2937',
          900: '#101820',
          950: '#080d12',
        },
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 70% 48% at 50% -15%, rgba(45, 212, 191, 0.18), transparent)',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(16, 185, 129, 0.4)',
        'glow-sm': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [],
}
