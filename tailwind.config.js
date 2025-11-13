// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        jockey: ['"Jockey One"', 'sans-serif'],
        lilita: ['"Lilita One"', 'cursive'],
        caveat: ['"Caveat"', 'cursive'],
        roboto: ['"Roboto"', 'sans-serif'],
        condensed: ['"Roboto Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
