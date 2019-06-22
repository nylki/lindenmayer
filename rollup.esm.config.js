import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
let minifyEnv = process.env.minify || false;

const babelConf = {
  babelrc: false,
  presets: [
    ['@babel/preset-env', {
      targets: {
        chrome: 60,
        firefox: 58,
        safari: 11,
      },
      modules: false,
      loose: true
    }]
  ]
};
  
  
export default {
  input: 'lindenmayer.js',
  output: [
    {
      file: minifyEnv ? 'dist/lindenmayer.esm.min.js' : 'dist/lindenmayer.esm.js',
      format: 'esm'
    }
  ],
  plugins: [
    babel(babelConf),
    minifyEnv ? terser({
      module: true,
      mangle: {
        reserved: ['LSystem'],
        toplevel: true
      },
      ie8: false
    }) : {}
  ],
    
};
