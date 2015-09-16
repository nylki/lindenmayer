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
    expect(test.next().value).to.equal('♂♂♀♂○◐◑')
  })




  it('should generate the string for the Koch-curve', function() {
    var koch = new lsys.LSystem({
      word: 'F++F++F',
      productions: [
        ['F', 'F-F++F-F']
      ]
    })

    expect(koch.next().value).to.equal('F-F++F-F++F-F++F-F++F-F++F-F')

    expect(koch.next().value).to.equal('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F')

    expect(koch.next().value).to.equal('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F')


    var wordFromGenerator = koch.next().value
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

    vizsys.next()
    return vizsys.final().should.eventually.be.rejected


    // vizsys.finals.set('Z', 7)
    // vizsys.final().should.equal.rejected
    //
    // vizsys.finals.set('Z', new Date())
    // vizsys.final().should.equal.rejected



    // var rotation = 5
    // expect(function () {
    //   vizsys.finals.set('Z', () => {rotation *= 2})
    //   vizsys.final()
    // }).toNotThrow(/not a function/)
    //
    // expect(rotation).to.equal(10)
    //
    //

  })


  it('functions and strings should be usable as production.', function() {
    var funcprodsys = new lsys.LSystem({
      word:'AB',
      productions: [
        ['A', 'A+R'],
        ['B', () => { return (Math.random() < 0.5) ? 'BB' : 'A'}],
        ['R', () => {
          if(funcprodsys.iterations > 2) {
            return 'R'
          } else {
            return 'RB'
          }
        }]
      ]
    })

    funcprodsys.iterate(2)
    expect(funcprodsys.word.length)
      .to.equalLessThan(11)
      .to.equalGreaterThan(7)

    funcprodsys.next()
    expect(funcprodsys.word.length)
      .to.equalLessThan(17)
      .to.equalGreaterThan(12)



  })





});
