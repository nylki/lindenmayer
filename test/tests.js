var chai = require("chai")
var chaiAsPromised = require("chai-as-promised")
var expect = chai.expect
var should = chai.should
chai.use(chaiAsPromised)

var lsys = require('../lindenmayer')

describe('Correct behavior of L-Systems', function() {


  it('should handle UTF8', function() {
    var test = new lsys.LSystem({
      word:'⚣⚤●',
      productions: [['⚣', '♂♂'], ['⚤', '♀♂'], ['●', '○◐◑']]
    })
    expect(test.iterate()).to.equal('♂♂♀♂○◐◑')
  })




  it('should generate the string for the Koch-curve', function() {
    var koch = new lsys.LSystem({
      word: 'F++F++F',
      productions: [
        ['F', 'F-F++F-F']
      ]
    })

    expect(koch.iterate()).to.equal('F-F++F-F++F-F++F-F++F-F++F-F')

    expect(koch.iterate()).to.equal('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F')

    expect(koch.iterate()).to.equal('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F')


    var wordFromGenerator = koch.iterate()
    expect(wordFromGenerator).to.equal(koch.word)
  })


  it('should execute final functions to draw eg. visualizations.', function() {
    var vizsys = new lsys.LSystem({
    	word:'A---',
    	productions: [
        ['A', 'AARA-BB-B'],
        ['B', 'ABBA-+--B+-'],
        ['R', 'RA-']
      ],
    	finals: [
        ['A', () => {vizsys.output += '/'}],
        ['B', () => {vizsys.output += '#'}],
        ['R', () => {vizsys.output += '~'}],
        ['-', () => {vizsys.output += '-'}],
        ['+', () => {vizsys.output += '+'}]
      ]
    })

    vizsys.output = ''

    vizsys.iterate(2)
    vizsys.final()
    expect(vizsys.output).to.equal('//~/-##-#//~/-##-#~/-//~/-##-#-/##/-+--#+-/##/-+--#+--/##/-+--#+----')
  })

  it('Final functions must be functions. Should throw an error on any other type.', function() {
    var vizsys = new lsys.LSystem({
      word:'A',
      productions: [['A', 'Z']],
      finals: [
        ['Z', 'A_STRING']
      ]
    })

    expect(function () {
      vizsys.iterate()
      vizsys.final()
    }).to.throw(/not a function/)

    expect(function () {
      vizsys.finals.set('Z', 7)
      vizsys.final()
    }).to.throw(/not a function/)

    expect(function () {
      vizsys.finals.set('Z', new Date())
      vizsys.final()
    }).to.throw(/not a function/)


    var rotation = 5
    expect(function () {
      vizsys.finals.set('Z', () => {rotation *= 2})
      vizsys.final()
    }).to.not.throw(/not a function/)

    expect(rotation).to.equal(10)



  })


  it('Helper functions for context sensitive productions should work properly. Especially with branches.', function() {

    var cs_lsys = new lsys.LSystem({
      word: 'ACBC[-Q]D--[A[FDQ]]E-+FC++G',
      productions: [
        ['C', (index, word) => (cs_lsys.match({direction: 'right', match: 'DEF', index})) ? 'Z' : 'C']
      ],
      branchSymbols: '[]',
      ignoredSymbols: '+-/'
    })

    expect(cs_lsys.iterate()).to.equal('ACBZ[-Q]D--[A[FDQ]]E-+FC++G')

  })

  it('Context sensitive L-System should work inside explicitly wanted branches', function() {
    // this example is taken from ABOP S. 32
    var cs_lsys3 = new lsys.LSystem({
      word: 'ABC[DE][SG[HI[JK]L]MNO]',
      productions: [
        ['S', (index, word) =>
          (
            cs_lsys3.match({direction: 'right', match: 'G[H]M', index, branchSymbols: ['[', ']']}) &&
            cs_lsys3.match({direction: 'left', match: 'BC', index, branchSymbols: ['[', ']']})
          ) ? 'Z' : 'S']
      ]
    })
    expect(cs_lsys3.iterate()).to.equal('ABC[DE][ZG[HI[JK]L]MNO]')


    var cs_lsys4 = new lsys.LSystem({
      word: 'ABC[DE][FG[HI[JK]L]MNO]',
      productions: [
        ['H', (index, word) =>  (
          cs_lsys4.match({direction: 'right', match: 'I[K]L', index, branchSymbols: '[]'}))
          ? 'Z' : 'H']
      ]

    })
    // I[K]L should not apply to I[JK]L
    expect(cs_lsys4.iterate()).to.not.equal('ABC[DE][FG[ZI[JK]L]MNO]')


    var cs_lsys5 = new lsys.LSystem({
      word: 'S][ED]CBA',
      productions: [
        ['S', (index, word) =>  ( cs_lsys5.match({direction: 'right', match: 'CB', index, branchSymbols: '[]'})) ? 'Z' : 'S']
      ]

    })
    // as required by ABOP S. 32 (reversed string)
    expect(cs_lsys5.iterate()).to.equal('Z][ED]CBA')

  })

    it('Context sensitive L-System helper function match() should work in L-Systems that don\'t use branches/brackets.', function() {
      var cs_lsys6 = new lsys.LSystem({
        word: 'A+++C-DE-+F&GH++-',
        productions: [
          ['C', (index, word) =>  ( cs_lsys6.match({direction: 'right', match: 'DEFG', index, ignoredSymbols: '+-&'})) ? 'Z' : 'C']
        ]
      })
      expect(cs_lsys6.iterate()).to.equal('A+++Z-DE-+F&GH++-')
    })
});
