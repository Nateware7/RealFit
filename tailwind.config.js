/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    extend: {
      fontFamily:{
        title:["Poppins"]
      },
    },
  },
  plugins: [require('daisyui')],
}