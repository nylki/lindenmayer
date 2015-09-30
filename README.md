
# L-Systems in JS (WIP! ETA: Nov. 2015) [![Build Status](https://travis-ci.org/nylki/lindenmayer.svg?branch=master)](https://travis-ci.org/nylki/lindenmayer)



Hopefully going to be a basic L-System library using modern (ES6) JavaScript with focus on a concise syntax. The idea is to have a very powerful but simple base class, that can handle most use-cases by simply allowing anonymous functions as productions, which makes it very flexible in comparison to classic L-Systems:
```.js

let myLSys = new LSystem()

// simple production, using ES6 arrow function
myLSys.setProduction('B', () => 'F+F')

// or same with just the String, both works
myLSys.setProduction('B', 'F+F')

// simple context sensitive production rule, replacing `B` with `F` if previous character is a B as well, otherwise `BA`
myLSys.setProduction('B', (index, word) => (word[index-1] === 'B') ? 'F' : 'BA')

// simple stochastic production, producing `+F` with 10% probability, `FB+B` with 90%
myLSys.setProduction('B', () => (Math.random() < 0.1) ? '+F' : 'FB+B')
```

In addition to that I want to have a feature-complete which comes with all the possible productions defined in the *Algorithmic Beauty of Plants* (Branches: `[]`, context sensitive productions: `<>`) and uses the base class as a fundament.
As shown before, those (context sensitivity, stochastic production, etc.) can be easily implemented by using the base class. But for historic reasons and compatibility with many already existing examples this classic Class should be able to handle those.

Right now it's under heavy development, so features and names are subject to change.
I will remove this warning when I consider this library stable. I hope to get it **stable by November 2015**.


## Usage

### initializing

initialize new L-System with initiator word and productions. Here the [Koch curve](https://en.wikipedia.org/wiki/Koch_snowflake) is shown:

```.js
// init the Koch curve L-System
let lsys = new LSystem({
      word: 'F++F++F',
      productions: [['F', 'F-F++F-F']]
})
```

The constructor of `LSystem` expects an Array of tuples. Where the tuples are in the form of `[from, to]`.
This will be transformed to a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) by the `LSystem` constructor.


---


It's also possible to use functions as productions. This can be useful if you want to create **stochastic L-Systems**, like so:
```.js
let lsys = new LSystem({
      word: 'F++F++F',
      productions: [['F', () => (Math.random() < 0.7) ? 'F-F++F-F' : 'F+F']]
})
```

You can later change the *productions*:

```.js
lsys.productions.set('F', 'FF-F')
lsys.productions.set('Z', () => (Math.random() > 0.75) ? 'Z-Z' : 'F-FF')
```





---




You could even start with an empty L-System
```.js
let lsys_b = new LSystem()
```

and set all the necessary parameters later. This can be useful
if you want to assign the productions from inside a loop, like so:
```.js


let productionList = document.querySelectorAll('.productions')
for (let i=0; i <= productionList.length; i++) {
      let curTextFields = productionList[i].querySelectorAll('input')
      lsys_b.productions.set(curTextFields[0].value, curTextFields[1].value)
}

lsys_b.setWord(document.querySelector(#initiatorField).value)

```

### iterating
Now that we have set up our L-System we want to generate interesting structures with it.
Iterate the L-System and get resulting word:

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
