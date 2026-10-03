/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        narrow: ['"Arial Narrow"', 'sans-serif'],
      },
      colors: {
        pwd: {
          blue: '#002060',
          header: '#d9e1f2',
          section: '#f2f2f2',
          total: '#fff2cc',
          grand: '#ddebf7',
        }
      }
    },
  },
  plugins: [],
}
