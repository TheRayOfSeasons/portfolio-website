import WebFont from 'webfontloader';

export const loadFonts = (config: WebFont.Config = {}) => {
  WebFont.load({
    google: {
      families: ['Inter Tight', 'Archivo Narrow', 'Julius Sans One', 'Barlow', 'Manrope', 'Bebas Neue', 'Montserrat:300,400,700'],
    },
    ...config,
  });
}
