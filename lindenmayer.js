
'use strict'

var runningCount = 0

class LSystem {
	constructor({word, productions, finals}) {
			this.word = word
			this.productions = new Map(productions)

			if(finals) this.finals = new Map(finals)
			this.iterations = 0
			console.log(this)
	}


	// keep old objects but add new ones
	update({word, productions, finals}) {

	}

	// iterate n times - executes this.generate.next() n-1 times
	iterate(n=1) {

		if (typeof n !== 'number') throw(new Error('wrong argument for iterate().Needs Number. Instead: ', n))
		if(n === 0) n = 1


		return new Promise((resolve, reject) => {
			let newWord

				for (let iteration = 0; iteration < n; iteration++, this.iterations++) {
					// set word to the newly generated newWord to be used in next iteration
					// unless it's the first or only iteration, then init with this.word
					let word = (iteration === 0) ? this.word : newWord

					// … and reset newWord for next iteration
					 newWord = ''

					for (let literal of word) {
						if(this.productions.has(literal)){
							// check if production is function or not
							let p = this.productions.get(literal)
							if(typeof p === 'function') {
								newWord += p()
							} else {
								newWord += p
							}
						} else {
							// if no production exists for literal, continue and just append literal
							newWord += literal
						}
					}

				}

				// finally set this.word to newWord
				this.word = newWord
				// and also resolve with newWord for convenience
				resolve(newWord)

		})
	}



final() {
	return new Promise((resolve, reject) => {

		for (let literal of this.word) {
			if (this.finals.has(literal)) {
				var finalFunction = this.finals.get(literal)
				var typeOfFinalFunction = typeof finalFunction
				if ((typeOfFinalFunction !== 'function')) {
					console.log('reject', finalFunction );
					reject(Error('\'' + literal + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!'))
				}
				// execute literals function
				finalFunction()

			} else {
				// literal has no final function
			}
		}
		resolve('finished final functions..')
	})


}

}

// if in node export LSystem, otherwise don't attempt to
try {
    exports.LSystem = LSystem
}
catch(err) {

}
