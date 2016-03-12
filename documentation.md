# Documentation

## Writing productions
Productions define how to transform your initial word, based on the individual letters.
When you set a production you have to specify which letter triggers the production.
The production itself can be specified in different ways:

### Strings
```.js
lsystem.setProduction('A', 'B')
// 'ABC' becomes 'BBC' after one iteration.

lsystem.setProduction('B', 'CDB')
// ABC becomes 'ACDBC' after one iteration
```

### Functions
You can write more compelx productions using JavaScript functions. I use [arrow functions]() to make the productions more concise.

```.js
lsystem.setProduction('A', () => 'B')
// transforms any A to B. This mimics the first example from above.

lsystem.setProduction('A', () => Math.random() < 0.25 ? 'B' : A)
// 'ABC' becomes 'BBC' with a chance of 25% after one iteration.

lsystem.setProduction('A', function(){ Math.random() < 0.25 ? 'B' : A })
//You could write the above with non-arrow function syntax
```

You also have always access to object that is being given to the production function: `{index, word, part, params}`.

- `word`: the whole current word
- `index`: the current index inside the word, the production is operating on

	```.js
	let lsys = new LSystem()
	lsys.setWord('ABABAAAAAABA')
	lsys.setProduction('B', ({index, word}) => (index < word.length/2) ? C : B])

	let result = lsys.iterate()
	// result === ACACAAAAAABA
	// The index is used to only change B's into C's if they are in the first half of the word
	```

- `part`: the part the production is currently working on. This is the letter most of the time, therefore not useful as you already know the letter. `part` will be useful for more complex operations, like parametric L-Systems, we will discuss later.

## Parametric L-System

**Important: You _must_ always provide `letter` to your custom parametric objects (that make up a word). Otherwise it won't be parsed properly, and in effect productions won't trigger.**

```.js
let lsys = new lsys.LSystem({
	word: [
		{letter: 'A', x:1, y:0.5},
		{letter: 'B', x:0, y:5},
		{letter: 'C', x:0, y:2, foo: 'bar'},
		{letter: 'C', x:0, y:2, foo: 'notbar'}
	],
	productions: [
		['A', ({part}) => (part.x===1) ? {letter: 'Z'} : part],
		['B', ({part}) => (part.y===5) ? {letter: 'Z'} : part],
		['C', ({part}) => (part.foo === 'bar') ? {letter: 'Z'} : part]
	]

	let result = lsys.iterate()
	/* result === [
		{ letter: 'A' },
  	{ letter: 'B' },
  	{ letter: 'C', params: [ 3 ] },
  	{ letter: 'D', params: [ 23, 42, 5 ] },
  	{ letter: 'E' },
  	{ letter: 'F' },
  	{ letter: 'G', mehh: 'foo' }
	]
	*/

	result = lsys.getString()
	// result === ABCDEFG
	```
