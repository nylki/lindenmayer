'use strict';

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var runningCount = 0;

var LSystem = (function () {
	function LSystem(_ref) {
		var word = _ref.word;
		var productions = _ref.productions;
		var finals = _ref.finals;

		_classCallCheck(this, LSystem);

		this.word = word;
		this.productions = new Map(productions);

		if (finals) this.finals = new Map(finals);
		this.iterations = 0;
	}

	// keep old objects but add new ones

	_createClass(LSystem, [{
		key: 'update',
		value: function update(_ref2) {
			var word = _ref2.word;
			var productions = _ref2.productions;
			var finals = _ref2.finals;
		}

		// iterate n times - executes this.generate.next() n-1 times
	}, {
		key: 'iterate',
		value: function iterate() {
			var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

			if (typeof n !== 'number') throw new Error('wrong argument for iterate().Needs Number. Instead: ', n);
			if (n === 0) n = 1;

			var newWord = undefined;

			for (var iteration = 0; iteration < n; iteration++, this.iterations++) {
				// set word to the newly generated newWord to be used in next iteration
				// unless it's the first or only iteration, then init with this.word
				var word = iteration === 0 ? this.word : newWord;

				// … and reset newWord for next iteration
				newWord = '';

				var index = 0;
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = word[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var literal = _step.value;

						// default production result is just the original literal itself
						var result = literal;

						if (this.productions.has(literal)) {
							var p = this.productions.get(literal);

							if (typeof p === 'function') {
								// if p is a function, execute function and append return value
								result = p(index, word);
							} else if (p[Symbol.iterator] !== undefined && typeof p !== 'string' && !(p instanceof String)) {
								/*	if p is a list/iterable: go through the list and use
        		the first valid production in that list.
        			this can be useful for traditional context sensitive and stochastic
        		productions as seen in Algorithmic Beauty of Plants,
        		when you don't want to use a single function to handle those cases.
        		*/

								var _iteratorNormalCompletion2 = true;
								var _didIteratorError2 = false;
								var _iteratorError2 = undefined;

								try {
									for (var _iterator2 = p[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
										_p = _step2.value;

										var _result = typeof _p === 'function' ? _p(index, word) : p;
										if (res !== false) {
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
							} else if (typeof p === 'string' || p instanceof String) {
								// if p is no function and no iterable, it should be a string
								result = p;
							}
						}

						newWord += result;
						index++;
					}
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
			}

			// finally set this.word to newWord
			this.word = newWord;

			// and also resolve with newWord for convenience
			return newWord;
		}
	}, {
		key: 'final',
		value: function final() {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.word[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var literal = _step3.value;

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
	}, {
		key: 'matchAfter',
		value: function matchAfter(index, toMatch, ignoreSymbols) {
			var branchSymbolPairs = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

			// ignore = [+, -, /, \]
			// ignoreBrackets = [
			// [ '\[', '\]' ], ['(', ')'3]]

			var branchCount = new Array(branchSymbolPairs.length);

			for (var i = 0; i < toMatch.length; i++) {
				var literal = toMatch[i];
				var branchIndex = 0;

				// branch symbol?
				if (this.word[index + i] === branchSymbolPairs[0]) {
					branchCount++;
					for (branchIndex = 0; branchIndex < this.word.length; branchIndex++) {
						var inBranchLiteral = this.word[i + branchIndex];
						if (inBranchLiteral === branchSymbolPairs[0]) branchCount++;
						if (inBranchLiteral === branchSymbolPairs[1]) branchCount--;

						// if outer brackets closed, break loop and check on
						if (branchCount === 0) break;
					}
					// if loop ended without outer brackets closed, reset branch index
					if (branchCount !== 0) branchIndex = 0;
				}

				// if there was a branch/brackets, then the branchIndex is set to after the branch
				var literalAfterBranchTesting = this.word[index + i + branchIndex];
				// return false, if literal doesnt match, even after branch testing
				if (literalAfterBranchTesting !== literal && ignoreSymbols.includes(literalAfterBranchTesting) === false) {
					return false;
				}
			}

			return true;
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

	function LSystem_classic(_ref3) {
		var word = _ref3.word;
		var productions = _ref3.productions;
		var finals = _ref3.finals;

		_classCallCheck(this, LSystem_classic);

		_get(Object.getPrototypeOf(LSystem_classic.prototype), 'constructor', this).call(this, {
			word: word, productions: productions, finals: finals
		});
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
} catch (err) {}
