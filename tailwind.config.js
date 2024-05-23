/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Jaldi', 'sans-serif'] 
      }
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'white': '#FFFFFF',
      'pink': '#CCC9DC',
      'red': '#C53E3A',
      'navy': {
        900: '#0C1821',
        700: '#1B2A41',
        500: '#324A5F',
      },  
    }
  },
  plugins: [],
}