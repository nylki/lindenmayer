import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'lindenmayer.js',
  format: 'cjs',
  plugins: [ babel(), /*uglify()*/ ],
  dest: 'dist/lindenmayer.js',
  moduleName: 'LSystem'
};
