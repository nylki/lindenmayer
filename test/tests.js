'use strict'

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
let expect = chai.expect;
chai.use(chaiAsPromised);

let LSystem = require('../dist/lindenmayer.js');

let test = new LSystem({
  axiom: 'F++F++F',
  productions: {
    'F': 'F-F++F-F'
  }});
test.transformClassicParametricAxiom('A (1, 2.5, 1234)  B(2, 3, 5)');

describe('Correct behavior of L-Systems', function() {

  it('should generate the string for the Koch-curve', function() {
    let koch = new LSystem({
      axiom: 'F++F++F',
      productions: {
        'F': 'F-F++F-F'
      }
    });

    expect(koch.iterate()).to.equal('F-F++F-F++F-F++F-F++F-F++F-F');

    expect(koch.iterate()).to.equal('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F');

    expect(koch.iterate()).to.equal('F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F-F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F');


    let axiomFromGenerator = koch.iterate();
    expect(axiomFromGenerator).to.equal(koch.axiom);
  });


  it('should execute final functions to draw eg. visualizations.', function() {
    let vizsys = new LSystem({
      axiom: 'A---',
      productions: {
        'A': 'AARA-BB-B',
        'B': 'ABBA-+--B+-',
        'R': 'RA-'
      },
      finals: {
        'A': () => {vizsys.output += '/'},
        'B': () => {vizsys.output += '#'},
        'R': () => {vizsys.output += '~'},
        '-': () => {vizsys.output += '-'},
        '+': () => {vizsys.output += '+'}
      }
    });

    vizsys.output = '';

    vizsys.iterate(2);
    vizsys.final();
    expect(vizsys.output).to.equal('//~/-##-#//~/-##-#~/-//~/-##-#-/##/-+--#+-/##/-+--#+--/##/-+--#+----');
  });

  it('Final functions must be functions. Should throw an error on any other type.', function() {
    let vizsys = new LSystem({
      axiom:'A',
      productions: {'A': 'Z'},
      finals: {'Z': 'A_STRING'}
    });

    expect(function () {
      vizsys.iterate();
      vizsys.final();
    }).to.throw(/not a function/);

    expect(function () {
      vizsys.finals.set('Z', 7);
      vizsys.final();
    }).to.throw(/not a function/);

    expect(function () {
      vizsys.finals.set('Z', new Date())
      vizsys.final()
    }).to.throw(/not a function/)

    let rotation = 5
    expect(function () {
      vizsys.finals.set('Z', () => {rotation *= 2});
      vizsys.final();
    }).to.not.throw(/not a function/);

    expect(rotation).to.equal(10);
  });


  it('Helper functions for context sensitive productions should work properly. Especially with branches.', function() {

    let cs_LSystem = new LSystem({
      axiom: 'ACBC[-Q]D--[A[FDQ]]E-+FC++G',
      productions: {
        'C': ({index, axiom}) => (cs_LSystem.match({direction: 'right', match: 'DEF', index}).result) ? 'Z' : 'C'
      },
      branchSymbols: '[]',
      ignoredSymbols: '+-/'
    });

    expect(cs_LSystem.iterate()).to.equal('ACBZ[-Q]D--[A[FDQ]]E-+FC++G');

  });

  it('Context sensitive L-System should work inside explicitly wanted branches', function() {
    // this example is taken from ABOP S. 32
    let cs_LSystem3 = new LSystem({
      axiom: 'ABC[DE][SG[HI[JK]L]MNO]',
      productions: {
        'S': ({index, axiom}) =>
          (cs_LSystem3.match({direction: 'right', match: 'G[H]M', index, branchSymbols: ['[', ']']}).result &&
          cs_LSystem3.match({direction: 'left', match: 'BC', index, branchSymbols: ['[', ']']}).result) ? 'Z' : 'S'
      }
    });
    expect(cs_LSystem3.iterate()).to.equal('ABC[DE][ZG[HI[JK]L]MNO]');


    let cs_LSystem4 = new LSystem({
      axiom: 'ABC[DE][FG[HI[JK]L]MNO]',
      productions: {
        'H': ({index, axiom}) =>  (
          cs_LSystem4.match({direction: 'right', match: 'I[K]L', index, branchSymbols: '[]'}).result)
          ? 'Z' : 'H'
        }

      })
      // I[K]L should not apply to I[JK]L
      expect(cs_LSystem4.iterate()).to.not.equal('ABC[DE][FG[ZI[JK]L]MNO]');


      let cs_LSystem5 = new LSystem({
        axiom: 'S][ED]CBA',
        productions: {
          'S': ({index}) =>  ( cs_LSystem5.match({direction: 'right', match: 'CB', index, branchSymbols: '[]'}).result) ? 'Z' : 'S'
        }

      });
      // as required by ABOP S. 32 (reversed string)
      expect(cs_LSystem5.iterate()).to.equal('Z][ED]CBA');

    });




    it('Context sensitive L-System helper function match() should work in L-Systems that don\'t use branches/brackets.', function() {
      let cs_LSystem6 = new LSystem({
        axiom: 'A+++C-DE-+F&GH++-',
        productions: {
          'C': ({index}) =>
          (cs_LSystem6.match({direction: 'right', match: 'DEFG', index, ignoredSymbols: '+-&'}).result) ? 'Z' : 'C'

      }
    });
    expect(cs_LSystem6.iterate()).to.equal('A+++Z-DE-+F&GH++-');
  });




  it('Classic context sensitive syntax should work.', function() {
    let cs_LSystem7 = new LSystem({
      axiom: 'A[X]BC',
      productions: {'A<B>C': 'Z'}
    });

    expect(cs_LSystem7.iterate()).to.equal('A[X]ZC');
  });

  it('Left side, classic CS should work.', function() {
    let cs_LSystem8 = new LSystem({
      axiom: 'ABC[DE][SG[HI[JK]L]MNO]',
      productions: {'BC<S': 'Z'}
    });
    expect(cs_LSystem8.iterate()).to.equal('ABC[DE][ZG[HI[JK]L]MNO]');
  });

  it('right side, classic CS should work.', function() {
    let cs_LSystem8 = new LSystem({
      axiom: 'ABC[DE][SG[HI[JK]L]MNO]',
      productions: {'S>G[H]M': 'Z'}
    });
    expect(cs_LSystem8.iterate()).to.equal('ABC[DE][ZG[HI[JK]L]MNO]');
  });


  it('Custom parametric L-Systems (that dont use `params`) should work.', function() {
    let custom_para_LSystem1 = new LSystem({
      axiom: [
        {symbol: 'A', x:1, y:0.5},
        {symbol: 'B', x:0, y:5},
        {symbol: 'C', x:0, y:2, foo: 'bar'},
        {symbol: 'C', x:0, y:2, foo: 'notbar'}
      ],
      productions: {
        'A': ({part}) => (part.x===1) ? {symbol: 'Z', x: 42} : part,
        'B': ({part}) => (part.y===5) ? {symbol: 'Z', x: 42} : part,
        'C': ({part}) => (part.foo === 'bar') ? {symbol: 'Z'} : part
      }
    });

    custom_para_LSystem1.iterate();
    expect(custom_para_LSystem1.getString()).to.equal('ZZZC');
  });

  it('Basic (normalized) parametric L-System structure should ge parsed.', function() {
    let para_LSystem1 = new LSystem({
      axiom: [
        {symbol: 'A'},
        {symbol: 'B'},
        {symbol: 'C', params: [3]},
        {symbol: 'D', params: [23, 42, 5]},
        {symbol: 'E'},
        {symbol: 'F'},
        {symbol: 'G', mehh:'foo'}
      ],
      productions: {
        'C': ({part, index, params:[x]}) => (x===3) ? {symbol: 'Z'} : part,
        'D': ({part, index, params:[x, y, z]}) => (y===42) ? {symbol: 'Z'} : part
      }
    });

    para_LSystem1.iterate();
    expect(para_LSystem1.getString()).to.equal('ABZZEFG');
  });


  it('Basic (normalized) parametric L-System structure should be useable with context sensitive match() function and return matched symbol objects. Manipulation of other symbols inside productions should (and can) only work for right side, as left side is already processed.', function() {
    let para_LSystem2 = new LSystem({
      axiom: [
        {symbol: 'A'},
        {symbol: 'B'},
        {symbol: 'C', params: [3]},
        {symbol: 'D', params: [23, 42, 5]},
        {symbol: 'E'},
        {symbol: 'F'},
        {symbol: 'G', mehh:'foo'}
      ],
      productions: {
        'B<C>D': ({index, currentAxiom, params:[x], leftMatchIndices, rightMatchIndices}) => {

          // Directly manipulating the matches (neighbors of current symbol) should work
          // by editing the symbol parameter of a neighbor. ONLY WORKS  ON THE RIGHT SIDE!

          // rightMatches[0].symbol = 'Z';
          currentAxiom[rightMatchIndices[0]] = {symbol: 'Z'};

          // The following manipulation should have no effect(!) as left
          // side has naturally already been processed by L-System:
          currentAxiom[leftMatchIndices[0]] = {symbol: 'X'};

          return {symbol: 'Y'};
        }
      }
    });

    para_LSystem2.iterate(5);

    expect(para_LSystem2.getString()).to.equal('ABYZEFG');
  });

  // When using functions, all additional info should be usable (index, part, currentAxiom, params)

  // it('Classic Parametric L-Systems should get parsed properly (strip whitespaces, tokenize into JS objects)', function() {
  //
  //   let classicParamLSystem = new LSystem({
  //     claasicParametricSyntax: true,
  //     axiom: 'A(1,2)  B(2, 3, 5)',
  //     productions: {
  //       'A(x,y)': (x,y) => `A(${x+1},${y})B(1,1,1)`,
  //       'B(x,y,z)': (x,y,z) => `B(${x*y*z},4,${x+y})B(0,1,1)`
  //     }
  //   })
  //
  //   classicParamLSystem.iterate(1)
  //   expect(classicParamLSystem.getString()).to.equal('ABZZEFG')
  // })

  // it('Parametric L-Systems should work. (ABOP, p.42)', function() {
  //   let para_LSystem2 = new LSystem({
  //     axiom: [
  //       {symbol: 'B', params: [2]},
  //       {symbol: 'A', params: [4, 4]}
  //     ],
  //     productions: [
  //       ['A', ([x, y]) => y<=3 ? {symbol: 'A', params: [x*2, x+y]} : 'A'],
  //       ['A', ([x, y]) => y>3 ?
  //         [{symbol: 'B', params: [x]},
  //          {symbol: 'A', params: [x/y, 0]}]: 'A'],
  //       ['B', ([x]) => x<1 ? {symbol: 'C'} : 'B'],
  //       ['B', ([x]) => x>=1 ? {symbol: 'B', params: [x-1]} : 'B']
  //     ]
  //   })
  //
  //   para_LSystem2.iterate()
  //   expect(para_LSystem2.getString()).to.equal('BBA')
  // })

  // it('Parametric L-Systems should work.', function() {
  //   let para_LSystem1 = new LSystem({
  //     axiom: [
  //       {symbol: 'A'},
  //       {symbol: 'B'},
  //       {symbol: 'C'},
  //       {symbol: 'D'},
  //       {symbol: 'E'},
  //       {symbol: 'F'},
  //       {symbol: 'G'}
  //     ],
  //     productions: [
  //       ['C', {symbol: 'Z'}]
  //     ]
  //   })
  //
  //   para_LSystem1.iterate()
  //   expect(para_LSystem1.getString()).to.equal('ABZDEFG')
  // })
  //
  // it('Classic parametric L-Systems should work.', function() {
  //   let para_LSystem3 = new LSystem({
  //     axiom: '',
  //     productions: [
  //       ['C', {symbol: 'Z'}]
  //     ]
  //   })
  //
  //   para_LSystem1.iterate()
  //   expect(para_LSystem1.getString()).to.equal('ABZDEFG')
  // })

  it('should handle UTF8', function() {
    let test = new LSystem({
      axiom:'⚣⚤●',
      productions: {
        '⚣': '♂♂',
        '⚤': '♀♂',
        '●': '○◐◑'
      }
    })
    expect(test.iterate()).to.equal('♂♂♀♂○◐◑')
  })

});
