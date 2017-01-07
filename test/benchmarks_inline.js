var Benchmark = require('benchmark');
let LSystem = require('../dist/lindenmayer.js');
var suite = new Benchmark.Suite();


let lsys1 = new LSystem({
  debug: true,
  inline: false,
  axiom: [{symbol: 'F'}, {symbol: 'F'}, {symbol: 'F'}],
  productions: {
    'F': {successor: [{symbol: 'F'}, {symbol: 'F'}], leftCtx: 'F', rightCtx: 'F', condition: () => true}
  }
});

let lsys2 = new LSystem({
  debug: true,
  inline: true,
  axiom: [{symbol: 'F'}, {symbol: 'F'}, {symbol: 'F'}],
  productions: {
    'F': {successor: [{symbol: 'F'}, {symbol: 'F'}], leftCtx: 'F', rightCtx: 'F', condition: () => true}
  }
});




// add tests
suite.add('individual function', function() {
  lsys1.setAxiom([{symbol: 'F'}, {symbol: 'F'}, {symbol: 'F'}]);
  lsys1.iterate(2000);

}).add('inline checks in loop', function() {
  lsys2.setAxiom([{symbol: 'F'}, {symbol: 'F'}, {symbol: 'F'}]);
  lsys2.iterate(2000);
})

// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });
