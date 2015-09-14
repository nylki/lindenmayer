
var expect = require('expect');
var lsys = require('../lindenmayer')

describe('Correct behavior of L-Systems', function() {


  it('should handle UTF8', function() {
    var test = new lsys.LSystem({
      word:'⚣⚤●',
      productions: [['⚣', '♂♂'], ['⚤', '♀♂'], ['●', '○◐◑']]
    })
    expect(test.next().value).toBe('♂♂♀♂○◐◑')
  })




  it('should generate the string for the Koch-curve', function() {
    var koch = new lsys.LSystem({
      word: 'F++F++F',
      productions: [
        ['F', 'F-F++F-F']
      ]
    })

    expect(koch.next().value).toBe('F-F++F-F++F-F++F-F++F-F++F-F')

    expect(koch.next().value).toBe('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F')

    expect(koch.next().value).toBe('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F')


    var wordFromGenerator = koch.next().value
    expect(wordFromGenerator).toBe(koch.word)
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
    expect(vizsys.output).toBe('//~/-##-#//~/-##-#~/-//~/-##-#-/##/-+--#+-/##/-+--#+--/##/-+--#+----')
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
      vizsys.next()
      vizsys.final()
    }).toThrow(/not a function/)

    expect(function () {
      vizsys.finals.set('Z', 7)
      vizsys.final()
    }).toThrow(/not a function/)

    expect(function () {
      vizsys.finals.set('Z', new Date())
      vizsys.final()
    }).toThrow(/not a function/)


    var rotation = 5
    expect(function () {
      vizsys.finals.set('Z', () => {rotation *= 2})
      vizsys.final()
    }).toNotThrow(/not a function/)

    expect(rotation).toBe(10)



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
      .toBeLessThan(11)
      .toBeGreaterThan(7)

    funcprodsys.next()
    expect(funcprodsys.word.length)
      .toBeLessThan(17)
      .toBeGreaterThan(12)



  })





});
