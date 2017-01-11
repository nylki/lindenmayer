import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'lindenmayer.js',
  format: 'cjs',
  plugins: [ babel() /*uglify()*/ ],
  targets: [
    { dest: 'dist/lindenmayer.js', format: 'cjs' },
    { dest: 'dist/lindenmayer.browser.js', format: 'iife' },
    { dest: 'dist/lindenmayer.es.js', format: 'es' },
  ],
  moduleName: 'LSystem'
};
