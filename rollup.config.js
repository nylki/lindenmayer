import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';

let minifyEnv = process.env.minify || false;

export default {
  entry: 'lindenmayer.js',
  format: 'cjs',
  plugins: [ babel(), minifyEnv ? uglify({}, minify) : {} ],
  targets: [
    { dest: minifyEnv ? 'dist/lindenmayer.min.js' : 'dist/lindenmayer.js', format: 'cjs' },
    { dest: minifyEnv ? 'dist/lindenmayer.browser.min.js' : 'dist/lindenmayer.browser.js', format: 'iife' },
    { dest: minifyEnv ? 'dist/lindenmayer.es.min.js' : 'dist/lindenmayer.es.js', format: 'es' },
  ],
  moduleName: 'LSystem'
};
