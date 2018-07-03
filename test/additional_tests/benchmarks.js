var Benchmark = require('benchmark');
let LSystem = require('../../dist/lindenmayer.js');
var suite = new Benchmark.Suite();

let lsys1 = new LSystem({
  axiom: 'FF',
  productions: {
    'F': 'FFF'
  }
});

let lsys1b = new LSystem({
  forceObjects: true,
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
const n = 10;
suite.add('strings', function() {
  lsys1.setAxiom('FF');
  lsys1.iterate(n);
}).add('strings transformed to objects', function() {
  lsys1b.setAxiom('FF');
  lsys1b.iterate(n);
}).add('objects', function() {
  lsys2.setAxiom([{symbol: 'F'}, {symbol: 'F'}]);
  lsys2.iterate(n);
})
.add('functions', function() {
  lsys3.setAxiom([{symbol: 'F'}, {symbol: 'F'}]);
  lsys3.iterate(n);
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
