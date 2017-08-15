# Lindenmayer [![Build Status](https://travis-ci.org/nylki/lindenmayer.svg?branch=master)](https://travis-ci.org/nylki/lindenmayer)

Lindenmayer is  a [L-System](https://en.wikipedia.org/wiki/L-system) library using modern (ES6) JavaScript with focus on a concise syntax. The idea is to have a very powerful but simple base functionality, that can handle most use-cases by simply allowing anonymous functions as productions, which makes it very flexible in comparison to classic L-Systems.

The library can also parse to some extent classic L-System syntax as defined in Aristid Lindenmayers original work *Algorithmic Beauty of Plants* from 1990. For example branches: `[]` or context sensitive productions: `<>`.
Most stuff should work. I am currently working on parametric L-System support.


If you simply want to work with L-Systems in 3D and VR without defining your own draw methods, you can check out the accompanying [aframe-lsystem-component](https://github.com/nylki/aframe-lsystem-component).

[Full API doc](https://github.com/nylki/lindenmayer/blob/master/docs/index.md) | [Getting Started](https://github.com/nylki/lindenmayer/blob/master/README.md) | [A-Frame (VR) L-System component](https://github.com/nylki/aframe-lsystem-component)

## Examples
-  [codepen collection (editable!)](https://codepen.io/collection/AVvqeg/)
-  [Examples for the accompanying A-Frame component of this library](http://nylki.github.io/aframe-lsystem-component/)
-  [Interactive L-System builder (2D turtle graphics)](http://nylki.github.io/lindenmayer/examples/interactive_lsystem_builder/index.html)
-  [Interactive L-System builder (3D turtle graphics)](http://nylki.github.io/lindenmayer/examples/interactive_lsystem_builder/index_3d.html)
-  [Basic Tree](http://nylki.github.io/lindenmayer/examples/tree.html)

[![3D Hilbert Curve rendered in Interactive L-System builder.](https://cloud.githubusercontent.com/assets/1710598/16453037/a9016230-3e0b-11e6-8268-762437de3c29.png)](http://nylki.github.io/lindenmayer/examples/interactive_lsystem_builder/index_3d.html)

## Install
### Direct download
- [Download latest `lindenmayer.browser.js`](https://github.com/nylki/lindenmayer/releases/latest):
- Then in your `index.html`:

```.html
<script src="lindenmayer.browser.js"></script>
```
### npm
IF you would like to use npm instead of directly downloading:

```.sh
npm install --save lindenmayer
```

Then in your Node.js script:

```.js
var LSystem = require('lindenmayer');
```

Or in your `index.html`:

```.html
<script src="node_modules/lindenmayer/dist/lindenmayer.browser.js"></script>
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
let lsystem = new LSystem({
  axiom: 'ABC',
  /* Directly when initializing a new L-System object: */
  productions: { 'B': 'BB' }
})

// After initialization:
lsystem.setProduction('B', 'F+F')


// Stochastic L-System:
lsystem.setProduction('B', {
  successors: [
  {weight: 50, successor: 'X'}, // 50% probability
  {weight: 25, successor: 'XB'},// 25% probability
  {weight: 25, successor: 'X+B'}// 25% probability
]})

// Context Sensitive:
lsystem.setProduction('B', {leftCtx: 'A', successor: 'B', rightCtx: 'C'})

// or if you prefer the concise *classic* syntax for context sensitive productions:
lsystem.setProduction('A<B>C', 'Z')



// You can also use ES6 arrow functions. Here a Simple (custom) stochastic production, producing `F` with 10% probability, `G` with 90%
lsystem.setProduction('B', () => (Math.random() < 0.1) ? 'F' : 'G')


//Or make use of additional info fed into production functions on runtime.
// Here: return 'B-' if 'B' is in first half of word/axiom, otherwise 'B+'
lsystem.setProduction('B', (info) => (info.currentAxiom.length / 2) <= info.index ? 'B-' : 'B+')
```



# Documentation
The following section is a quick overview. The full API docs can be found [here](https://github.com/nylki/lindenmayer/blob/master/docs/index.md).
## Initialization

```.js
let lsystem = new LSystem(options)
```

`options` may contain:
- `axiom`: A String or an Array of Objects to set the initial axiom (sometimes called axiom, start or initiator).
- `productions`: key-value Object to set the productions from one symbol to its axiom. Used when calling iterate(). A production can be either a String, Object or a Function.
- `finals`: Optional key-value Object to set functions that should be executed each symbol in sequential order when calling final(). Useful for visualization.

advanced options (see [API docs](https://github.com/nylki/lindenmayer/blob/master/docs/index.md) for details):

- `branchSymbols`: A String of two characters. Only used when working with classic context sensitive productions. The first symbol is treated as start of a branch, the last symbol as end of a branch. (default: `"[]"`, but only when using classic CS syntax)
- `ignoredSymbols`: A String of characters to ignore when using context sensitive productions. (default: `"+-&^/|\\"`, but only when using classic CS syntax)
- `classicParametricSyntax`: A Bool to enable *experimental* parsing of parametric L-Systems as defined in Lindenmayers book *Algorithmic Beauty of Plants*. (default: `false`)

Most often you will find yourself only setting `axiom`, `productions` and `finals`.

## Setting an Axiom
As seen in the first section you can simply set your axiom when you init your L-System.

```.js
let lsystem = new LSystem({
      axiom: 'F++F++F'
})
```

You can also set an axiom after initialization:

```.js
let lsystem = new LSystem({
      axiom: 'F++F++F'
})
lsystem.setAxiom('F-F-F')
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
let lsystem = new LSystem()
lsystem.setAxiom('ABC')
lsystem.setProduction('A', 'AAB')
lsystem.setProduction('B', 'CB')
```

This can be useful if you want to dynamically generate and edit L-Systems. For example, you might have a UI, where the user can add new production via a text box.

A major feature of this library is the possibility to use functions as productions, which could be used for stochastic L-Systems:

```.js
// This L-System produces `F+` with a 70% probability and `F-` with 30% probability
let lsystem = new LSystem({
      axiom: 'F++F++F',
      productions: {'F': () => (Math.random() <= 0.7) ? 'F+' : 'F-'}
})

// Productions can also be changed later:
lsys.setProduction('F', () => (Math.random() < 0.2) ? 'F-F++F-F' : 'F+F')
```

If you are using functions as productions, your function can make use of a number of additional parameters that are passed as an info object to the function (see [full docs](https://github.com/nylki/lindenmayer/blob/master/docs/index.md#function-based-productions) for more details):

```.js
lsys.setAxiom('FFFFF')
lsys.setProduction('F', (info) => {
  // Use the `index` to determine where inside the current axiom, the function is applied on.
  if(info.index === 2) return 'X';
})
// lsys.iterate() === FFXFF
```

For a shorter notation you could use the ES6 feature of [object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring) (has support in most modern browsers):
```.js
lsys.setProduction('F', ({index}) => index === 2  ? 'X' : false);
```

If `undefined` or `false` is returned in a production function, as above, the initiating symbol or symbol object is returned (in aboves example, that would be`'F'`).


**parameters**:
- `index`: the index inside the axiom
- `currentAxiom`: the current full axiom/word
- `part`: the current part (symbol or object) the production is applied on. This is especially useful if you are using parametric L-Systems (see last chapter) to have access to parameters of a symbol.



### Applying Productions
Now that we have set up our L-System set, we want to generate new axioms with `iterate()`:

```.js
// Iterate once
lsystem.iterate();

// Iterate n-times
lsystem.iterate(5);
```

### Getting Results
`iterate()` conveniently returns the resulting string:

```.js
console.log(lsystem.iterate())
```

If you want to fetch the result later, use `getString()`:

```.js
lsystem.iterate()
console.log(lsystem.getString())
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

But because the library is not opinionated about what your resuts should be like you can write your own `finals`.
Therefore you can draw 2D turtle graphics as seen above, but also 3D ones with WebGL/three.js, or even do other things like creating sound!

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
