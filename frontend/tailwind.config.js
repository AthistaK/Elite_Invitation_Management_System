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
          50: '#F0F7FF',
          100: '#E0EFFE',
          200: '#BAE0FD',
          300: '#7CC8FB',
          400: '#36A9F7',
          500: '#0C8BE7',
          600: '#006DC8',
          700: '#1E40AF', // Royal Blue
          800: '#1E3A8A', // Executive Navy
          900: '#0F172A', // Deep Navy
        },
      },
    },
  },
  plugins: [],
}
