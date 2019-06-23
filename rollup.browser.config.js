import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

let minifyEnv = process.env.minify || false;

let output = [
  {
    file: minifyEnv ? 'dist/lindenmayer.browser.min.js' : 'dist/lindenmayer.browser.js',
    name: 'LSystem',
    format: 'iife'
  }
];

const babelConf = {
  babelrc: false,
  presets: [
    ['@babel/preset-env', {
      targets: {
        ie: 11
      },
      modules: false,
      loose: true
    }]
  ]
};
  
  
export default {
  input: 'lindenmayer.js',
  output,
  plugins: [
    babel(babelConf),
    minifyEnv ? terser({
      ecma: '5',
      mangle: {
        reserved: ['LSystem'],
        toplevel: true
      },
    }) : {} ],
    
};
