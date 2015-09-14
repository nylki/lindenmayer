
'use strict'
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

class LSystem {
	constructor({word, productions, finals}) {
			this.word = word
			this.productions = new Map(productions)
			if(finals) this.finals = new Map(finals)
			this.iterations = 0
			this.generate = this.generate()
	}

	*generate(){
		while(++this.iterations) {
			let newWord = ''
			for (let literal of this.word) {
				if(this.productions.has(literal)){
					// check if production is function or not
					let p = this.productions.get(literal)
					if(typeof p === 'function') {
						newWord += p()
					} else {
						newWord += p
					}

				} else {
					newWord += literal
				}
			}

			this.word = newWord
			yield this.word
		}
	}


	// just a shortcut to be able to use an instance of LSystem like a generator
	next(argument){
		return this.generate.next(argument)
	}

	// iterate n times - executes this.generate.next() n-1 times
	iterate(n) {
		if (typeof n === 'number') {
			for (var i = 0; i < n - 1; i++) {
				this.generate.next()
			}
		}
		return this.generate.next()
	}

	final(){
		for (let literal of this.word) {
			if(this.finals.has(literal)){
				var finalFunction = this.finals.get(literal)
				var typeOfFinalFunction = typeof finalFunction
				if((typeOfFinalFunction !== 'function')) {

					throw new Error( '\'' + literal + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + typeOfFinalFunction + '!')
				}
				// execute literals function
				finalFunction()

			} else {
				// console.error(literal + 'has no final function.')
			}
		}


	}

}

// if in node export LSystem, otherwise don't attempt to
try {
    exports.LSystem = LSystem
}
catch(err) {

}

