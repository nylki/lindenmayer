import babel from 'rollup-plugin-babel';
// import commonjs from 'rollup-plugin-commonjs';
// import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';

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
  // https://github.com/rollup/rollup-plugin-babel/issues/254#issuecomment-423799147
  // exclude: [/\/core-js\//],
  presets: [
    ['@babel/preset-env', {
      targets: {
        ie: 11
      },
      // useBuiltIns: 'entry',
      // corejs: {version: 3},
      modules: false,
      loose: true
    }]
  ]
};
  
  
export default {
  input: 'lindenmayer.js',
  output,
  plugins: [
  replace({
    include: 'polyfills/**',
    "__BUILD_FORMAT__": 'browser'
    }),
    
    // resolve({
    //   // only: [ 'core-js' ]
    // }),
    // commonjs({
    //   // non-CommonJS modules will be ignored, but you can also
    //   // specifically include/exclude files
    //   include: 'node_modules/**',  // Default: undefined
    //   // if false then skip sourceMap generation for CommonJS modules
    //   sourceMap: false,  // Default: true
    // }),
    babel(babelConf),
    minifyEnv ? terser({
      ecma: '5',
      mangle: {
        reserved: ['LSystem'],
        toplevel: true
      },
    }) : {} ],
    
};
