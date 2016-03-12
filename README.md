
# L-Systems in JS (WIP! ETA: March. 2016) [![Build Status](https://travis-ci.org/nylki/lindenmayer.svg?branch=master)](https://travis-ci.org/nylki/lindenmayer)

Hopefully going to be a basic L-System library using modern (ES6) JavaScript with focus on a concise syntax. The idea is to have a very powerful but simple base functionality, that can handle most use-cases by simply allowing anonymous functions as productions, which makes it very flexible in comparison to classic L-Systems.

In addition to that I want to be feature-complete with all the possible productions defined in the *Algorithmic Beauty of Plants* (Branches: `[]`, context sensitive productions: `<>`).
implmented:
- [x] Context Sensitive L-Systems: done
- [ ] Parametric L-Systems: no classic syntax parsing. works with JS functions though! (see documentation.md)

Right now it's under heavy development, so features and names are subject to change.
I will remove this warning when I consider this library stable. I hope to get it **stable by March 2016**.

Basic usage:

```.js
// Initializing a L-System that produces the Koch-curve.
let kochcurve = new LSystem({
      word: 'F++F++F',
      productions: [['F', 'F-F++F-F']]
})
let result = kochcurve.iterate(2)
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

## Usage

### initializing

initialize new L-System with initiator word and productions. Here the [Koch curve](https://en.wikipedia.org/wiki/Koch_snowflake) is shown:

You can init a L-System in one go:

```.js
// Initializing a L-System that produces the Koch curve.
let kochcurve = new LSystem({
      word: 'F++F++F',
      productions: [['F', 'F-F++F-F']]
let result = kochcurve.iterate(2)
})

// Initialize L-System with multiple productions
let mylsys = new LSystem({
      word: 'ABC',
      productions: [
        ['A', 'A+'],
        ['B', 'BA'],
        ['C', 'ABC']
      ]
})

```

It's also possible to use functions as productions. This can be useful if you want to create **stochastic L-Systems**, like so:

```.js
let lsys = new LSystem({
      word: 'F++F++F',
      productions: [['F', () => (Math.random() < 0.7) ? 'F-F++F-F' : 'F+F']]
})

//You can later change the *productions*:
lsys.setProduction('F', () => (Math.random() < 0.2) ? 'F-F++F-F' : 'F+F')
```

You could also start with an empty L-System, and set all necessary parameters later on.

```.js
let lsys = new LSystem()
lsys.setWord('ABC')
lsys.setProduction('A', 'AAB')
lsys.setProduction('B', 'CB')
```

This can be useful if you want to dynamically generate and edit L-Systems. For example, you might have a UI, where the user can add new production via a text box.

### iterating
Now that we have set up our L-System set, we want to generate new words:
```.js
// iterate once, log result to console
let result = lsys.iterate()
console.log(result))

// iterate multiple times, then log result
console.log(lsys.iterate(5))
```


### Visualization and other post processing
This L-System implementation uses a method inside each L-System instance to be called after word generation/iterations.
You can define what should be done for each literal/character. The classic way to use L-Systems is to visualize words with [turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics).
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
	productions: [['F', 'F-F++F-F']],
	finals: [
		['+', () => { ctx.rotate((Math.PI/180) * 60) }],
		['-', () => { ctx.rotate((Math.PI/180) * -60) }],
		['F', () => {
			ctx.beginPath()
			ctx.moveTo(0,0)
			ctx.lineTo(0, 50/(koch.iterations + 1))
			ctx.stroke()
			ctx.translate(0, 50/(koch.iterations + 1))}]
		]
	})

koch.iterate(3)
koch.final()
```
