/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#0b1220',
          800: '#111827',
          700: '#1f2937',
        },
        sand: {
          50: '#fffaf4',
          100: '#fdf0e6',
          200: '#f7dfcc',
          300: '#f1cbb0',
          400: '#e3b18b',
          500: '#c9926a',
          600: '#ad7450',
          700: '#8e5c3e',
          800: '#744a34',
          900: '#5a3a2a',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
    },
  },
  plugins: [],
}
