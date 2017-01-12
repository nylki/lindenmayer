let LSystem = require('../dist/lindenmayer.js');

let lsystem = new LSystem({
	axiom: 'XY',
	productions: {
		'X': {
			successors: [
				{weight: 1, successor: 'AX'},
				{weight: 1, successor: 'BX'},
				{weight: 1, successor: 'CX'}
			]
		},
		'Y': {
			successors: [
				{weight: 10, successor: 'LY'},
				{weight: 100, successor: 'MY'},
				{weight: 890, successor: 'HY'}
			]
		},
	}
});

let result = lsystem.iterate(10000);
// console.log(result);

// Count chars
let chars = new Map();
for (let symbol of result) {
	if(chars.has(symbol) === false) chars.set(symbol, 1);
	chars.set(symbol, chars.get(symbol) + 1);
}

console.log(chars);
