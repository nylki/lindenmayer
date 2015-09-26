var chai = require("chai")
var chaiAsPromised = require("chai-as-promised")
var should = chai.should
chai.use(chaiAsPromised)
chai.use(should)

var lsys = require('../lindenmayer')

describe('Correct behavior of L-Systems', function() {


  it('should handle UTF8', function() {
    var test = new lsys.LSystem({
      word:'⚣⚤●',
      productions: [['⚣', '♂♂'], ['⚤', '♀♂'], ['●', '○◐◑']]
    })
    return (test.iterate()).should.eventually.equal('♂♂♀♂○◐◑')
  })




  it('should generate the string for the Koch-curve', function() {
    var koch = new lsys.LSystem({
      word: 'F++F++F',
      productions: [
        ['F', 'F-F++F-F']
      ]
    })

    return (koch.iterate(3)).should.eventually.equal('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F')

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

    return vizsys.iterate(2).then(vizsys.final()).then(() => vizsys.output).should.eventually.equal('//~/-##-#//~/-##-#~/-//~/-##-#-/##/-+--#+-/##/-+--#+--/##/-+--#+----')


  })


  it('Final functions must be functions. Should throw an error on any other type. Test for String here.', function() {
    var vizsys = new lsys.LSystem({
      word: 'A',
      productions: [['A', 'Z']],
      finals: [
        ['Z', 'A_STRING']
      ]
    })

    return vizsys.iterate().then(() => vizsys.final()).should.eventually.be.rejected
  })


  it('functions and strings should be usable as production.', function() {
    var funcprodsys = new lsys.LSystem({
      word:'AB',
      productions: [
        ['A', 'A+R'],
        ['B', () => { return 'BB'}],
        ['R', () => {
          if(funcprodsys.iterations > 2) {
            return 'R'
          } else {
            return 'RB'
          }
        }]
      ]
    })

    return funcprodsys.iterate(3).should.eventually.equal('A+R+RB+RBBBBBBBBBBB')
  })





});
