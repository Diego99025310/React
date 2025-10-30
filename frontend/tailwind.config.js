/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#f0047f',
          purple: '#5a189a',
          black: '#0b0b0f',
          white: '#ffffff'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
