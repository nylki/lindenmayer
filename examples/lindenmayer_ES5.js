
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
		console.log(this);
	}

	// if in node export LSystem, otherwise don't attempt to

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
			var _this = this;

			var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

			if (typeof n !== 'number') throw new Error('wrong argument for iterate().Needs Number. Instead: ', n);
			if (n === 0) n = 1;

			return new Promise(function (resolve, reject) {
				var newWord = undefined;

				for (var iteration = 0; iteration < n; iteration++, _this.iterations++) {
					// set word to the newly generated newWord to be used in next iteration
					// unless it's the first or only iteration, then init with this.word
					var word = iteration === 0 ? _this.word : newWord;

					// … and reset newWord for next iteration
					newWord = '';

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = word[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var literal = _step.value;

							if (_this.productions.has(literal)) {
								// check if production is function or not
								var p = _this.productions.get(literal);
								if (typeof p === 'function') {
									newWord += p();
								} else {
									newWord += p;
								}
							} else {
								// if no production exists for literal, continue and just append literal
								newWord += literal;
							}
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
				_this.word = newWord;
				// and also resolve with newWord for convenience
				resolve(newWord);
			});
		}
	}, {
		key: 'final',
		value: function final() {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {

					for (var _iterator2 = _this2.word[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var literal = _step2.value;

						if (_this2.finals.has(literal)) {
							var finalFunction = _this2.finals.get(literal);
							var typeOfFinalFunction = typeof finalFunction;
							if (typeOfFinalFunction !== 'function') {
								console.log('reject', finalFunction);
								reject(Error('\'' + literal + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!'));
							}
							// execute literals function
							finalFunction();
						} else {
							// literal has no final function
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

				resolve('finished final functions..');
			});
		}
	}]);

	return LSystem;
})();

try {
	exports.LSystem = LSystem;
} catch (err) {}
