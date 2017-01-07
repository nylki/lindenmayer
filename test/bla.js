let LSystem = require('../dist/lindenmayer.js');
let axiom = [{symbol: 'F'}, {symbol: 'A'}, {symbol: 'F'}]


let lsystem = new LSystem({});
lsystem.setAxiom('F+F-F');
lsystem.setProduction('F', {successor: 'FF'});
lsystem.iterate(2);
console.log(lsystem.getString());


let lsys = new LSystem({
  forceObjects: true,
  axiom: 'FAF',
  productions: {
    'F': {condition: () => true, leftCtx: 'FA', successor: {symbol: 'X'}}
  }
});
lsys.iterate();
console.log(lsys.getString());

let lsys2 = new LSystem({
  allowClassicSyntax: true,
  axiom: 'ABCDEF',
  productions: {
    'AB<C>D': 'Z',
    'Z>DE': 'YZ'
  }
});

lsys2.iterate(2);
console.log(lsys2.getString());


let lsys3 = new LSystem({
  axiom: 'ABCDEF',
  productions: {
    'A': 'Z',
    'Z': 'ABC'
  }
});

lsys2.iterate(2);
console.log(lsys2.getString());

lsys3.iterate(2);
console.log(lsys3.getString());
