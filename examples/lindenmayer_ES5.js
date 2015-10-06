'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LSystem = (function () {
	function LSystem(_ref) {
		var word = _ref.word;
		var productions = _ref.productions;
		var finals = _ref.finals;
		var _ref$branchSymbols = _ref.branchSymbols;
		var branchSymbols = _ref$branchSymbols === undefined ? [] : _ref$branchSymbols;
		var _ref$ignoredSymbols = _ref.ignoredSymbols;
		var ignoredSymbols = _ref$ignoredSymbols === undefined ? [] : _ref$ignoredSymbols;

		_classCallCheck(this, LSystem);

		this.word = word;
		this.productions = new Map(productions);
		this.branchSymbols = branchSymbols;
		this.ignoredSymbols = ignoredSymbols;

		if (finals) this.finals = new Map(finals);
		this.iterationCount = 0;
	}

	// if using objects in words, as used in parametric L-Systems

	_createClass(LSystem, [{
		key: 'getWordAsString',
		value: function getWordAsString(_ref2) {
			var _ref2$onlyLiterals = _ref2.onlyLiterals;
			var onlyLiterals = _ref2$onlyLiterals === undefined ? false : _ref2$onlyLiterals;

			if (typeof this.word === 'string') return this.word;

			if (onlyLiterals === true) {
				return this.word.reduce(function (prev, current) {
					return prev + current.literal;
				}, '');
			} else {
				return JSON.stringify(this.word);
			}
		}
	}, {
		key: 'applyProductions',
		value: function applyProductions() {
			var newWord = typeof this.word === 'string' ? '' : [];
			var index = 0;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.word[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var part = _step.value;

					// if we have objects for each literal, (when using parametric L-Systems)
					// get actual identifiable literal character
					var literal = part;
					if (typeof part === 'object' && part.literal) literal = part.literal;

					// default production result is just the original part itself
					var result = part;

					// if a production for current literal exists
					if (this.productions.has(literal)) {
						var p = this.productions.get(literal);

						// if p is a function, execute function and append return value
						if (typeof p === 'function') {
							// TODO: use argument object instead of single arguments
							// p({index, word: this.word, part, contextSensitiveParts: })
							// TODO this, we need to buffer the match context sensitive parts
							// and also decide wether to use the identical style used in ABOP
							// or slightly different
							result = p(index, this.word, part);

							// if p is no function and no iterable
							// it should be a string (regular) or object (parametric L-Systems) and use it
						} else if (typeof p === 'string' || p instanceof String || typeof p === 'object' && p[Symbol.iterator] === undefined) {
								result = p;

								// if p is a list/iterable
							} else if (p[Symbol.iterator] !== undefined && typeof p !== 'string' && !(p instanceof String)) {
									/*	: go through the list and use
         		the first valid production in that list. (that returns true)
         */
									var _iteratorNormalCompletion2 = true;
									var _didIteratorError2 = false;
									var _iteratorError2 = undefined;

									try {
										for (var _iterator2 = p[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
											var _p = _step2.value;

											var _result = typeof _p === 'function' ? _p(index, this.word, part) : _p;
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
											if (!_iteratorNormalCompletion2 && _iterator2['return']) {
												_iterator2['return']();
											}
										} finally {
											if (_didIteratorError2) {
												throw _iteratorError2;
											}
										}
									}
								}
					}

					// finally add result to new word
					if (typeof newWord === 'string') {
						newWord += result;
					} else {
						newWord.push(result);
					}

					index++;
				}

				// after the loop, set this.word to newWord
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			this.word = newWord;

			// and also return with newWord for convenience
			return newWord;
		}

		// iterate n times
	}, {
		key: 'iterate',
		value: function iterate() {
			var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

			var lastIteration = undefined;
			for (var iteration = 0; iteration < n; iteration++, this.iterationCount++) {
				lastIteration = this.applyProductions();
			}
			return lastIteration;
		}
	}, {
		key: 'final',
		value: function final() {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.word[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var part = _step3.value;

					// if we have objects for each literal, (when using parametric L-Systems)
					// get actual identifiable literal character
					var literal = part;
					if (typeof part === 'object' && part.literal) literal = part.literal;

					if (this.finals.has(literal)) {
						var finalFunction = this.finals.get(literal);
						var typeOfFinalFunction = typeof finalFunction;
						if (typeOfFinalFunction !== 'function') {
							throw Error('\'' + literal + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!');
						}
						// execute literals function
						finalFunction();
					} else {
						// literal has no final function
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3['return']) {
						_iterator3['return']();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}

		/*
  	how to use match():
   	-----------------------
  
  	index is the index of a production using `match`
  	eg. in a classic L-System
  
  	LSYS = ABCDE
  	B<C>DE -> 'Z'
  
  	the index of the `B<C>D -> 'Z'` production would be the index of C (which is 2) when the
  	production would perform match(). so (if not using the ClassicLSystem class) you'd construction your context-sensitive production from C to Z like so:
  
  	LSYS.setProduction('C', (index, word) => {
  		(LSYS.match({index, match: 'B', direction: 'left'}) &&
  		 LSYS.match({index, match: 'DE', direction: 'right'}) ? 'Z' : 'C')
  	})
  
  	You can just write match({index, ...} instead of match({index: index, ..}) because of new ES6 Object initialization, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_6
  	*/

	}, {
		key: 'match',
		value: function match(_ref3) {
			var word = _ref3.word;
			var _match = _ref3.match;
			var ignoredSymbols = _ref3.ignoredSymbols;
			var branchSymbols = _ref3.branchSymbols;
			var index = _ref3.index;
			var direction = _ref3.direction;

			var branchCount = 0;
			var explicitBranchCount = 0;
			word = word || this.word;
			if (branchSymbols === undefined) branchSymbols = this.branchSymbols !== undefined ? this.branchSymbols : [];
			if (ignoredSymbols === undefined) ignoredSymbols = this.ignoredSymbols !== undefined ? this.ignoredSymbols : [];

			var branchStart = undefined,
			    branchEnd = undefined,
			    wordIndex = undefined,
			    loopIndexChange = undefined,
			    matchIndex = undefined,
			    matchIndexChange = undefined,
			    matchIndexOverflow = undefined;
			// set some variables depending on the direction to match
			if (direction === 'right') {
				loopIndexChange = matchIndexChange = +1;
				wordIndex = index + 1;
				matchIndex = 0;
				matchIndexOverflow = _match.length;
				if (branchSymbols.length > 0) {
					;
					var _branchSymbols = branchSymbols;

					var _branchSymbols2 = _slicedToArray(_branchSymbols, 2);

					branchStart = _branchSymbols2[0];
					branchEnd = _branchSymbols2[1];
				}
			} else if (direction === 'left') {
				loopIndexChange = matchIndexChange = -1;
				wordIndex = index - 1;
				matchIndex = _match.length - 1;
				matchIndexOverflow = -1;
				if (branchSymbols.length > 0) {
					;
					var _branchSymbols3 = branchSymbols;

					var _branchSymbols32 = _slicedToArray(_branchSymbols3, 2);

					branchEnd = _branchSymbols32[0];
					branchStart = _branchSymbols32[1];
				}
			} else {
				throw Error(direction, 'is not a valid direction for matching.');
			}

			for (; wordIndex < word.length && wordIndex >= 0; wordIndex += loopIndexChange) {
				var wordLiteral = word[wordIndex];
				var matchLiteral = _match[matchIndex];

				// compare current literal of word with current literal of match
				if (wordLiteral === matchLiteral) {

					if (branchCount === 0 || explicitBranchCount > 0) {
						// if its a match and previously NOT inside branch (branchCount===0) or in explicitly wanted branch (explicitBranchCount > 0)

						// if a bracket was explicitly stated in match word
						if (wordLiteral === branchStart) {
							explicitBranchCount++;
							branchCount++, matchIndex += matchIndexChange;
						} else if (wordLiteral === branchEnd) {
							explicitBranchCount = Math.max(0, explicitBranchCount - 1);
							branchCount = Math.max(0, branchCount - 1);
							// only increase match if we are out of explicit branch

							if (explicitBranchCount === 0) {
								matchIndex += matchIndexChange;
							}
						} else {
							matchIndex += matchIndexChange;
						}
					}

					// overflowing matchIndices (matchIndex + 1 for right match, matchIndexEnd for left match )?
					// -> no more matches to do. return with true, as everything matched until here
					// *yay*
					if (matchIndex === matchIndexOverflow) {
						return true;
					}
				} else if (wordLiteral === branchStart) {
					branchCount++;
					if (explicitBranchCount > 0) explicitBranchCount++;
				} else if (wordLiteral === branchEnd) {
					branchCount = Math.max(0, branchCount - 1);
					if (explicitBranchCount > 0) explicitBranchCount = Math.max(0, explicitBranchCount - 1);
				} else if ((branchCount === 0 || explicitBranchCount > 0 && matchLiteral !== branchEnd) && ignoredSymbols.includes(wordLiteral) === false) {
					// not in branchSymbols/branch? or if in explicit branch, and not at the very end of
					// condition (at the ]), and literal not in ignoredSymbols ? then false
					return false;
				}
			}
		}
	}]);

	return LSystem;
})();

var LSystem_classic = (function (_LSystem) {
	_inherits(LSystem_classic, _LSystem);

	/* create an LSystem with predefined productions that behaves like the original L-Systems in "Algorithmic Beauty of Plants" by Lindenmayer
 that means specifically: support for context sensitive production syntax using'<' and '>' (eg.: X<F>XX … if F is preceded by one X and succeded by two X)
 this requires a new way to set productions, because we will have to evaluate wether
 
 	// the thing is, we need to allow multiple productions
 // because functions are not really part of the implementation of classic L-Systems
 // IDEA: use lsys.setProduction('F', FOO)
 	*/

	function LSystem_classic(_ref4) {
		var word = _ref4.word;
		var productions = _ref4.productions;
		var finals = _ref4.finals;

		_classCallCheck(this, LSystem_classic);

		_get(Object.getPrototypeOf(LSystem_classic.prototype), 'constructor', this).call(this, { word: word, productions: productions, finals: finals });
	}

	_createClass(LSystem_classic, [{
		key: 'setProduction',
		value: function setProduction(condition, result) {

			var main = condition;

			// if regular contextfree production should overwrite existing  cf-productions
			// as it doesnt make sense to have multiple contextfree productions
			if (condition.length === 1) {
				this.productions.set(condition, result);
				return true;
			}
			// context sensitive production syntax (from Algorithmic Beauty of Plants)
			else if (condition.length >= 3) {}
				// let match = matchContextSensitive(condition)
				// if(match === false) throw new Error(condition, 'is no valid condition to be used as a (context sensitive) production')
				//
				//
				// main = word in between < and >
				// let productionsForMain = this.productions.get(main)
				//
				// // construct new function that deals with context sensitivity
				// // using class methods hasBefore hasAfter
				// let p = function(beforeMain, main, afterMain, index) {
				// 	if(this.hasBefore(index, beforeMain) &&
				// 			this.hasAfter(index, afterMain)) {
				//
				// 			} else {
				// 				return false
				// 			}
				//

				// push new production to the local copy
			productionsForMain.push(productionsForMain);

			// then reset the production for main with the modified copy
			this.productions.set(main, productionsForMain);
		}
	}]);

	return LSystem_classic;
})(LSystem);

var LSystem_Regex = (function (_LSystem2) {
	_inherits(LSystem_Regex, _LSystem2);

	function LSystem_Regex() {
		_classCallCheck(this, LSystem_Regex);

		_get(Object.getPrototypeOf(LSystem_Regex.prototype), 'constructor', this).apply(this, arguments);
	}

	return LSystem_Regex;
})(LSystem);

// newWord = new Array(word.length)
// think about this

// if in node export LSystem, otherwise don't attempt to
try {
	exports.LSystem = LSystem;
	exports.matchRight = matchRight;
} catch (err) {}
