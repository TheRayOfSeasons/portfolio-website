// eslint-disable-next-line import/no-extraneous-dependencies
const tailwindcss = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,njk,js}',
    './src/**/**/*.{html,njk,js}',
  ],
  theme: {
    screens: {
      xxxs: '320px',
      xxs: '425px',
      xs: '500px',
      ...tailwindcss.screens,
    },
    extend: {
      colors: {
        'matte-black': '#28282B',
        'gold': '#D4AF37',
        'white': '#F7F7F7',
        'teal': '#1C8EA4',
      },
      listStyleType: {
        roman: 'upper-roman',
        alpha: 'lower-alpha',
        lroman: 'lower-roman',
      },
    }
  },
  variants: {
    width: ['hover', 'focus'],
    extend: {},
  },
};
