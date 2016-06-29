# Lindenmayer [![Build Status](https://travis-ci.org/nylki/lindenmayer.svg?branch=master)](https://travis-ci.org/nylki/lindenmayer)

Lindenmayer is  a [L-System](https://en.wikipedia.org/wiki/L-system) library using modern (ES6) JavaScript with focus on a concise syntax. The idea is to have a very powerful but simple base functionality, that can handle most use-cases by simply allowing anonymous functions as productions, which makes it very flexible in comparison to classic L-Systems.

The library can also parse to some extent classic L-System syntax as defined in Aristid Lindenmayers original work *Algorithmic Beauty of Plants* from 1990. For example branches: `[]` or context sensitive productions: `<>`.
Most stuff should work. I am currently working on parametric L-System support.

**Better docs and more examples are coming soon** :)

## Examples
-  [codepen collection (editable!)](https://codepen.io/collection/AVvqeg/)
-  [Interactive L-System builder (2D turtle graphics)](http://nylki.github.io/lindenmayer/examples/webworker)
-  [Interactive L-System builder (3D turtle graphics)](http://nylki.github.io/lindenmayer/examples/webworker/index_3d.html)

[![3D Hilbert Curve rendered in Interactive L-System builder.](https://cloud.githubusercontent.com/assets/1710598/16453037/a9016230-3e0b-11e6-8268-762437de3c29.png)](http://nylki.github.io/lindenmayer/examples/webworker/index_3d.html)

## Install
### Direct download
- [Download `lindenmayer.js`](https://github.com/nylki/lindenmayer/releases/download/1.1.0/lindenmayer.js):
- Then in your `index.html`:

```.html
<script src="lindenmayer.js"></script>
```
### npm
```.sh
npm install --save lindenmayer
```

Then in your Node.js/browserify/… script:

```.js
var LSystem = require('lindenmayer');
```

Or in your `index.html`:

```.html
<script src="node_modules/lindenmayer/dist/lindenmayer.js"></script>
```


## Quick Intro

```.js
// Initializing a L-System that produces the Koch-curve
let kochcurve = new LSystem({
      axiom: 'F++F++F',
      productions: {'F': 'F-F++F-F'}
})
// Iterate the L-System two times and log the result.
let result = kochcurve.iterate(2)
console.log(result)
//'F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F'
```

There are multiple ways to set productions, including javascript functions:

```.js
let myLsys = new LSystem({
  axiom: 'ABC',
  /* Directly when initializing a new L-System object: */
  productions: { 'B': 'BB' }
})

// After initialization:
myLsys.setProduction('B', 'F+F')

// You can also use ES6 arrow functions (same result as above):
myLsys.setProduction('B', () => 'F+F')

// Simple stochastic production, producing `F` with 10% probability, `B` with 90%
myLSys.setProduction('B', () => (Math.random() < 0.1) ? 'F' : 'B')

// Simple context sensitive production rule, replacing `B` with `Z` if previous character is a A and next character is 'C'
myLsys.setProduction('B',
  ({index, currentAxiom}) => (currentAxiom[index-1] === 'A') && (currentAxiom[index+1] === 'C') ? 'Z' : 'B'
)

// or if you prefer the concise *classic* syntax for context sensitive productions:
myLsys.setProduction('A<B>C', 'Z')
```

# Documentation
## Initialization

You can init a L-System object with the `new` keyword:
```.js
let myCoolLSystem = new LSystem(options)
```

`options` may contain:
- `axiom`: A String or an Array of Objects to set the initial axiom (sometimes called axiom, start or initiator).
- `productions`: key-value Object to set the productions from one symbol to its axiom. Used when calling `iterate()`. A production can be either a String or a Function (see below.)
- `finals`: Optional key-value Object to set Functions be executed for each symbol in sequential order. Useful for visualization. Used when calling `final()`.

advanced options (see [API docs](not yet created) for details):

- `branchSymbols`: A String of two characters. Only used when working with classic context sensitive productions. The first symbol is treated as start of a branch, the last symbol as end of a branch. (default: `"[]"`, but only when using classic CS syntax)
- `ignoredSymbols`: A String of characters to ignore when using context sensitive productions. (default: `"+-&^/|\\"`, but only when using classic CS syntax)
- `classicParametricSyntax`: A Bool to enable *experimental* parsing of parametric L-Systems as defined in Lindenmayers book *Algorithmic Beauty of Plants*. (default: `false`)

Most often you will find yourself only setting `axiom`, `productions` and `finals`.

## Setting an Axiom
As seen in the first section you can simply set your axiom when you init your L-System.

```.js
let lsys = new LSystem({
      axiom: 'F++F++F'
})
```

You can also set an axiom after initialization:

```.js
let lsys = new LSystem({
      axiom: 'F++F++F'
})
lsys.setAxiom('F-F-F')
```


## Setting Productions
Productions define how the symbols of an axiom get transformed. For example, if you want all `A`s to be replaced by `B` in your axiom, you could construct the following production:
```.js
let lsystem = new LSystem({
  axiom: 'ABC',
  productions: {'A': 'B'}
})
//lsystem.iterate() === 'BBC'
```

You can set as many productions on initialization as you like:

```.js
let lsystem = new LSystem({
      axiom: 'ABC',
      productions: {
        'A': 'A+',
        'B': 'BA',
        'C': 'ABC'
      }
})
// lsystem.iterate() === 'A+BAABC'
```

You could also start with an empty L-System object, and use `setAxiom()` and `setProduction()` to edit the L-System later:

```.js
let lsys = new LSystem()
lsys.setAxiom('ABC')
lsys.setProduction('A', 'AAB')
lsys.setProduction('B', 'CB')
```

This can be useful if you want to dynamically generate and edit L-Systems. For example, you might have a UI, where the user can add new production via a text box.

A major feature of this library is the possibility to use functions as productions, which is especially useful for stochastic L-Systems:

```.js
// This L-System produces `F+` with a 70% probability and `F-` with 30% probability
let lsys = new LSystem({
      axiom: 'F++F++F',
      productions: {'F': () => (Math.random() <= 0.7) ? 'F+' : 'F-'}
})

// Productions can also be changed later:
lsys.setProduction('F', () => (Math.random() < 0.2) ? 'F-F++F-F' : 'F+F')
```

If you are using functions as productions, your function can make use of a number of additional parameters:

```.js
lsys.setAxiom('FFFFF')
lsys.setProduction('F', (parameters) => {
  // Use the `index` to determine where inside the current axiom, the function is applied on.
  if(parameters.index === 2) return 'X';
})
// lsys.iterate() === FFXFF
```

For a shorter notation you could use the ES6 feature of [object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring) (has support in most modern browsers):
```.js
lsys.setProduction('F', ({index, part}) => index === 2  ? 'X' : part);
```


**parameters**:
- `index`: the index inside the axiom
- `currentAxiom`: the current full axiom/word
- `part`: the current part (symbol or object) the production is applied on. This is especially useful if you are using parametric L-Systems (see last chapter) to have access to parameters of a symbol.



### Applying Productions
Now that we have set up our L-System set, we want to generate new axioms with `iterate()`:

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


### Putting it all together
#### Final functions: Visualization and other post processing

Most likely you want to visualize or post-process your L-Systems output in some way.
You could iterate and parse the result yourself, however `lindemayer` already offers an easy way to define
such postprocessing: *final* functions. In those final functions you can define what should be done for each literal/character. The classic way to use L-Systems is to visualize axioms with [turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics).
The standard rules, found in Aristid Lindenmayer's and Przemyslaw Prusinkiewicz's classic work [Algorithmic Beauty of Plants](http://algorithmicbotany.org/papers/#abop) can be easily implented this way, to output the fractals onto a [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).


You can fiddle with the following example in [this codepen](http://codepen.io/nylki/pen/QNYqzd)!
```.html
<body>
	<canvas id="canvas" width="1000" height="1000"></canvas>
</body>

```

```.js
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext("2d")

// translate to center of canvas
ctx.translate(canvas.width / 2, canvas.height / 4)

// initialize a koch curve L-System that uses final functions
// to draw the fractal onto a Canvas element.
// F: draw a line with length relative to the current iteration (half the previous length for each step)
//    and translates the current position to the end of the line
// +: rotates the canvas 60 degree
// -: rotates the canvas -60 degree

var koch = new LSystem({
  axiom: 'F++F++F',
  productions: {'F': 'F-F++F-F'},
  finals: {
    '+': () => { ctx.rotate((Math.PI/180) * 60) },
    '-': () => { ctx.rotate((Math.PI/180) * -60) },
    'F': () => {
      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(0, 40/(koch.iterations + 1))
      ctx.stroke()
      ctx.translate(0, 40/(koch.iterations + 1))}
   }
})

koch.iterate(3)
koch.final()
```

And the result:

[![Resulting image](https://cloud.githubusercontent.com/assets/1710598/15099304/09a530d6-1552-11e6-8261-fd302c5c89f6.png)](http://codepen.io/nylki/pen/QNYqzd)


## Advanced Usage
### Parametric L-Systems

When defining axioms you may also use an Array of Objects instead of basic Strings. This makes the library very flexible because you can insert custom parameters into your symbols. Eg. a symbol like a `A` may contain a `food` variable to simulate organic growth when combined with a random() function:

```.js
let parametricLsystem = new lsys.LSystem({
  axiom: [
    {symbol: 'A', food:0.5},
    {symbol: 'B'},
    {symbol: 'A', , food:0.1},
    {symbol: 'C'}
  ],
  // And then do stuff with those custom parameters in productions:
  productions: {
    'A': ({part, index}) => {
      // split A into one A and a new B if it ate enough:
      if(part.food >= 1.0) {
        return [{symbol: 'A', food:0}, {symbol: 'B', food:0}]        
      } else {
        // otherwise eat a random amount of food
        part.food += Math.random() * 0.1;
        return part;
      }
    }
  }
});

// parametricLsystem.iterate(60);
// Depending on randomness:
// parametricLsystem.getString() ~= 'ABBBBBABBBC';
// The first part of B's has more B's because the first A got more initial food which in the end made a small difference, as you can see.
```

As you can see above, you need to explicitly define the `symbol` value, so the correct production can be applied.

#### Classic Parametric L-System syntax
they loook like `A -> A(1,2)B(5,2)`.
Are planned, but not yet fully implemented. Stay tuned!
