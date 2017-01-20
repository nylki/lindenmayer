# API Documentation

## Preface


## Create LSystem Object

```.js
let myLsystem = new LSystem([options])
```

### Options(#LSystem-options)

- `axiom`: The initial word/string of your L-System. Sometimes also called *initiator*. This can be either a String like `'ABC'` or an Array of Objects  in the form: `[{symbol: 'A'}, {symbol: B}, {symbol: C}]`. The axiom can also bet [set later via `setAxiom`](#set-axiom).

- `productions`: Key-value Object to set the productions from one symbol to its axiom. Applied when calling `iterate()`. A production can either be a String, Object, Array of Objects or a Function. [More on productions further below.](#productions)

- `finals`: Optional key-value Object to set Functions be executed for each symbol in sequential order. Useful for visualization. Used when calling `final()`.

- `allowClassicSyntax`: Toggles support for [classic syntax features](#classic-syntax-features) that often are more concise and mirror examples in the book better but are also less flexible.
default: `true`.

- `branchSymbols`: A String tuple of the symbols treated as branches. default: `'[]'`

- `ignoredSymbols`: A String of symbols to ignore when performing context sensitive checks. Eg. you may want to define `+-` in two-dimensional turtle-graphic L-Systems to be ignored. default: `''`.

- `forceObjects`: Toggles automatic conversion of Strings into Objects. Eg. axiom 'AB' gets converted to [{symbol: 'A'}, {symbol: 'B'}]. default: `false`.



### Example Usage

#### Basic
```.js
let myLsystem = new LSystem({
	axiom: 'F',
	productions: {
		'F': 'F-A',
		'A': 'FF++FA'
	}
})
```

#### Context sensitive (using production objects, more below)
```.js
let myLsystem = new LSystem({
	axiom: ['ABCDE'],
	productions: {
		'A': 'A+AAC',
		'B': {leftCtx: 'A', successor: 'A'},
		'C': {rightCtx: 'D', successor: 'ABCD'}
	}
})
```


#### Context sensitive (using classic ABOP-syntax)
This one is semantically equivalent to the previous example, but uses the classic syntax which is supported by default ([can be turned off](#LSystem-options)).
```.js
let myLsystem = new LSystem({
	axiom: ['ABCDE'],
	productions: {
		'A': 'A+AAC',
		'A<B': 'A',
		'C>DE': 'ABCD'
	}
})
```

### setAxiom
You can also set/change the axiom after the initialization:

```.js
myLsystem.setAxiom([axiom])
```

## Productions (#productions)

You can set productions in two ways.

Multiple productions via constructor:
```.js
let myLsystem = new LSystem({
	productions: {
		[symbol]: [production],
		[symbol]: [production]
	}
})
```

Or via their setter-methods:
```.js
// Set single production
myLsystem.setProduction([symbol], [production])
```

```.js
// set multiple productions
myLsystem.setProductions({
	[symbol]: [production],
	[symbol]: [production]
})
```

- `symbol`: A one symbol String, eg. 'F'.

- `production`: Either the result of a production (String, Array), a production Object or a production Function. How a *production* can exactly look like will be explained below.


Productions in lindenmayer.js come in different flavours suited for different situations:

### String-Based Productions
The most basic production consists of a single String, representing the result of a production.

```.js
// Each F will be replacd with FF
myLsystem.setProduction('F', 'FF');
```


### Array-Based Production

If you are reading about L-System in the classic ABOP, you may have stumbled upon parametric L-Systems. Those have optional parameters inside each symbol. Too make this possible using Lindenmayer.js, you can use Arrays of Objects `{symbol, [custom parameters]}` besides basic Strings as production results (and axioms).

```.js
// Each F will be replaced with FF
myLsystem.setProduction('F', [{symbol: 'F'}, {symbol: 'F'}]);

// Or the same but with additional parameters per symbol.
myLsystem.setProduction('F', [
	{symbol: 'F', params: [5,6,1]},
	{symbol: 'F', params: [1,0,0]]}
]);
```

You can define any number of custom parameters (**NOTE: Each symbol object must always posses a `symbol` property!** ):
```.js
myLsystem.setAxiom([{symbol: 'F', food: 10, size: 4}])
myLsystem.setProduction('F', [
	{symbol: 'A', food: 5, size: 2, color: 'rgb(255, 0, 0)'},
	{symbol: '+'},
	{symbol: 'A', food: 5, size: 2, color: 'rgb(0, 255, 0)' }
]);

```

If you want to learn more about parametric L-Systems take a look at the   [Getting Started Guide for Parametric L-Systems](gettingStartedParametric.md) or read further on here too as well.
 

### Object-Based Productions

To allow even more flexibility of solely String or Array based productions, you can choose to use a Object in the following form of:

```.js
{successor: [String, Array, Object, Function], leftCtx: [String], rightCtx:[String], condition: [Function]}
```
This object basically wraps around a regular Array/String-Production (that is defined in the `successor` field) and provides useful functionality

A barebone production using such a wrapper Object:
```.js
// Each F will be replacd with FF.
myLsystem.setProduction('F', {successor: 'FF'});

// Or with an Array as successor/production result.
myLsystem.setProduction('F', {successor: [{symbol: 'F'}, {symbol: 'F'}]});

```

As you may probably guessed, those basic examples above does not yet make use of those extra functionality. Those (**Context-Sensitive**, **Conditional** and **Stochastic**) are explained in more detail in the following short chapters.



#### Context-Sensitive
```.js
// Replace 'F' with FF only if left part is FX and the right part is 'X'
myLsystem.setProduction('F', {successor: 'FF', leftCtx: 'FX', rightCtx. 'X'});
```

See also the chapter on [classic syntax](#classic-syntax) to learn how to write more concise context sensitive productions.


#### Conditional
You may also define a `condition` which has to return a boolean:

```.js

// Replace 'F' with FF only if it is monday (yeah, probably less useful in practice ;), but that should illustrate what potential for creativity you have with.)

myLsystem.setProduction('F',
{successor: 'FF', condition: () => new Date().getDay() === 1});
```

#### Stochastic

Array-Based production are useful if your L-System uses parametric productions




### Function-Based Productions

Besides Strings, Arrays and (wrapping) Objects you can also define functions as productions for complete flexibilty. Each production function has also access to an info object.

```.js
myLsystem.setProduction([symbol], [Function(info)])
```

**info object**:

- `index`: The current index of the symbol inside the whole axiom.

- `part`: The current symbol part. Not very useful for String based L-Systems. But for Array based ones, this lets you access the whole symbol object, including any custom parameters you added. eg.: part = {symbol: 'F', food: 4, myCustomParameter: true, params: [1,2]}

- `params`: This is a shorthand for `part.params` (see above)

- `currentAxiom`: Reference to the current axiom/word. Useful in combination with `index`.


A production function returns a valid successor, like a String or Array. If nothing or `false` is returned, the symbol will not replaced.

#### Usage examples:


Replace 'F' with 'A' if it is at least at index 3 (4th position) inside the current axiom, otherwise return 'B':

```.js
myLsystem.setAxiom('FFFFFFF');
myLsystem.setProduction('F', ({index}) => index >= 3 ? 'A' : 'B');
myLsystem.iterate(); // FFFFFF results in -> BBBAAAA
```

Replace any occurrence of 'F' with a random amount (but max. 5) of 'F':

```.js
myLsystem.setProduction('F', () => {
	let result = '';
	let n = Math.ceil(Math.random() * 5);
	for (let i = 0; i < n; i++) result += 'F';
	return result;
})
```


Replace 'F' with 'FM' on mondays and with 'FT' on tuesdays. Otherwise nothing is returned, therefore 'F' stays 'F'.

```.js
myLsystem.setProduction('F', () => {
	let day = new Date().getDay();
	if (day === 1) return 'FM';
	if (day === 2) return 'FT';
});
```

Parametric usage:

```.js
// Duplicate each F but reduce custom `size` parameter for new children by 50%.
myLsystem.setProduction('F', ({part}) =>
	[{symbol: 'F', food: part.size / 2},
	 {symbol: 'F', food: part.size / 2}
  ]
);
```



## Apply Productions

To apply your productions onto the axiom you call `iterate([n])` on your L-System object:

```.js
// iterate only once without arguments
myLsystem.iterate();
// iterate multiple times
mylsystem.iterate(5);
```

In each iteration step, all symbols of the axiom are replaced with new symbols based on your defined productions:

```.js
let myLsystem = new LSystem({
	axiom: 'F+X-X',
	ignoredSymbols: '+-',
	productions: {
		'F': 'G+H',
		'X': {leftCtx: 'F', successor: 'YZ'}
	}
});

let result = myLsystem.iterate();
console.log(result);
// result = 'G+H-YZ-X'
// Note that, because the production for 'X' is context-sensitive (leftCtx:F), only the first X is replacd by 'YZ'.
```
You can see more examples in the examples folder or take a look at the tests.


## Retrieve Results

Basic usage:
```.js
myLsystem.iterate();
let result = myLsystem.getString();
// or:
let result = myLsystem.iterate();
```

When you call `iterate()`, the reduced string result/axiom of your L-System is returned. You can also get the string result/axiom via `getString()`.
To retrieve the raw result/axiom you can use `getRaw()` or directly access the `axiom` property.
To get the raw axiom may be useful if you are operating with arrays/objects in your axiom and productions. For string-based L-Systems it makes no difference.

To demonstrate the different behaviors, please take a look below:

**String based L-System**
```.js
let myLsystem = new LSystem({
	axiom: 'F',
	productions: {'F': 'F+F'}
});

// Before calling iterate()
let result = myLsystem.getString(); // result = 'F'
result = myLsystem.getRaw(); 				// result = 'F'
result = myLsystem.axiom; 					// result = 'F'

// Calling iterate()
result = myLsystem.iterate(); 			// result = 'F+F'

// Getting results after calling iterate()
result = myLsystem.getString(); 		// result = 'F+F'
result = myLsystem.getRaw(); 				// result = 'F+F'
result = myLsystem.axiom; 					// result = 'F+F'
```

**Array based L-System**
```.js
let myLsystem = new LSystem({
	axiom: [{symbol: 'F'}],
	productions: {'F': 'F+F'}
});

// Before calling iterate()
let result = myLsystem.getString(); // result = 'F'
result = myLsystem.getRaw(); 				// result = [{symbol: 'F'}]
result = myLsystem.axiom; 					// result = [{symbol: 'F'}]

// Calling iterate()
result = myLsystem.iterate(); 			// result = 'F+F'

// Getting results after calling iterate()
result = myLsystem.getString(); 		// result = 'F+F'
result = myLsystem.getRaw(); 				// result = [{symbol: 'F'}, {symbol: '+'}, {symbol: 'F'}]
result = myLsystem.axiom; 					// result = [{symbol: 'F'}, {symbol: '+'}, {symbol: 'F'}]
```


## Finals

To visualize or post-process your L-System you can define final functions for each symbol. They function similar to productions, but instead of replacing the existing axiom/word, finals are used to draw for example different lines for different symbols. All finals are executed by calling `lsystem.final()`.

A very common application for finals would be the creation of turtle graphics.
Below is an example on how to use finals to draw turtle graphics like the *Koch Snowflake* on the [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) HTML element.

You can fiddle with the following example in [this codepen](http://codepen.io/nylki/pen/QNYqzd)!

```.html
<body>
	<canvas id="canvas" width="1000" height="1000"></canvas>
</body>

<script>
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
			ctx.translate(0, 40/(koch.iterations + 1))
		}
	}
})

koch.iterate(3)
koch.final()
</script>

```


Lindenmayer.js is not opinionated on what you do with your L-System, so you can draw 2D turtle graphics like above, but may also [draw 3D ones](https://nylki.github.io/aframe-lsystem-component/) or even do entirely different things, like creating sound and music, simply by defining your own `final` functions.


## Classic Syntax Features (#classic-syntax-features)
