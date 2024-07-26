/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'main-color': '#333',
        'btn-main': '#00CDFF'
      }
    },
  },
  plugins: [],
};
