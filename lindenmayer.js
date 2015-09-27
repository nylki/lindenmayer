'use strict'

function matchRight(word, match, ignoreList,  wordIndex_) {

	let matchIndex = 0
	let ignoredBranchCount = 0
	let explicitBranchCount = 0

	for (var wordIndex = wordIndex_ + 1; wordIndex < word.length; wordIndex++) {
		let wordLiteral = word[wordIndex]
		let matchLiteral = match[matchIndex]

		// compare current literal of word with current literal of match
		if (wordLiteral === matchLiteral) {

			if(ignoredBranchCount === 0 || explicitBranchCount > 0) {
				// if its a match and NOT inside branch (ignoredBranchCount===0) or in explicitly wanted branch (explicitBranchCount > 0)
				matchIndex++
			}

			// if a bracket was explicitly stated in match word
			if(wordLiteral === '['){
				 explicitBranchCount++
			 } else if (wordLiteral === ']') {
			 	explicitBranchCount--
			}

		} else if (wordLiteral === '[') {
			ignoredBranchCount++
		} else if(wordLiteral === ']') {
			ignoredBranchCount--
			if(ignoredBranchCount < 0) return false
		} else if(ignoredBranchCount === 0 && explicitBranchCount === 0 && ignoreList.includes(wordLiteral) === false) {
			// not in brackets/branch? and literal not in ignorelist ? then false
			return false
		}

		// reached end of match word? return true
		if(matchIndex === match.length) return true
	}

}

class LSystem {
	constructor({
		word, productions, finals
	}) {
		this.word = word
		this.productions = new Map(productions)

		if (finals) this.finals = new Map(finals)
		this.iterations = 0

	}


	// keep old objects but add new ones
	update({
		word, productions, finals
	}) {

	}

	// iterate n times - executes this.generate.next() n-1 times
	iterate(n = 1) {

		if (typeof n !== 'number') throw (new Error('wrong argument for iterate().Needs Number. Instead: ', n))
		if (n === 0) n = 1

				let newWord

				for (let iteration = 0; iteration < n; iteration++, this.iterations++) {
					// set word to the newly generated newWord to be used in next iteration
					// unless it's the first or only iteration, then init with this.word
					let word = (iteration === 0) ? this.word : newWord

					// … and reset newWord for next iteration
					newWord = ''

					let index = 0
					for (let literal of word) {

						// default production result is just the original literal itself
						let result = literal

						if (this.productions.has(literal)) {
							let p = this.productions.get(literal)

							if (typeof p === 'function') {
								// if p is a function, execute function and append return value
								result = p(index, word)

							} else if (p[Symbol.iterator] !== undefined && typeof p !== 'string' && !(p instanceof String)) {
								/*	if p is a list/iterable: go through the list and use
										the first valid production in that list.

										this can be useful for traditional context sensitive and stochastic
										productions as seen in Algorithmic Beauty of Plants,
										when you don't want to use a single function to handle those cases.
										*/

								for (_p of p) {
									let _result = (typeof _p === 'function') ? _p(index, word) : p
									if (res !== false) {
										result = _result
										break
									}
								}

							} else if (typeof p === 'string' || p instanceof String) {
								// if p is no function and no iterable, it should be a string
								result = p
							}
						}

						newWord += result
						index++
					}
				}

				// finally set this.word to newWord
				this.word = newWord

				// and also resolve with newWord for convenience
				return newWord
	}

	final() {
		for (let literal of this.word) {
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



}

class LSystem_classic extends LSystem {
	/* create an LSystem with predefined productions that behaves like the original L-Systems in "Algorithmic Beauty of Plants" by Lindenmayer
	that means specifically: support for context sensitive production syntax using'<' and '>' (eg.: X<F>XX … if F is preceded by one X and succeded by two X)
	this requires a new way to set productions, because we will have to evaluate wether



	// the thing is, we need to allow multiple productions
	// because functions are not really part of the implementation of classic L-Systems
	// IDEA: use lsys.setProduction('F', FOO)

	*/

	constructor({
		word, productions, finals
	}) {
		super({
			word, productions, finals
		})

	}

	setProduction(condition, result) {

		let main = condition

		// if regular contextfree production should overwrite existing  cf-productions
		// as it doesnt make sense to have multiple contextfree productions
		if (condition.length === 1) {
			this.productions.set(condition, result)
			return true
		}
		// context sensitive production syntax (from Algorithmic Beauty of Plants)
		else if (condition.length >= 3) {
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

		}

		// push new production to the local copy
		productionsForMain.push(productionsForMain)

		// then reset the production for main with the modified copy
		this.productions.set(main, productionsForMain)

	}
}








class LSystem_Regex extends LSystem {

	// newWord = new Array(word.length)
	// think about this

}

// if in node export LSystem, otherwise don't attempt to
try {
	exports.LSystem = LSystem
	exports.matchRight = matchRight
} catch (err) {

}
