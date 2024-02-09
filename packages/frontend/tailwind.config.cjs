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
        'emerald': '#50C878',
        'gold': '#FFD700',
        'charcoal': '#333333',
        'blue-light': '#02D7F2',
        'blue': '#007AFF',
        'teal': '#42EFF8',
        'burgundy-saturated': '#430E18',
        'burgundy-dark': '#2A0A11',
        'burgundy-black': '#110E15',
        'burgundy-gray': '#211720',
        'burgundy-mute': '#411D2B',
        'hotpink': '#F20089',
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
