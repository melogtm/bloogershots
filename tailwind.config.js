/** @type {import('tailwindcss').Config} */
export default {
  content: ["./views/*.ejs", "./views/partials/*.ejs"],
  theme: {
    extend: {
      colors: {
        'dark-coffee': '#8D7B68',
        'light-dark-coffee': '#A4907C',
        'lighter-dark-coffee': '#C8B6A6', 
        'lightest-coffee': '#F1DEC9'
      }
    },
  },
  plugins: [],
}

