# Lindenmayer [![Build Status](https://travis-ci.org/nylki/lindenmayer.svg?branch=master)](https://travis-ci.org/nylki/lindenmayer)

Lindenmayer is  a [L-System](https://en.wikipedia.org/wiki/L-system) library using modern (ES6) JavaScript with focus on a concise syntax. The idea is to have a very powerful but simple base functionality, that can handle most use-cases by simply allowing anonymous functions as productions, which makes it very flexible in comparison to classic L-Systems.

The library can also parse (to some extend) classic L-System syntax as defined in Lindenmayers original work *Algorithmic Beauty of Plant* from 1990. (for example branches: `[]` or context sensitive productions: `<>`).
Most stuff should work. I am currently working on parametric L-System support.

**Right now it's under heavy development, so features and names are subject to change.
I will remove this warning when I consider this library stable.**
**Better docs and more examples are coming soon** :)

## Examples
-  [codepen collection (editable!)](https://codepen.io/collection/AVvqeg/)
-  [Interactive L-System builder](http://nylki.github.io/lindenmayer/examples/webworker)

## Basic Usage

```.js
// Initializing a L-System that produces the Koch-curve
let kochcurve = new LSystem({
      word: 'F++F++F',
      productions: {'F': 'F-F++F-F'}
})
// Iterate the L-System two times and log the result.
let result = kochcurve.iterate(2)
console.log(result)
//'F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F'
```

There are multiple way to set productions, including javascript functions:

```.js
let lsys = new LSystem()
lsys.setWord('ABC')

// simple production, using ES6 arrow function
lsys.setProduction('B', () => 'F+F')

// or same with just the String, both works
lsys.setProduction('B', 'F+F')

// simple stochastic production, producing `+F` with 10% probability, `FB+B` with 90%
myLSys.setProduction('B', () => (Math.random() < 0.1) ? 'F' : 'B')

// simple context sensitive production rule, replacing `B` with `Z` if previous character is a A and next character is 'C'
lsys.setProduction('B',
  ({index, word}) => (word[index-1] === 'A') && (word[index+1] === 'C') ? 'Z' : 'B'
)

// or if you prefer the concise *classic* syntax for context sensitive productions:
lsys.setProduction('A<B>C', 'Z')
```

### initializing

You can init a L-System object with the `new` keyword:
```.js
new LSystem(options)
```

`options` may contain:
- `word`: A `String` or an `Array` of `Objects` to set the initial word (or Axiom). 
- `productions`: key-value `Object` to set the productions from one symbol to its word.
- `finals`: key-value `Object` to set `Functions` for one symbol to be executed sequentially on calling `final()`.
- `branchSymbols`: A `String` of two characters. Only used when working with classic context sensitive L-System syntax (eg.: `"A<B>CE"` ) or using the `match()` function when defining own productions or final functions. The first symbol is treated as start of a branch, the last symbol as end of a branch. (default: `"[]"`, but only when using classic CS syntax)
- `ignoredSymbols`: A `String` of characters to ignore when using context sensitive productions (via classic syntax, or by calling `match()`). (default: `"+-&^/|\\"`, but only using classic CS syntax)
- `classicParametricSyntax`: A `Bool` to enable *experimental* parsing of parametric L-Systems as defined in Lindenmayers book *Algorithmic Beauty of Plants*. (default: `false`)

Most often you will find yourself only setting `word`, `productions` and `finals`.

```.js
// Initialize L-System with multiple productions
let lsystem = new LSystem({
      word: 'ABC',
      productions: {
        'A': 'A+',
        'B': 'BA',
        'C': 'ABC'
      }
})
```

It's also possible to use functions as productions (useful for **stochasic** L-Systems):

```.js
let lsys = new LSystem({
      word: 'F++F++F',
      productions: {'F': () => (Math.random() < 0.7) ? 'F-F++F-F' : 'F+F'}
})

// Productions can be changed later:
lsys.setProduction('F', () => (Math.random() < 0.2) ? 'F-F++F-F' : 'F+F')
```

You could also start with an empty L-System object, and use `setWord()` and `setProduction()` to edit the L-System later:

```.js
let lsys = new LSystem()
lsys.setWord('ABC')
lsys.setProduction('A', 'AAB')
lsys.setProduction('B', 'CB')
// Then iterate:
console.log(lsys.iterate())
```

This can be useful if you want to dynamically generate and edit L-Systems. For example, you might have a UI, where the user can add new production via a text box.

### iterating
Now that we have set up our L-System set, we want to generate new words with `iterate()`:

```.js
// Iterate once
lsys.iterate();

// Iterate n-times
lsys.iterate(5);
```

### Getting Results
`iterate()` conveniently returns the resulting string:

```.js
console.log(lsys.iterate())
```

If you want to fetch the result later, use `getString()`:

```.js
lsys.iterate()
console.log(lsys.getString())
```


### Final functions: Visualization and other post processing

Most likely you want to visualize or post-process your L-Systems output in some way.
You could iterate and parse the result yourself, however `lindemayer` already offers an easy way to define
such postprocessing: *final* functions. In those final functions you can define what should be done for each literal/character. The classic way to use L-Systems is to visualize words with [turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics).
The standard rules, found in Aristid Lindenmayer's and Przemyslaw Prusinkiewicz's classic work [Algorithmic Beauty of Plants](http://algorithmicbotany.org/papers/#abop) can be easily implented this way, to output the fractals onto a [HTML Canvas element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API):

```.html
<body>
	<canvas id="canvas" width="1000" height="1000"></canvas>
</body>

```

```.js

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext("2d")

// translate to center of canvas
ctx.translate(canvas.width/2, canvas/2)

// initialize a koch curve L-System that uses final functions
// to draw the fractal onto a Canvas element.
// F: draw a line with length relative to the current iteration (half the previous length for each step)
//    and translates the current position to the end of the line
// +: rotates the canvas 60 degree
// -: rotates the canvas -60 degree

var koch = new LSystem({
  word: 'F++F++F',
  productions: {'F': 'F-F++F-F'},
  finals: [
    ['+', () => { ctx.rotate((Math.PI/180) * 60) }],
    ['-', () => { ctx.rotate((Math.PI/180) * -60) }],
    ['F', () => {
      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(0, 50/(koch.iterations + 1))
      ctx.stroke()
      ctx.translate(0, 50/(koch.iterations + 1))}
     ]
   ]
})

koch.iterate(3)
koch.final()
```
