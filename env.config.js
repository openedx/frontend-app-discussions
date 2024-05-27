module.exports = {
  PARAGON_THEME_URLS: {
    core: {
      urls: {
        default: 'https://cdn.jsdelivr.net/npm/@openedx/paragon@alpha/dist/core.min.css',
      },
    },
    defaults: {
      light: 'light',
      dark: 'dark',
    },
    variants: {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@openedx/paragon@alpha/dist/light.min.css',
        },
      },
      dark: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/brand-edx.org@alpha/dist/light.min.css',
        },
      },
    },
  },
};
