// Get a list of productions that have identical initiators,
// Output a single stochastic production. Probability per production
// is defined by amount of input productions (4 => 25% each, 2 => 50% etc.)


// These transformers get a classic ABOP snytax as input and return a standardized
// production object in the form of ['F',
// {
//  successor:String/Iterable
//  [alternatively]stochasticSuccessors: Iterable of standardized objects with mandatory weight fields,
//  leftCtx: iterable/string,
//  rightCtx: Iterable/String,
//  condition: Function }]

function transformClassicStochasticProductions(productions) {

  return function transformedProduction() {
    let resultList = productions; // the parser for productions shall create this list
    let count = resultList.length;

    let r = Math.random();
    for (let i = 0; i < count; i++) {
      let range = (i + 1) / count;
      if (r <= range) return resultList[i];
    }

    console.error('Should have returned a result of the list, something is wrong here with the random numbers?.');
  };
}

// TODO: implement it!


// TODO: Scaffold classic parametric and context sensitive stuff out of main file
// And simply require it here, eg:
// this.testClassicParametricSyntax = require(classicSyntax.testParametric)??
function testClassicParametricSyntax(axiom) {
  return (/\(.+\)/.test(axiom)
  );
}

// transforms things like 'A(1,2,5)B(2.5)' to
// [ {symbol: 'A', params: [1,2,5]}, {symbol: 'B', params:[25]} ]
// strips spaces
function transformClassicParametricAxiom(axiom) {

  // Replace whitespaces, then split between square brackets.
  let splitAxiom = axiom.replace(/\s+/g, '').split(/[\(\)]/);
  // console.log('parts:', splitAxiom)
  let newAxiom = [];
  // Construct new axiom by getting the params and symbol.
  for (let i = 0; i < splitAxiom.length - 1; i += 2) {
    let params = splitAxiom[i + 1].split(',').map(Number);
    newAxiom.push({ symbol: splitAxiom[i], params: params });
  }
  // console.log('parsed axiom:', newAxiom)
}

function transformClassicCSProduction(p) {

  // before continuing, check if classic syntax actually there
  // example: p = ['A<B>C', 'Z']

  // left should be ['A', 'B']
  let left = p[0].match(/(.+)<(.)/);

  // right should be ['B', 'C']
  let right = p[0].match(/(.)>(.+)/);

  // Not a CS-Production (no '<' or '>'),
  //return original production.
  if (left === null && right === null) {
    return p;
  }

  let predecessor;
  // create new production object _or_ use the one set by the user
  let productionObject = p[1].successor || p[1].successors ? p[1] : { successor: p[1] };
  if (left !== null) {
    predecessor = left[2];
    productionObject.leftCtx = left[1];
  }
  if (right !== null) {
    predecessor = right[1];
    productionObject.rightCtx = right[2];
  }

  return [predecessor, productionObject];
}

function stringToObjects(string) {
  if (typeof string !== 'string' && string instanceof String === false) return string;
  let transformed = [];
  for (let symbol of string) transformed.push({ symbol });
  return transformed;
}

// TODO: continue here


// transform p to {successor: p}
// if applicable also transform strings into array of {symbol: String} objects
// TODO: make more modular! dont have forceObjects in here
function normalizeProductionRightSide(p, forceObjects) {

  if (p.hasOwnProperty('successors')) {
    for (var i = 0; i < p.successors.length; i++) {
      p.successors[i] = normalizeProductionRightSide(p.successors[i], forceObjects);
    }
  } else if (p.hasOwnProperty('successor') === false) {
    p = { successor: p };
  }

  if (forceObjects && p.hasOwnProperty('successor')) {
    p.successor = stringToObjects(p.successor);
  }

  return p;
}

function normalizeProduction(p, forceObjects) {

  p[1] = normalizeProductionRightSide(p[1], forceObjects);
  return p;
}

class LSystem {
	constructor({
		axiom = '',
		productions,
		finals,
		branchSymbols = '[]',
		ignoredSymbols = '+-&^/|\\',
		allowClassicSyntax = true,
		classicParametricSyntax = false,
		forceObjects = false,
		debug = false
	}) {
		this.ignoredSymbols = ignoredSymbols;
		this.debug = debug;
		this.branchSymbols = branchSymbols;
		this.allowClassicSyntax = allowClassicSyntax;
		this.classicParametricSyntax = classicParametricSyntax;
		this.forceObjects = forceObjects;

		this.setAxiom(axiom);

		this.clearProductions();
		if (productions) this.setProductions(productions);
		if (finals) this.setFinals(finals);
	}

