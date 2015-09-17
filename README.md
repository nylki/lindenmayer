# L-Systems in JS (WIP!) [![Build Status](https://travis-ci.org/nylki/lindenmayer.svg?branch=master)](https://travis-ci.org/nylki/lindenmayer)
Hopefully going to be a basic L-System library using modern (ES6) JavaScript with focus
on a concise syntax. stay tuned :)

Regarding ES6:
- generators might come in handy


## Todo


- [ ] allow Symbols(and generally objects maybe?) in addition to single chars
      this would allow stuff like: 

```.js
let buildingsys = new LSystem({
      word:[floor, escalator, floor, escalator, floor, roof],
      productions: [
        [floor, [room, door, room, room],
        [roof, plane, -, plane]
        ]
    })
```

- [ ] allow functions as productions (useful for stochastic L-Systems). **see below**
- [x] and final productions: productions that are special, which should be applied in the end to eg create the actual structures out of your literals. **see below**

```.js
productions: [
  ['W', () => {return (Math.random() < 0.3) ? 'WA++W**' : '~W-AA' }],
  ['A', () => {return (Math.random() < 0.9) ? 'AA' : '~AW' }]
]

finalProductions: [
  ['W', () => {line(currentX, currentY, 0, 10 )}],
  ['-', () => {rotate(90)}],
  ['+', () => {rotate(-90)}]
  ['*', () => {diameter++}],
  ['~', () => {diameter--}],
  ['A', () => {ellipse(currentX, currentY, diameter, diameter)}]
]
```

- [ ] stochastic l-systems (see above)
- [ ] reference implementations/examples with Canvas, p5.js, paper.js and three.js


## Usage

initialize new L-System with initiator word and productions. Here the [Koch curve](https://en.wikipedia.org/wiki/Koch_snowflake) is shown:

### initializing

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


It's also possible to use function as productions. This can be useful if you want to create **stochastic L-Systems**, like so:
```.js
let lsys = new LSystem({
      word: 'F++F++F',
      productions: [['F', () => (Math.random() < 0.7) ? 'F-F++F-F' : 'F+F']]
})
```

You can later change the *initiator word* or *productions*:

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
lsys.iterate().then(result => console.log(result))

// iterate multiple times, then log result
lsys.iterate(5).then(result => console.log(result))

// or get the L-Systems word or iteration count
function postProcessing(word, iterationCount, …){
      if(iterationCount < 6) doSomethingWith(word)
}
postProcessing(lsys.word, lsys.iterations)



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
		['F', () => {
			ctx.beginPath()
			ctx.moveTo(0,0)
			ctx.lineTo(0, 50/(koch.iterations + 1))
			ctx.stroke()
			ctx.translate(0, 50/(koch.iterations + 1))}],
			
		['+', () => {ctx.rotate((Math.PI/180) * 60)}],
		['-', () => { ctx.rotate((Math.PI/180) * -60)}]
		]
	})
	
koch.iterate(3).then(koch.final())

```
