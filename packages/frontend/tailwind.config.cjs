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
      fontFamily: {
        inter: ['Inter Tight', 'sans-serif'],
        archivo: ['Archivo Narrow', 'sans-serif'],
        julius: ['Julius Sans One', 'sans-serif'],
        barlow: ['Barlow', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'matte-black': '#28282B',
        'white': '#FFFFFF',
        'navy': '#001F3F',
        'burgundy': '#800020',
        'emerald': '#50C878',
        'gold': '#FFD700',
        'charcoal': '#333333',
        'teal': '#42EFF8',
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
