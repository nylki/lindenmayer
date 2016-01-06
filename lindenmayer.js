'use strict'


function LSystem({
	word='', productions, finals, branchSymbols=[], ignoredSymbols=[]
}) {


	// if using objects in words, as used in parametric L-Systems
	this.getWordAsString = function({onlyLiterals = false}) {
		if(typeof this.word === 'string') return this.word

		if(onlyLiterals === true) {
			return this.word.reduce( (prev, current) => prev + current.literal, '')
		} else {
			return JSON.stringify(this.word)
		}
	}



	this.setProduction = function (A, B) {
		let newProduction = [A, B]
		if(newProduction === undefined) throw	new Error('no production specified.')

		if(this.parameters.allowClassicSyntax === true) {
			let transformedProduction = this.transformClassicProduction.bind(this)(newProduction)
			this.productions.set(transformedProduction[0], transformedProduction[1])
		} else {
			this.productions.set(newProduction[0], newProduction[1])
		}
	}

	this.setProductions = function (newProductions) {
		if(newProductions === undefined) throw	new Error('no production specified.')

		if(this.parameters.allowClassicSyntax === true) {
			let transformedProductions = newProductions.map(this.transformClassicProduction.bind(this))
			this.productions = new Map(transformedProductions)
		} else {
			this.productions = new Map(newProductions)
		}

	}



	this.transformClassicProduction = function (p) {

		// example: p = ['A<B>C', 'Z']

		// left should be ['A', 'B']
		let left = p[0].match(/(\w+)<(\w)/)

		// right should be ['B', 'C']
		let right = p[0].match(/(\w)>(\w+)/)

		// if no '<' or '>' return original p, as there is no classic classic cs production
		if(left === null && right === null) {
			console.log('bla');
			console.log(p);
			return p
		}


		// indexLiteral should be 'B'
		let indexLiteral = (left !== null) ? left[2] : right[1]

		// check that the right and left match got the same indexLiteral
		if(left !== null && right !== null && left[2] !== right[1]) {
			throw	new Error('index literal differs in context sensitive production from left to right check.',
			left[2], '!==', right[1])
		}

		// console.log('captured: \n' + '\tleft:' + left + ' \n\tright:' + right + ' \n\tindexLiteral' + indexLiteral)

			let transformedFunction = (_index, _word) => {
				let leftMatch = (left !== null) ? this.match({direction: 'left', match: left[1], index: _index, branchSymbols: '[]', ignoredSymbols: '+-&'}) : true
				let rightMatch = (right !== null) ? this.match({direction: 'right', match: right[2], index: _index, branchSymbols: '[]', ignoredSymbols: '+-&'}) : true
				return (leftMatch && rightMatch) ? p[1] : indexLiteral
			}

			let transformedProduction = [indexLiteral, transformedFunction]

			return transformedProduction

	}




	this.applyProductions = function() {
		let newWord = (typeof this.word === 'string') ? '' : []
		let index = 0
		for (let part of this.word) {

			// if we have objects for each literal, (when using parametric L-Systems)
			// get actual identifiable literal character
			let literal = part
			if(typeof part === 'object' && part.literal) literal = part.literal

			// default production result is just the original part itself
			let result = part

			// if a production for current literal exists
			if (this.productions.has(literal)) {
				let p = this.productions.get(literal)

				// if p is a function, execute function and append return value
				if (typeof p === 'function') {
					// TODO: use argument object instead of single arguments
					// p({index, word: this.word, part, contextSensitiveParts: })
					// TODO this, we need to buffer the match context sensitive parts
					// and also decide wether to use the identical style used in ABOP
					// or slightly different
					result = p(index, this.word, part)

				// if p is no function and no iterable
				// it should be a string (regular) or object (parametric L-Systems) and use it
			} else if (typeof p === 'string' || p instanceof String || (typeof p === 'object' && p[Symbol.iterator] === undefined) ) {
					result = p

					// if p is a list/iterable
				} else if (p[Symbol.iterator] !== undefined && typeof p !== 'string' && !(p instanceof String)) {
					/*	: go through the list and use
							the first valid production in that list. (that returns true)
					*/
					for (let _p of p) {
						let _result = (typeof _p === 'function') ? _p(index, this.word, part) : _p
						if (_result !== undefined && _result !== false) {
							result = _result
							break
						}
					}
				}

			}

			// finally add result to new word
			if(typeof newWord === 'string') {
				newWord += result
			} else {
				newWord.push(result)
			}

			index++
		}

		// after the loop, set this.word to newWord
		this.word = newWord

		// and also return with newWord for convenience
		return newWord
	}

	// iterate n times
	this.iterate = function(n = 1) {
		let lastIteration
		for (let iteration = 0; iteration < n; iteration++, this.iterationCount++) {
			lastIteration = this.applyProductions()
		}
		return lastIteration
	}

	this.final = function() {
		for (let part of this.word) {

			// if we have objects for each literal, (when using parametric L-Systems)
			// get actual identifiable literal character
			let literal = part
			if(typeof part === 'object' && part.literal) literal = part.literal

			if (this.finals.has(literal)) {
				var finalFunction = this.finals.get(literal)
				var typeOfFinalFunction = typeof finalFunction
				if ((typeOfFinalFunction !== 'function')) {
					throw Error('\'' + literal + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!')
				}
				// execute literals function
				finalFunction()

			} else {
				// literal has no final function
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

	this.match = function({word_, match, ignoredSymbols, branchSymbols, index, direction}) {

		let branchCount = 0
		let explicitBranchCount = 0
		word_ = word || this.word
		if(branchSymbols === undefined) branchSymbols = (this.branchSymbols !== undefined) ? this.branchSymbols : []
		if(ignoredSymbols === undefined) ignoredSymbols = (this.ignoredSymbols !== undefined) ? this.ignoredSymbols : []

		let branchStart, branchEnd, wordIndex, loopIndexChange, matchIndex, matchIndexChange, matchIndexOverflow
		// set some variables depending on the direction to match
			if (direction === 'right') {
				loopIndexChange = matchIndexChange = +1
				wordIndex = index + 1
				matchIndex = 0
				matchIndexOverflow = match.length
				if (branchSymbols.length > 0) [branchStart, branchEnd] = branchSymbols
			} else if (direction === 'left') {
				loopIndexChange = matchIndexChange = -1
				wordIndex = index - 1
				matchIndex = match.length - 1
				matchIndexOverflow = -1
				if (branchSymbols.length > 0) [branchEnd, branchStart] = branchSymbols
			} else {
				throw Error(direction, 'is not a valid direction for matching.')
			}


		for (;wordIndex < word_.length && wordIndex >= 0; wordIndex += loopIndexChange) {
			let wordLiteral = word_[wordIndex]
			let matchLiteral = match[matchIndex]

			// compare current literal of word with current literal of match
			if (wordLiteral === matchLiteral) {

				if(branchCount === 0 || explicitBranchCount > 0) {
					// if its a match and previously NOT inside branch (branchCount===0) or in explicitly wanted branch (explicitBranchCount > 0)

					// if a bracket was explicitly stated in match word
					if(wordLiteral === branchStart){
						explicitBranchCount++
						branchCount++
						matchIndex += matchIndexChange

					} else if (wordLiteral === branchEnd) {
						explicitBranchCount = Math.max(0, explicitBranchCount - 1)
						branchCount = Math.max(0, branchCount - 1)
						// only increase match if we are out of explicit branch

						if(explicitBranchCount === 0){
							matchIndex += matchIndexChange
						}

					} else {
						matchIndex += matchIndexChange
					}
				}

				// overflowing matchIndices (matchIndex + 1 for right match, matchIndexEnd for left match )?
				// -> no more matches to do. return with true, as everything matched until here
				// *yay*
				if(matchIndex === matchIndexOverflow){
					return true
				}

			} else if (wordLiteral === branchStart) {
				branchCount++
				if(explicitBranchCount > 0) explicitBranchCount++

			} else if(wordLiteral === branchEnd) {
				branchCount = Math.max(0, branchCount-1)
				if(explicitBranchCount > 0) explicitBranchCount = Math.max(0, explicitBranchCount-1)

			} else if((branchCount === 0 || (explicitBranchCount > 0 && matchLiteral !== branchEnd)) && ignoredSymbols.includes(wordLiteral) === false) {
				// not in branchSymbols/branch? or if in explicit branch, and not at the very end of
				// condition (at the ]), and literal not in ignoredSymbols ? then false
				return false
			}
		}
	}




	// finally init stuff
	this.parameters = {
			allowClassicSyntax: true
		}

		this.word = word
		this.productions = new Map()
		this.setProductions(productions)
		this.branchSymbols = branchSymbols
		this.ignoredSymbols = ignoredSymbols

		if (finals) this.finals = new Map(finals)
		this.iterationCount = 0


}


// if in node export LSystem, otherwise don't attempt to
try {
	exports.LSystem = LSystem
	exports.matchRight = matchRight
} catch (err) {

}
