
'use strict';
/*

productions are in the form:
productions:
[
	['A', 'B++'],
	['B', 'BBA-B']
]

which then get transformed to a map via
this.productions = new Map(production)

or you can use a map directly



var kochkurve = new lsys({
	word:'A',
	productions: [['A', 'A+BB'], ['B', 'BA--']]
})


*/

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
		this.generate = this.generate();
	}

	_createClass(LSystem, [{
		key: 'generate',
		value: regeneratorRuntime.mark(function generate() {
			var newWord, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, literal;

			return regeneratorRuntime.wrap(function generate$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						if (! ++this.iterations) {
							context$2$0.next = 26;
							break;
						}

						newWord = '';
						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;
						context$2$0.prev = 5;

						for (_iterator = this.word[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							literal = _step.value;

							if (this.productions.has(literal)) {
								newWord += this.productions.get(literal);
							} else {
								newWord += literal;
							}
						}

						context$2$0.next = 13;
						break;

					case 9:
						context$2$0.prev = 9;
						context$2$0.t0 = context$2$0['catch'](5);
						_didIteratorError = true;
						_iteratorError = context$2$0.t0;

					case 13:
						context$2$0.prev = 13;
						context$2$0.prev = 14;

						if (!_iteratorNormalCompletion && _iterator['return']) {
							_iterator['return']();
						}

					case 16:
						context$2$0.prev = 16;

						if (!_didIteratorError) {
							context$2$0.next = 19;
							break;
						}

						throw _iteratorError;

					case 19:
						return context$2$0.finish(16);

					case 20:
						return context$2$0.finish(13);

					case 21:
						this.word = newWord;
						context$2$0.next = 24;
						return this.word;

					case 24:
						context$2$0.next = 0;
						break;

					case 26:
					case 'end':
						return context$2$0.stop();
				}
			}, generate, this, [[5, 9, 13, 21], [14,, 16, 20]]);
		})

		// just a shortcut to be able to use an instance of LSystem like a generator
	}, {
		key: 'next',
		value: function next(argument) {
			return this.generate.next(argument);
		}

		// iterate n times - executes this.generate.next() n-1 times
	}, {
		key: 'iterate',
		value: function iterate(n) {
			if (typeof n === 'number') {
				for (var i = 0; i < n - 1; i++) {
					this.generate.next();
				}
			}
			return this.generate.next();
		}
	}, {
		key: 'final',
		value: function final() {
			console.log('final');
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.word[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var literal = _step2.value;

					if (this.finals.has(literal)) {
						var finalFunction = this.finals.get(literal);
						var typeOfFinalFunction = typeof finalFunction;
						if (typeOfFinalFunction !== 'function') {

							throw new Error('\'' + literal + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!');
						}
						// execute literals function
						finalFunction();
					} else {
						// console.error(literal + 'has no final function.')
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
	}]);

	return LSystem;
})();

if (module !== undefined) exports.LSystem = LSystem;

console.log('loaded lindenmayer.js');