	// TODO: forceObject to be more intelligent based on other productions??
	setAxiom(axiom) {
		this.axiom = this.forceObjects ? stringToObjects(axiom) : axiom;
	}

	getRaw() {
		return this.axiom;
	}

	// if using objects in axioms, as used in parametric L-Systems
	getString(onlySymbols = true) {
		if (typeof this.axiom === 'string') return this.axiom;
		if (onlySymbols === true) {
			return this.axiom.reduce((prev, current) => {
				if (current.symbol === undefined) {
					console.log('found:', current);
					throw new Error('L-Systems that use only objects as symbols (eg: {symbol: \'F\', params: []}), cant use string symbols (eg. \'F\')! Check if you always return objects in your productions and no strings.');
				}
				return prev + current.symbol;
			}, '');
		} else {
			return JSON.stringify(this.axiom);
		}
	}

	setProduction(from, to, allowAppendingMultiSuccessors = false) {
		let newProduction = [from, to];

		if (newProduction === undefined) {
			throw new Error('no production specified.');
		}

		if (to.successor && to.successors) {
			throw new Error('You can not have both a "successor" and a "successors" field in your production!');
		}

		// Apply production transformers and normalizations
		if (this.allowClassicSyntax === true) {
			newProduction = transformClassicCSProduction(newProduction);
		}

		newProduction = normalizeProduction(newProduction, this.forceObjects);

		// check wether production is stochastic
		newProduction[1].isStochastic = newProduction[1].successors !== undefined && newProduction[1].successors.every(successor => successor.weight !== undefined);

		if (newProduction[1].isStochastic) {
			// calculate weight sum
			newProduction[1].weightSum = 0;
			for (let s of newProduction[1].successors) {
				newProduction[1].weightSum += s.weight;
			}
		}

		let symbol = newProduction[0];
		if (allowAppendingMultiSuccessors === true && this.productions.has(symbol)) {

			let existingProduction = this.productions.get(symbol);
			let singleSuccessor = existingProduction.successor;
			let multiSuccessors = existingProduction.successors;

			if (singleSuccessor && !multiSuccessors) {
				// replace existing prod with new obj and add previous successor as first elem
				// to new successors field.
				existingProduction = { successors: [existingProduction] };
			}
			existingProduction.successors.push(newProduction[1]);
			this.productions.set(symbol, existingProduction);
		} else {
			this.productions.set(symbol, newProduction[1]);
		}
	}

	// set multiple productions from name:value Object
	setProductions(newProductions) {
		if (newProductions === undefined) throw new Error('no production specified.');
		this.clearProductions();

		for (let _ref of Object.entries(newProductions)) {
			let from = _ref[0];
			let to = _ref[1];

			this.setProduction(from, to, true);
		}
	}

	clearProductions() {
		this.productions = new Map();
	}

	setFinal(symbol, final) {
		let newFinal = [symbol, final];
		if (newFinal === undefined) {
			throw new Error('no final specified.');
		}
		this.finals.set(newFinal[0], newFinal[1]);
	}

	// set multiple finals from name:value Object
	setFinals(newFinals) {
		if (newFinals === undefined) throw new Error('no finals specified.');
		this.finals = new Map();
		for (let symbol in newFinals) {
			if (newFinals.hasOwnProperty(symbol)) {
				this.setFinal(symbol, newFinals[symbol]);
			}
		}
	}

