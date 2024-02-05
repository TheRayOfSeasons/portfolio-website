import WebFont from 'webfontloader';

export const loadFonts = (config: WebFont.Config = {}) => {
  WebFont.load({
    google: {
      families: ['Inter Tight', 'Archivo Narrow', 'Julius Sans One'],
    },
    ...config,
  });
}
