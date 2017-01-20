importScripts('marky.min.js', 'lindenmayer.js');

let n = 1;
let steps = 20;
let result;

let lsystems = {};

lsystems.lsys1 = new LSystem({
  axiom: 'FF',
  productions: {
    'F': 'FFF'
  }
});

lsystems.lsys2 = new LSystem({
  axiom: [{symbol: 'F'}, {symbol: 'F'}],
  productions: {
    'F': [{symbol: 'F'}, {symbol: 'F'}, {symbol: 'F'}]
  }
});

lsystems.lsys3 = new LSystem({
  axiom: [{symbol: 'F'}, {symbol: 'F'}],
  productions: {
    'F': () => [{symbol: 'F'}, {symbol: 'F'}, {symbol: 'F'}]
  }
});





marky.mark('objects');
for (let i = 0; i < n; i++) {
  lsystems.lsys2.setAxiom([{symbol: 'F'}, {symbol: 'F'}]);
  lsystems.lsys2.iterate(steps);
}
delete lsystems.lsys2;
result = marky.stop('objects');
console.log(result.name + ": " + result.duration);



marky.mark('strings');
for (let i = 0; i < n; i++) {
  lsystems.lsys1.setAxiom('FF');
  lsystems.lsys1.iterate(steps);
}
delete lsystems.lsys1;
result = marky.stop('strings');
console.log(result.name + ": " + result.duration);





marky.mark('functions');
for (let i = 0; i < n; i++) {
  lsystems.lsys3.setAxiom([{symbol: 'F'}, {symbol: 'F'}]);
  lsystems.lsys3.iterate(steps);
}
delete lsystems.lsys3;
result = marky.stop('functions');
console.log(result.name + ": " + result.duration);
