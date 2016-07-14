'use strict';

// Get a list of productions that have identical initiators,
// Output a single stochastic production. Probability per production
// is defined by amount of input productions (4 => 25% each, 2 => 50% etc.)
function transformClassicStochasticProductions(productions) {

  var transformedProduction = function transformedProduction() {
    var resultList = productions; // the parser for productions shall create this list
    var count = resultList.length;
    var range = 0;
    var r = Math.random();
    for (var i = 1; i <= count; i++) {
      range += i / count;
      if (r <= range) return resultList[i];
    }
    console.error('Should have returned a result of the list, something is wrong here with the random numbers?.');
  };
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

function LSystem(_ref) {
	var axiom = _ref.axiom;
	var productions = _ref.productions;
	var finals = _ref.finals;
	var branchSymbols = _ref.branchSymbols;
	var ignoredSymbols = _ref.ignoredSymbols;
	var classicParametricSyntax = _ref.classicParametricSyntax;


	// faking default values until better support lands in all browser
	axiom = typeof axiom !== 'undefined' ? axiom : '';
	branchSymbols = typeof branchSymbols !== 'undefined' ? branchSymbols : [];
	ignoredSymbols = typeof ignoredSymbols !== 'undefined' ? ignoredSymbols : [];
	classicParametricSyntax = typeof classicParametricSyntax !== 'undefined' ? classicParametricSyntax : 'false';

	// if using objects in axioms, as used in parametric L-Systems
	this.getString = function () {
		var onlySymbols = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

		if (typeof this.axiom === 'string') return this.axiom;
		if (onlySymbols === true) {
			return this.axiom.reduce(function (prev, current) {
				if (current.symbol === undefined) {
					console.log('found:', current);
					throw new Error('L-Systems that use only objects as symbols (eg: {symbol: \'F\', params: []}), cant use string symbols (eg. \'F\')! Check if you always return objects in your productions and no strings.');
				}
				return prev + current.symbol;
			}, '');
		} else {
			return JSON.stringify(this.axiom);
		}
	};

	this.setAxiom = function (axiom) {
		this.axiom = axiom;
	};

	this.setProduction = function (A, B) {
		var newProduction = [A, B];
		if (newProduction === undefined) throw new Error('no production specified.');

		if (this.parameters.allowClassicSyntax === true) {
			var transformedProduction = this.transformClassicCSProduction.bind(this)(newProduction);
			this.productions.set(transformedProduction[0], transformedProduction[1]);
		} else {
			this.productions.set(newProduction[0], newProduction[1]);
		}
	};

	// set multiple productions from name:value Object
	this.setProductions = function (newProductions) {
		if (newProductions === undefined) throw new Error('no production specified.');
		this.clearProductions();

		// TODO: once Object.entries() (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) is stable, use that in combo instead of awkward for…in.
		for (var condition in newProductions) {
			if (newProductions.hasOwnProperty(condition)) {
				this.setProduction(condition, newProductions[condition]);
			}
		}
	};

	this.clearProductions = function () {
		this.productions = new Map();
	};

	this.setFinal = function (symbol, final) {
		var newFinal = [symbol, final];
		if (newFinal === undefined) {
			throw new Error('no final specified.');
		}
		this.finals.set(newFinal[0], newFinal[1]);
	};

	// set multiple finals from name:value Object
	this.setFinals = function (newFinals) {
		if (newFinals === undefined) throw new Error('no finals specified.');
		this.finals = new Map();
		for (var symbol in newFinals) {
			if (newFinals.hasOwnProperty(symbol)) {
				this.setFinal(symbol, newFinals[symbol]);
			}
		}
	};

	// TODO: implement it!
	this.transformClassicParametricProduction = function (p) {
		return p;
	};

	// TODO: Scaffold classic parametric and context sensitive stuff out of main file
	// And simply require it here, eg:
	// this.testClassicParametricSyntax = require(classicSyntax.testParametric)??
	this.testClassicParametricSyntax = function (axiom) {
		return (/\(.+\)/.test(axiom)
		);
	};

	// transforms things like 'A(1,2,5)B(2.5)' to
	// [ {symbol: 'A', params: [1,2,5]}, {symbol: 'B', params:[25]} ]
	// strips spaces
	this.transformClassicParametricAxiom = function (axiom) {

		// Replace whitespaces, then split between square brackets.
		var splitAxiom = axiom.replace(/\s+/g, '').split(/[\(\)]/);
		// console.log('parts:', splitAxiom)
		var newAxiom = [];
		// Construct new axiom by getting the params and symbol.
		for (var i = 0; i < splitAxiom.length - 1; i += 2) {
			var params = splitAxiom[i + 1].split(',').map(Number);
			newAxiom.push({ symbol: splitAxiom[i], params: params });
		}
		// console.log('parsed axiom:', newAxiom)
	};

	// transform a classic syntax production into valid JS production
	// TODO: Only work on first part pf production P[0]
	// -> this.transformClassicCSCondition
	this.transformClassicCSProduction = function (p) {
		var _this = this;

		// before continuing, check if classic syntax actually there
		// example: p = ['A<B>C', 'Z']

		// left should be ['A', 'B']
		var left = p[0].match(/(\w+)<(\w)/);

		// right should be ['B', 'C']
		var right = p[0].match(/(\w)>(\w+)/);

		// Not a CS-Production (no '<' or '>'),
		//return original production.
		if (left === null && right === null) {
			return p;
		}

		// indexSymbol should be 'B' in A<B>C
		// get it either from left side or right side if left is nonexistent
		var indexSymbol = left !== null ? left[2] : right[1];

		// double check: make sure that the right and left match got the same indexSymbol (B)
		if (left !== null && right !== null && left[2] !== right[1]) {
			throw new Error('index symbol differs in context sensitive production from left to right check.', left[2], '!==', right[1]);
		}

		// finally build the new (valid JS) production
		// (that is being executed instead of the classic syntax,
		//  which can't be interpreted by the JS engine)
		var transformedFunction = function transformedFunction(_ref2) {
			var _index = _ref2.index;
			var _part = _ref2.part;
			var _axiom = _ref2.currentAxiom;
			var _params = _ref2.params;


			var leftMatch = { result: true };
			var rightMatch = { result: true };

			// this can possibly be optimized (see: https://developers.google.com/speed/articles/optimizing-javascript#avoiding-pitfalls-with-closures)
			if (left !== null) {
				leftMatch = _this.match({ direction: 'left', match: left[1], index: _index, branchSymbols: '[]', ignoredSymbols: '+-&' });
			}

			// don't match with right side if left already false or no right match necessary
			if (leftMatch.result === false || leftMatch.result === true && right === null) return leftMatch.result ? p[1] : _part;

			// see left!== null. could be optimized. Creating 3 variations of function
			// so left/right are not checked here, which improves speed, as left/right
			// are in a scope above.
			if (right !== null) {
				rightMatch = _this.match({ direction: 'right', match: right[2], index: _index, branchSymbols: '[]', ignoredSymbols: '+-&' });
			}

			// Match! On a match return either the result of given production function
			// or simply return the symbol itself if its no function.
			if (leftMatch.result && rightMatch.result) {
				return typeof p[1] === 'function' ? p[1]({ index: _index, part: _part, currentAxiom: _axiom, params: _params, leftMatchIndices: leftMatch.matchIndices, rightMatchIndices: rightMatch.matchIndices }) : p[1];
			} else {
				return _part;
			}
		};

		var transformedProduction = [indexSymbol, transformedFunction];

		return transformedProduction;
	};

	this.applyProductions = function () {
		// a axiom can be a string or an array of objects that contain the key/value 'symbol'
		var newAxiom = typeof this.axiom === 'string' ? '' : [];
		var index = 0;
		// iterate all symbols/characters of the axiom and lookup according productions
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = this.axiom[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var part = _step.value;

				var symbol = part;

				// Stuff for classic parametric L-Systems: get actual symbol and possible parameters
				// params will be given the production function, if applicable.
				var params = [];
				if ((typeof part === 'undefined' ? 'undefined' : _typeof(part)) === 'object' && part.symbol) symbol = part.symbol;
				if ((typeof part === 'undefined' ? 'undefined' : _typeof(part)) === 'object' && part.params) params = part.params;

				// default production result is just the original part itself
				var result = part;

				if (this.productions.has(symbol)) {
					var p = this.productions.get(symbol);

					// if p is a function, execute function and append return value
					if (typeof p === 'function') {
						result = p({ index: index, currentAxiom: this.axiom, part: part, params: params });

						/* if p is no function and no iterable, then
      it should be a string (regular) or object
      directly return it then as result */
					} else if (typeof p === 'string' || p instanceof String || (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object' && p[Symbol.iterator] === undefined) {

							result = p;

							// if p is a list/iterable
						} else if (p[Symbol.iterator] !== undefined && typeof p !== 'string' && !(p instanceof String)) {
								/*
        go through the list and use
        the first valid production in that list. (that returns true)
        This assumes, it's a list of functions.
        */
								var _iteratorNormalCompletion2 = true;
								var _didIteratorError2 = false;
								var _iteratorError2 = undefined;

								try {
									for (var _iterator2 = p[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
										var _p = _step2.value;

										var _result = typeof _p === 'function' ? _p({ index: index, currentAxiom: newAxiom, part: part, params: params }) : _p;
										if (_result !== undefined && _result !== false) {
											result = _result;
											break;
										}
									}
								} catch (err) {
									_didIteratorError2 = true;
									_iteratorError2 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion2 && _iterator2.return) {
											_iterator2.return();
										}
									} finally {
										if (_didIteratorError2) {
											throw _iteratorError2;
										}
									}
								}
							}
				}
				// finally add result to new axiom
				if (typeof newAxiom === 'string') {
					newAxiom += result;
				} else {
					// If result is an array, merge result into new axiom instead of pushing.
					if (result.constructor === Array) {
						Array.prototype.push.apply(newAxiom, result);
					} else {
						newAxiom.push(result);
					}
				}
				index++;
			}

			// finally set new axiom and also return for convenience
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		this.axiom = newAxiom;
		return newAxiom;
	};

	// iterate n times
	this.iterate = function () {
		var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

		this.iterations = n;
		var lastIteration = void 0;
		for (var iteration = 0; iteration < n; iteration++, this.iterationCount++) {
			lastIteration = this.applyProductions();
		}
		return lastIteration;
	};

	this.final = function () {
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = this.axiom[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var part = _step3.value;


				// if we have objects for each symbol, (when using parametric L-Systems)
				// get actual identifiable symbol character
				var symbol = part;
				if ((typeof part === 'undefined' ? 'undefined' : _typeof(part)) === 'object' && part.symbol) symbol = part.symbol;

				if (this.finals.has(symbol)) {
					var finalFunction = this.finals.get(symbol);
					var typeOfFinalFunction = typeof finalFunction === 'undefined' ? 'undefined' : _typeof(finalFunction);
					if (typeOfFinalFunction !== 'function') {
						throw Error('\'' + symbol + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!');
					}
					// execute symbols function
					finalFunction();
				} else {
					// symbol has no final function
				}
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}
	};

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

	this.match = function (_ref3) {
		var axiom_ = _ref3.axiom_;
		var match = _ref3.match;
		var ignoredSymbols = _ref3.ignoredSymbols;
		var branchSymbols = _ref3.branchSymbols;
		var index = _ref3.index;
		var direction = _ref3.direction;

		var branchCount = 0;
		var explicitBranchCount = 0;
		axiom_ = axiom || this.axiom;
		if (branchSymbols === undefined) branchSymbols = this.branchSymbols !== undefined ? this.branchSymbols : [];
		if (ignoredSymbols === undefined) ignoredSymbols = this.ignoredSymbols !== undefined ? this.ignoredSymbols : [];
		var returnMatchIndices = [];

		var branchStart = void 0,
		    branchEnd = void 0,
		    axiomIndex = void 0,
		    loopIndexChange = void 0,
		    matchIndex = void 0,
		    matchIndexChange = void 0,
		    matchIndexOverflow = void 0;
		// set some variables depending on the direction to match
		if (direction === 'right') {
			loopIndexChange = matchIndexChange = +1;
			axiomIndex = index + 1;
			matchIndex = 0;
			matchIndexOverflow = match.length;
			if (branchSymbols.length > 0) {
				;
				var _branchSymbols = branchSymbols;

				var _branchSymbols2 = slicedToArray(_branchSymbols, 2);

				branchStart = _branchSymbols2[0];
				branchEnd = _branchSymbols2[1];
			}
		} else if (direction === 'left') {
			loopIndexChange = matchIndexChange = -1;
			axiomIndex = index - 1;
			matchIndex = match.length - 1;
			matchIndexOverflow = -1;
			if (branchSymbols.length > 0) {
				;
				var _branchSymbols3 = branchSymbols;

				var _branchSymbols4 = slicedToArray(_branchSymbols3, 2);

				branchEnd = _branchSymbols4[0];
				branchStart = _branchSymbols4[1];
			}
		} else {
			throw Error(direction, 'is not a valid direction for matching.');
		}

		for (; axiomIndex < axiom_.length && axiomIndex >= 0; axiomIndex += loopIndexChange) {
			// FIXME: what about objects with .symbol

			var axiomSymbol = axiom_[axiomIndex];
			// For objects match for objects `symbol`
			if ((typeof axiomSymbol === 'undefined' ? 'undefined' : _typeof(axiomSymbol)) === 'object') axiomSymbol = axiomSymbol.symbol;
			var matchSymbol = match[matchIndex];

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
	};

	if (this.classicParametricSyntax === true) {

		console.log(transformClassicStochasticProductions);
	}

	// finally init stuff
	this.parameters = {
		allowClassicSyntax: true
	};

	this.setAxiom(axiom);
	this.productions = new Map();
	if (productions) this.setProductions(productions);
	this.branchSymbols = branchSymbols;
	this.ignoredSymbols = ignoredSymbols;
	this.classicParametricSyntax = classicParametricSyntax;
	if (finals) this.setFinals(finals);

	this.iterationCount = 0;
	return this;
}

module.exports = LSystem;