
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




  it('should generate the Koch-curve', function() {
    var koch = new lsys.LSystem({
      word:'F',
      productions: [['F', 'F+F--F+F']]
    })

    expect(koch.next().value).toBe('F+F--F+F')
    expect(koch.next().value).toBe('F+F--F+F+F+F--F+F--F+F--F+F+F+F--F+F')
    expect(koch.next().value).toBe('F+F--F+F+F+F--F+F--F+F--F+F+F+F--F+F+F+F--F+F+F+F--F+F--F+F--F+F+F+F--F+F--F+F--F+F+F+F--F+F--F+F--F+F+F+F--F+F+F+F--F+F+F+F--F+F--F+F--F+F+F+F--F+F')
  })



});
