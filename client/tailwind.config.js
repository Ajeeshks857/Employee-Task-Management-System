/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#121214',
          surface: '#1a1b1e',
          header: '#1f2328',
          gold: '#d2b68a',
          goldLight: '#e4cfb0',
          goldDark: '#bda072',
          red: '#83282f',
          redHover: '#6e2127',
          gray: '#5a626a',
        },
      },
    },
  },
  plugins: [],
};
