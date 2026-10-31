/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d1f',
          900: '#0a1533',
          850: '#0e1c45',
          800: '#142558',
          700: '#1e3477',
          600: '#2b479e',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        }
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(45, 212, 191, 0.25)',
        'glow-blue': '0 0 20px -3px rgba(34, 211, 238, 0.25)',
      }
    },
  },
  plugins: [],
}
