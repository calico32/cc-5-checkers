/* eslint-disable @typescript-eslint/no-var-requires */
// import type { SnowpackUserConfig } from 'snowpack';
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// export default <SnowpackUserConfig>{
/** @type {import('snowpack').SnowpackUserConfig} */
module.exports = {
  plugins: [
    // [
    //   '@snowpack/plugin-babel',
    //   {
    //     presets: ['@babel/preset-typescript', ['@babel/preset-env', { modules: false }]],
    //     plugins: ['@babel/plugin-proposal-class-properties'],
    //   },
    // ],
    '@snowpack/plugin-svelte',
    '@snowpack/plugin-typescript',
    './custom-dotenv.js',
    // 'rollup-plugin-svelte'
  ],
  mount: {
    public: '/',
    src: '/_dist_',
  },
  // scripts: {
  //   'run:tsc': 'tsc --noEmit',
  //   'run:tsc::watch': '$1 --watch',
  // },
  devOptions: {
    open: 'none',
    port: 8081,
  },
  buildOptions: {
    baseUrl: '/',
    clean: true,
    sourcemap: true,
  },
  packageOptions: {
    polyfillNode: true,
    sourcemap: true,
  },
  routes: [
    {
      match: 'routes',
      src: '/',
      dest: '/index.html',
    },
    {
      match: 'routes',
      src: '/#.+',
      dest: '/index.html',
    },
    {
      match: 'routes',
      src: '.+',
      dest: '/notfound.html',
    },
  ],
  optimize: {
    bundle: true,
    treeshake: true,
    minify: true,
    target: 'es2018',
  },
};