	//var hasWeight = el => el.weight !== undefined;
	getProductionResult(p, index, part, params, recursive = false) {
		let contextSensitive = p.leftCtx !== undefined || p.rightCtx !== undefined;
		let conditional = p.condition !== undefined;
		let stochastic = false;
		let result = false;
		let precheck = true;

		// Check if condition is true, only then continue to check left and right contexts
		if (conditional && p.condition({ index, currentAxiom: this.axiom, part, params }) === false) {
			precheck = false;
		} else if (contextSensitive) {
			if (p.leftCtx !== undefined && p.rightCtx !== undefined) {
				precheck = this.match({
					direction: 'left',
					match: p.leftCtx,
					index: index,
					branchSymbols: this.branchSymbols,
					ignoredSymbols: this.ignoredSymbols
				}).result && this.match({
					direction: 'right',
					match: p.rightCtx,
					index: index,
					branchSymbols: this.branchSymbols,
					ignoredSymbols: this.ignoredSymbols
				}).result;
			} else if (p.leftCtx !== undefined) {
				precheck = this.match({
					direction: 'left',
					match: p.leftCtx,
					index: index,
					branchSymbols: this.branchSymbols,
					ignoredSymbols: this.ignoredSymbols
				}).result;
			} else if (p.rightCtx !== undefined) {
				precheck = this.match({
					direction: 'right',
					match: p.rightCtx,
					index: index,
					branchSymbols: this.branchSymbols,
					ignoredSymbols: this.ignoredSymbols
				}).result;
			}
		}

		// If conditions and context don't allow product, keep result = false
		if (precheck === false) {
			result = false;
		}

		// If p has multiple successors
		else if (p.successors) {
				// This could be stochastic successors or multiple functions
				// Treat every element in the list as an individual production object
				// For stochastic productions (if all prods in the list have a 'weight' property)
				// Get a random number then pick a production from the list according to their weight

				let currentWeight, threshWeight;
				if (p.isStochastic) {
					threshWeight = Math.random() * p.weightSum;
					currentWeight = 0;
				}
				/*
    go through the list and use
    the first valid production in that list. (that returns true)
    This assumes, it's a list of functions.
    No recursion here: no successors inside successors.
    */
				for (let _p of p.successors) {
					if (p.isStochastic) {
						currentWeight += _p.weight;
						if (currentWeight < threshWeight) continue;
					}
					// If currentWeight >= thresWeight, a production is choosen stochastically
					// and evaluated recursively because it , kax also have rightCtx, leftCtx and condition to further inhibit production. This is not standard L-System behaviour though!

					// last true is for recursiv call
					// TODO: refactor getProductionResult to use an object if not a hit on perf
					let _result = this.getProductionResult(_p, index, part, params, true);
					if (_result !== undefined && _result !== false) {
						result = _result;
						break;
					}
				}
			}
			// if successor is a function, execute function and append return value
			else if (typeof p.successor === 'function') {
					result = p.successor({ index, currentAxiom: this.axiom, part, params });
				} else {
					result = p.successor;
				}

		if (!result) {
			// Allow undefined or false results for recursive calls of this func
			return recursive ? result : part;
		}
		return result;
	}

	applyProductions() {
		// a axiom can be a string or an array of objects that contain the key/value 'symbol'
		let newAxiom = typeof this.axiom === 'string' ? '' : [];
		let index = 0;

		// iterate all symbols/characters of the axiom and lookup according productions
		for (let part of this.axiom) {

			// Stuff for classic parametric L-Systems: get actual symbol and possible parameters
			// params will be given the production function, if applicable.

			let symbol = part.symbol || part;
			let params = part.params || [];

			let result = part;
			if (this.productions.has(symbol)) {
				let p = this.productions.get(symbol);
				result = this.getProductionResult(p, index, part, params);
			}

			// Got result. Now add result to new axiom.
			if (typeof newAxiom === 'string') {
				newAxiom += result;
			} else if (result instanceof Array) {
				// If result is an array, merge result into new axiom instead of pushing.
				newAxiom.push(...result);
			} else {
				newAxiom.push(result);
			}
			index++;
		}

		// finally set new axiom and also return it for convenience.
		this.axiom = newAxiom;
		return newAxiom;
	}

	iterate(n = 1) {
		this.iterations = n;
		let lastIteration;
		for (let iteration = 0; iteration < n; iteration++) {
			lastIteration = this.applyProductions();
		}
		return lastIteration;
	}

