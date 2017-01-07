var Benchmark = require('benchmark');
let LSystem = require('../dist/lindenmayer.js');
var suite = new Benchmark.Suite();

let lsys1 = new LSystem({
  axiom: 'FF',
  productions: {
    'F': 'FFF'
  }
});

let lsys2 = new LSystem({
  axiom: [{symbol: 'F'}, {symbol: 'F'}],
  productions: {
    'F': [{symbol: 'F'}, {symbol: 'F'}, {symbol: 'F'}]
  }
});

let lsys3 = new LSystem({
  axiom: [{symbol: 'F'}, {symbol: 'F'}],
  productions: {
    'F': () => [{symbol: 'F'}, {symbol: 'F'}, {symbol: 'F'}]
  }
});




// add tests
suite.add('strings', function() {
  lsys1.setAxiom('FF');
  lsys1.iterate(7);
}).add('objects', function() {
  lsys2.setAxiom([{symbol: 'F'}, {symbol: 'F'}]);
  lsys2.iterate(7);
})
.add('functions', function() {
  lsys3.setAxiom([{symbol: 'F'}, {symbol: 'F'}]);
  lsys3.iterate(7);
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
