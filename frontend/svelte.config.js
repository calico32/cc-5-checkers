/* eslint-disable @typescript-eslint/no-var-requires */
const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  preprocess: sveltePreprocess({
    scss: {
      includePaths: ['.'],
      renderSync: true,
    },
  }),
};