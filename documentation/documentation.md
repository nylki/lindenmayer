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

#### Context sensitive (using production objects)
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


## Productions (#productions)

You can set productions in three ways.

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


Furthermore, productions in Lindenmayer come in different flavours suited for different situations.

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
	{symbol: 'F', params:[5,6,1]},
	{symbol: 'F', [params:[1,0,0]]}
]);
```

If you want to learn more about parametric L-Systems take a look at the **HOW TO LINK TO OTHER FILES IN MD?**  [Getting Started Guide for Parametric L-Systems]() or read further on here too as well.
 

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

#### Function-Based Productions
Instead



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


## setAxiom

```.js
myLsystem.setAxiom([axiom])
```


## Classic Syntax Features (#classic-syntax-features)