	final(externalArg) {
		let index = 0;
		for (let part of this.axiom) {

			// if we have objects for each symbol, (when using parametric L-Systems)
			// get actual identifiable symbol character
			let symbol = part;
			if (typeof part === 'object' && part.symbol) symbol = part.symbol;

			if (this.finals.has(symbol)) {
				let finalFunction = this.finals.get(symbol);
				let typeOfFinalFunction = typeof finalFunction;
				if (typeOfFinalFunction !== 'function') {
					throw Error('\'' + symbol + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!');
				}
				// execute symbols function
				// supply in first argument an details object with current index and part
				// and in the first argument inject the external argument (like a render target)
				finalFunction({ index, part }, externalArg);
			} else {
				// symbol has no final function
			}
			index++;
		}
	}

	/*
 	how to use match():
 	 -----------------------
 	It is mainly a helper function for context sensitive productions.
 	If you use the classic syntax, it will by default be automatically transformed to proper
 	JS-Syntax.
 	Howerver, you can use the match helper function in your on productions:
 		index is the index of a production using `match`
 	eg. in a classic L-System
 		LSYS = ABCDE
 	B<C>DE -> 'Z'
 		the index of the `B<C>D -> 'Z'` production would be the index of C (which is 2) when the
 	production would perform match(). so (if not using the ClassicLSystem class) you'd construction your context-sensitive production from C to Z like so:
 		LSYS.setProduction('C', (index, axiom) => {
 		(LSYS.match({index, match: 'B', direction: 'left'}) &&
 		 LSYS.match({index, match: 'DE', direction: 'right'}) ? 'Z' : 'C')
 	})
 		You can just write match({index, ...} instead of match({index: index, ..}) because of new ES6 Object initialization, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_6
 	*/
	match({ axiom_, match, ignoredSymbols, branchSymbols, index, direction }) {

		let branchCount = 0;
		let explicitBranchCount = 0;
		axiom_ = axiom_ || this.axiom;
		if (branchSymbols === undefined) branchSymbols = this.branchSymbols !== undefined ? this.branchSymbols : [];
		if (ignoredSymbols === undefined) ignoredSymbols = this.ignoredSymbols !== undefined ? this.ignoredSymbols : [];
		let returnMatchIndices = [];

		let branchStart, branchEnd, axiomIndex, loopIndexChange, matchIndex, matchIndexChange, matchIndexOverflow;
		// set some variables depending on the direction to match

		if (direction === 'right') {
			loopIndexChange = matchIndexChange = +1;
			axiomIndex = index + 1;
			matchIndex = 0;
			matchIndexOverflow = match.length;
			if (branchSymbols.length > 0) {
				
				var _branchSymbols = branchSymbols;
				branchStart = _branchSymbols[0];
				branchEnd = _branchSymbols[1];
			}
		} else if (direction === 'left') {
			loopIndexChange = matchIndexChange = -1;
			axiomIndex = index - 1;
			matchIndex = match.length - 1;
			matchIndexOverflow = -1;
			if (branchSymbols.length > 0) {
				
				var _branchSymbols2 = branchSymbols;
				branchEnd = _branchSymbols2[0];
				branchStart = _branchSymbols2[1];
			}
		} else {
			throw Error(direction, 'is not a valid direction for matching.');
		}

		for (; axiomIndex < axiom_.length && axiomIndex >= 0; axiomIndex += loopIndexChange) {

			let axiomSymbol = axiom_[axiomIndex].symbol || axiom_[axiomIndex];
			let matchSymbol = match[matchIndex];

			// compare current symbol of axiom with current symbol of match
			if (axiomSymbol === matchSymbol) {

				if (branchCount === 0 || explicitBranchCount > 0) {
					// if its a match and previously NOT inside branch (branchCount===0) or in explicitly wanted branch (explicitBranchCount > 0)

					// if a bracket was explicitly stated in match axiom
					if (axiomSymbol === branchStart) {
						explicitBranchCount++;
						branchCount++;
						matchIndex += matchIndexChange;
					} else if (axiomSymbol === branchEnd) {
						explicitBranchCount = Math.max(0, explicitBranchCount - 1);
						branchCount = Math.max(0, branchCount - 1);
						// only increase match if we are out of explicit branch

						if (explicitBranchCount === 0) {

							matchIndex += matchIndexChange;
						}
					} else {
						returnMatchIndices.push(axiomIndex);
						matchIndex += matchIndexChange;
					}
				}

				// overflowing matchIndices (matchIndex + 1 for right match, matchIndexEnd for left match )?
				// -> no more matches to do. return with true, as everything matched until here
				// *yay*
				if (matchIndex === matchIndexOverflow) {
					return { result: true, matchIndices: returnMatchIndices };
				}
			} else if (axiomSymbol === branchStart) {
				branchCount++;
				if (explicitBranchCount > 0) explicitBranchCount++;
			} else if (axiomSymbol === branchEnd) {
				branchCount = Math.max(0, branchCount - 1);
				if (explicitBranchCount > 0) explicitBranchCount = Math.max(0, explicitBranchCount - 1);
			} else if ((branchCount === 0 || explicitBranchCount > 0 && matchSymbol !== branchEnd) && ignoredSymbols.includes(axiomSymbol) === false) {
				// not in branchSymbols/branch? or if in explicit branch, and not at the very end of
				// condition (at the ]), and symbol not in ignoredSymbols ? then false
				return { result: false, matchIndices: returnMatchIndices };
			}
		}

		return { result: false, matchIndices: returnMatchIndices };
	}
}

LSystem.getStringResult = LSystem.getString;
// Set classic syntax helpers to library scope to be used outside of library context
// for users eg.
LSystem.transformClassicStochasticProductions = transformClassicStochasticProductions;
LSystem.transformClassicCSProduction = transformClassicCSProduction;
LSystem.transformClassicParametricAxiom = transformClassicParametricAxiom;
LSystem.testClassicParametricSyntax = testClassicParametricSyntax;

export default LSystem;
