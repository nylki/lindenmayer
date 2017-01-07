let LSystem = require('../dist/lindenmayer.js');

function SimpleTreeSystem(params) {
  LSystem.call(this, params);
  this.superIterate = this.iterate;
  this.iterate = iterations => this.superIterate(iterations || 7);
}

SimpleTreeSystem.prototype = Object.create(LSystem.prototype);
SimpleTreeSystem.prototype.constructor = SimpleTreeSystem;

let test = new SimpleTreeSystem({
  axiom: "F",
	productions: {
		"F": "FF"
	}
})

let test2 = new LSystem({
  axiom: "F",
	productions: {
		"F": "FF"
	}
})

test.setAxiom("F");
console.log(test.iterate()); // outputs FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
