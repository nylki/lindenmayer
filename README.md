
# L-Systems in JS (WIP!) [![Build Status](https://travis-ci.org/nylki/lindenmayer.svg?branch=master)](https://travis-ci.org/nylki/lindenmayer)



Hopefully going to be a basic L-System library using modern (ES6) JavaScript with focus on a concise syntax. The idea is to have a very powerful but simple base Class, that can handle most use-cases by simply allowing functions as productions.
In addition to that I want to have a feature-complete subclass that uses those features but comes with all the productions defined *Algorithmic Beauty of Plants* (Branches: `[]`, context sensitive productions: `<>`).
As I said before, those can be easily implemented by using the basic class. But for historic reasons and compatibility with many already existing examples this classic Class should be a le to handle those.

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
