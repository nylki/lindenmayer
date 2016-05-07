'use strict';

function LSystem({ word, productions, finals, branchSymbols, ignoredSymbols, classicParametricSyntax }) {

	// faking default values until better support lands in all browser
	word = typeof word !== 'undefined' ? word : '';
	branchSymbols = typeof branchSymbols !== 'undefined' ? branchSymbols : [];
	ignoredSymbols = typeof ignoredSymbols !== 'undefined' ? ignoredSymbols : [];
	classicParametricSyntax = typeof classicParametricSyntax !== 'undefined' ? classicParametricSyntax : 'false';

	// if using objects in words, as used in parametric L-Systems
	this.getString = function (onlyLetters = true) {
		if (typeof this.word === 'string') return this.word;

		if (onlyLetters === true) {
			return this.word.reduce((prev, current) => prev + current.letter, '');
		} else {
			return JSON.stringify(this.word);
		}
	};

	this.setWord = function (word) {
		this.word = word;
	};

	this.setProduction = function (A, B) {
		let newProduction = [A, B];
		if (newProduction === undefined) throw new Error('no production specified.');

		if (this.parameters.allowClassicSyntax === true) {
			let transformedProduction = this.transformClassicCSProduction.bind(this)(newProduction);
			this.productions.set(transformedProduction[0], transformedProduction[1]);
		} else {
			this.productions.set(newProduction[0], newProduction[1]);
		}
	};

	// set multiple productions from name:value Object
	this.setProductions = function (newProductions) {
		if (newProductions === undefined) throw new Error('no production specified.');
		this.productions = new Map();

		// TODO: once Object.entries() (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) is stable, use that in combo instead of awkward for…in.
		for (let condition in newProductions) {
			if (newProductions.hasOwnProperty(condition)) {
				this.setProduction(condition, newProductions[condition]);
			}
		}
	};

	this.setFinal = function (letter, final) {
		let newFinal = [letter, final];
		if (newFinal === undefined) {
			throw new Error('no final specified.');
		}
		this.finals.set(newFinal[0], newFinal[1]);
	};

	// set multiple finals from name:value Object
	this.setFinals = function (newFinals) {
		if (newFinals === undefined) throw new Error('no finals specified.');
		this.finals = new Map();
		for (let letter in newFinals) {
			if (newFinals.hasOwnProperty(letter)) {
				this.setFinal(letter, newFinals[letter]);
			}
		}
	};

	// TODO: implement it!
	this.transformClassicParametricProduction = function (p) {
		return p;
	};

	this.testClassicParametricSyntax = word => /\(.+\)/.test(word);

	// transforms things like 'A(1,2,5)B(2.5)' to
	// [ {letter: 'A', params: [1,2,5]}, {letter: 'B', params:[25]} ]
	// strips spaces
	this.transformClassicParametricWord = function (word) {

		// Replace whitespaces, then split between square brackets.
		let splitWord = word.replace(/\s+/g, '').split(/[\(\)]/);
		console.log('parts:', splitWord);
		let newWord = [];
		// Construct new word by getting the params and letter.
		for (let i = 0; i < splitWord.length - 1; i += 2) {
			let params = splitWord[i + 1].split(',').map(Number);
			newWord.push({ letter: splitWord[i], params: params });
		}
		console.log('parsed word:', newWord);
	};

	// transform a classic syntax production into valid JS production
	// TODO: Only work on first part pf production P[0]
	// -> this.transformClassicCSCondition
	this.transformClassicCSProduction = function (p) {

		// before continuing, check if classic syntax actually there
		// example: p = ['A<B>C', 'Z']

		// left should be ['A', 'B']
		let left = p[0].match(/(\w+)<(\w)/);

		// right should be ['B', 'C']
		let right = p[0].match(/(\w)>(\w+)/);

		// Not a CS-Production (no '<' or '>'),
		//return original production.
		if (left === null && right === null) {
			return p;
		}

		// indexLetter should be 'B' in A<B>C
		// get it either from left side or right side if left is nonexistent
		let indexLetter = left !== null ? left[2] : right[1];

		// double check: make sure that the right and left match got the same indexLetter (B)
		if (left !== null && right !== null && left[2] !== right[1]) {
			throw new Error('index letter differs in context sensitive production from left to right check.', left[2], '!==', right[1]);
		}

		// finally build the new (valid JS) production
		// (that is being executed instead of the classic syntax,
		//  which can't be interpreted by the JS engine)
		let transformedFunction = ({ index: _index, part: _part, word: _word, params: _params }) => {

			let leftMatch = true;
			let rightMatch = true;

			// this can possibly be optimized (see: https://developers.google.com/speed/articles/optimizing-javascript#avoiding-pitfalls-with-closures)
			if (left !== null) {
				leftMatch = this.match({ direction: 'left', match: left[1], index: _index, branchSymbols: '[]', ignoredSymbols: '+-&' });
			}

			// don't match with right side if left already false or no right match necessary
			if (leftMatch === false || leftMatch === true && right === null) return leftMatch ? p[1] : indexLetter;

			// see left!== null. could be optimized. Creating 3 variations of function
			// so left/right are not checked here, which improves speed, as left/right
			// are in a scope above.
			if (right !== null) {
				rightMatch = this.match({ direction: 'right', match: right[2], index: _index, branchSymbols: '[]', ignoredSymbols: '+-&' });
			}

			return leftMatch && rightMatch ? p[1] : indexLetter;
		};

		let transformedProduction = [indexLetter, transformedFunction];

		return transformedProduction;
	};

	this.applyProductions = function () {
		// a word can be a string or an array of objects that contain the key/value 'letter'
		let newWord = typeof this.word === 'string' ? '' : [];
		let index = 0;

		// iterate all letters/characters of the word and lookup according productions
		for (let part of this.word) {
			let letter = part;

			// Stuff for classic parametric L-Systems: get actual letter and possible parameters
			// params will be given the production function, if applicable.
			let params = [];
			if (typeof part === 'object' && part.letter) letter = part.letter;
			if (typeof part === 'object' && part.params) params = part.params;

			// default production result is just the original part itself
			let result = part;

			if (this.productions.has(letter)) {
				let p = this.productions.get(letter);

				// if p is a function, execute function and append return value
				if (typeof p === 'function') {
					result = p({ index, word: this.word, part, params });

					/* if p is no function and no iterable, then
     it should be a string (regular) or object
     directly return it then as result */
				} else if (typeof p === 'string' || p instanceof String || typeof p === 'object' && p[Symbol.iterator] === undefined) {

						result = p;

						// if p is a list/iterable
					} else if (p[Symbol.iterator] !== undefined && typeof p !== 'string' && !(p instanceof String)) {
							/*
       go through the list and use
       the first valid production in that list. (that returns true)
       This assumes, it's a list of functions.
       */
							for (let _p of p) {
								let _result = typeof _p === 'function' ? _p({ index, word: this.word, part, params }) : _p;
								if (_result !== undefined && _result !== false) {
									result = _result;
									break;
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

		// finally set new word and also return for convenience
		this.word = newWord;
		return newWord;
	};

	// iterate n times
	this.iterate = function (n = 1) {
		this.iterations = n;
		let lastIteration;
		for (let iteration = 0; iteration < n; iteration++, this.iterationCount++) {
			lastIteration = this.applyProductions();
		}
		return lastIteration;
	};

	this.final = function () {
		for (let part of this.word) {

			// if we have objects for each letter, (when using parametric L-Systems)
			// get actual identifiable letter character
			let letter = part;
			if (typeof part === 'object' && part.letter) letter = part.letter;

			if (this.finals.has(letter)) {
				var finalFunction = this.finals.get(letter);
				var typeOfFinalFunction = typeof finalFunction;
				if (typeOfFinalFunction !== 'function') {
					throw Error('\'' + letter + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!');
				}
				// execute letters function
				finalFunction();
			} else {
				// letter has no final function
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
 
 	LSYS.setProduction('C', (index, word) => {
 		(LSYS.match({index, match: 'B', direction: 'left'}) &&
 		 LSYS.match({index, match: 'DE', direction: 'right'}) ? 'Z' : 'C')
 	})
 
 	You can just write match({index, ...} instead of match({index: index, ..}) because of new ES6 Object initialization, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_6
 	*/

	this.match = function ({ word_, match, ignoredSymbols, branchSymbols, index, direction }) {

		let branchCount = 0;
		let explicitBranchCount = 0;
		word_ = word || this.word;
		if (branchSymbols === undefined) branchSymbols = this.branchSymbols !== undefined ? this.branchSymbols : [];
		if (ignoredSymbols === undefined) ignoredSymbols = this.ignoredSymbols !== undefined ? this.ignoredSymbols : [];

		let branchStart, branchEnd, wordIndex, loopIndexChange, matchIndex, matchIndexChange, matchIndexOverflow;
		// set some variables depending on the direction to match
		if (direction === 'right') {
			loopIndexChange = matchIndexChange = +1;
			wordIndex = index + 1;
			matchIndex = 0;
			matchIndexOverflow = match.length;
			if (branchSymbols.length > 0) [branchStart, branchEnd] = branchSymbols;
		} else if (direction === 'left') {
			loopIndexChange = matchIndexChange = -1;
			wordIndex = index - 1;
			matchIndex = match.length - 1;
			matchIndexOverflow = -1;
			if (branchSymbols.length > 0) [branchEnd, branchStart] = branchSymbols;
		} else {
			throw Error(direction, 'is not a valid direction for matching.');
		}

		for (; wordIndex < word_.length && wordIndex >= 0; wordIndex += loopIndexChange) {
			// FIXME: what about objects with .letter
			let wordLetter = word_[wordIndex];
			let matchLetter = match[matchIndex];

			// compare current letter of word with current letter of match
			if (wordLetter === matchLetter) {

				if (branchCount === 0 || explicitBranchCount > 0) {
					// if its a match and previously NOT inside branch (branchCount===0) or in explicitly wanted branch (explicitBranchCount > 0)

					// if a bracket was explicitly stated in match word
					if (wordLetter === branchStart) {
						explicitBranchCount++;
						branchCount++;
						matchIndex += matchIndexChange;
					} else if (wordLetter === branchEnd) {
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
			} else if (wordLetter === branchStart) {
				branchCount++;
				if (explicitBranchCount > 0) explicitBranchCount++;
			} else if (wordLetter === branchEnd) {
				branchCount = Math.max(0, branchCount - 1);
				if (explicitBranchCount > 0) explicitBranchCount = Math.max(0, explicitBranchCount - 1);
			} else if ((branchCount === 0 || explicitBranchCount > 0 && matchLetter !== branchEnd) && ignoredSymbols.includes(wordLetter) === false) {
				// not in branchSymbols/branch? or if in explicit branch, and not at the very end of
				// condition (at the ]), and letter not in ignoredSymbols ? then false
				return false;
			}
		}
	};

	// finally init stuff
	this.parameters = {
		allowClassicSyntax: true
	};

	this.setWord(word);
	this.productions = new Map();
	if (productions) this.setProductions(productions);
	this.branchSymbols = branchSymbols;
	this.ignoredSymbols = ignoredSymbols;
	this.classicParametricSyntax = classicParametricSyntax;
	if (finals) this.setFinals(finals);

	this.iterationCount = 0;
}

// Try to export to be used via require in NodeJS.
try {
	exports.LSystem = LSystem;
	exports.matchRight = matchRight;
	exports.matchLeft = matchLeft;
} catch (err) {}
