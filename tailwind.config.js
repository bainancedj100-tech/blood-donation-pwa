/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fdf2f2',
          100: '#fbe4e4',
          200: '#f8caca',
          300: '#f3a4a4',
          400: '#eb7575',
          500: '#e04646',
          600: '#cd2e2e',
          700: '#ab2222',
          800: '#8f2020',
          900: '#772121',
          950: '#400e0e',
        }
      }
    },
  },
  plugins: [],
}
