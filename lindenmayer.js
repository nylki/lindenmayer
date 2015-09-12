
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
	constructor({word, productions, save}) {
			this.word = word
			this.productions = new Map(productions)
			this.iterations = 0
			this.generate = this.generate()
	}

	*generate(){
		while(++this.iterations) {
			let newWord = ''
			for (let literal of this.word) {
				if(this.productions.has(literal)){
					newWord += this.productions.get(literal)
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

}

 exports.LSystem = LSystem



var bla = new LSystem({
	word:'A---',
	productions: [['A', 'AARA-BB-B'], ['B', 'ABBA-+--B+-'], ['R', 'RA-']]
})
