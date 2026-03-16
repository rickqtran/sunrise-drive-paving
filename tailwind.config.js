/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sunrise: {
          50:  '#fff8ee',
          100: '#ffecd0',
          200: '#ffd49d',
          300: '#ffb560',
          400: '#ff9030',
          500: '#ff6e08',
          600: '#e85200',
          700: '#c13c02',
          800: '#992f0a',
          900: '#7c290c',
        },
        earth: {
          50:  '#f7f4ef',
          100: '#ece5d8',
          200: '#d8c9b0',
          300: '#bfa780',
          400: '#a98960',
          500: '#9a764e',
          600: '#846143',
          700: '#6b4d38',
          800: '#5a4132',
          900: '#4d382c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
