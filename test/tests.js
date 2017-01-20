'use strict'

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
let expect = chai.expect;
chai.use(chaiAsPromised);

let LSystem = require('../dist/lindenmayer.js');


describe('Basic String based L-Systems', function() {
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
  });

});





describe('String based L-Systems with additional context-sensitive classic ABOP syntax productions', function() {

it('Classic context sensitive syntax should work.', function() {
    let cs_LSystem7 = new LSystem({
      axiom: 'A[X]BC',
      productions: {'A<B>C': 'Z'}
    });

    expect(cs_LSystem7.iterate()).to.equal('A[X]ZC');
  });

  it('Classic context sensitive syntax should work when not ignoring them', function() {
    let cs_LSystem7b = new LSystem({
      axiom: 'FFB-+FF',
      productions: {
        'B-<F': 'Z'
      },
      ignoredSymbols: '+'
    });

    expect(cs_LSystem7b.iterate()).to.equal('FFB-+ZF');
  });


  it('Left side, classic CS should work.', function() {
    let cs_LSystem8 = new LSystem({
      axiom: 'A+B+C[DE][-S-G[HI[JK]L-]M-NO]',
      productions: {'BC<S': 'Z'},
      ignoredSymbols: '+-'
    });
    expect(cs_LSystem8.iterate()).to.equal('A+B+C[DE][-Z-G[HI[JK]L-]M-NO]');
  });

  it('multiple CS production on the same base symbol should work.', function () {
    // TODO to FIX: push individual prods of one symbo into successors instead of single successor
    let cs_LSystemMulti = new LSystem({
      axiom: 'ABCDEFGHI',
      productions: {
        'B<B>C': 'N',
        'A<B>C': 'Y',
        'A<B>D': 'N',
        'G>HIJ': 'N',
        'G>HI': 'Y',
        'A<A': 'N',
        'A>C': 'N',
        'A': 'Y'
      }
    });
    expect(cs_LSystemMulti.iterate()).to.equal('YYCDEFYHI');


  });



  it('right side, classic CS should work.', function() {
    let cs_LSystem8 = new LSystem({
      axiom: 'ABC[DE][SG[HI[JK]L]MNO]',
      productions: {'S>G[H]M': 'Z'}
    });
    expect(cs_LSystem8.iterate()).to.equal('ABC[DE][ZG[HI[JK]L]MNO]');
  });

});






describe('Final functions', function() {
  it('Final functions must be functions. Should throw an error on any other type.', function() {
    let vizsys = new LSystem({
      axiom: 'A',
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
});


  describe('L-Systems with function productions', function () {
    it('Helper functions for context sensitive productions should work properly. Especially with branches.', function() {

      let cs_LSystem = new LSystem({
        axiom: 'ACBC[-Q]D--[A[FDQ]]E-+FC++G',
        productions: {
          'C': ({index, axiom}) => (cs_LSystem.match({direction: 'right', match: 'DEF', index}).result) ? 'Z' : 'C'
        },
        branchSymbols: '[]',
        ignoredSymbols: '+-'
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


  });




describe('L-System with multiple successors in production', function () {
  it('lists in successors should work', function () {
    let cs_LSystemMulti = new LSystem({
          axiom: 'ABCDEFGHI',
          productions: {
            'E': {successors: ['X', 'Y', 'Z']},
            'B': {successors: [
              () => false,
              () => false,
              () => 'X',
              () => false
            ]},
            'C': {successors: [
              () => false,
              () => 'X'
            ]}
        }
        });
    expect(cs_LSystemMulti.iterate()).to.equal('AXXDXFGHI');


  });
  
  it('Having both "successor" and "successors" field should throw error', function () {
    let cs_LSystemMulti = new LSystem({
          axiom: 'A'
      });
    expect(
      cs_LSystemMulti.setProduction.bind(cs_LSystemMulti.setProduction, 'A', {
        successors: [  {successor: 'A'}, {successor: 'B'}],
        successor: 'C'
      })
    ).to.throw(/You can not have both a "successor" and a "successors"/);


  });

});


describe('Parametric L-Systems: custom Objects as symbols with function productions', function () {

  it('Basic (normalized) parametric L-System structure should get parsed.', function() {
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

  it('Parametric L-Systems (that dont use `params`) should work.', function() {
    let custom_para_LSystem1 = new LSystem({
      axiom: [
        {symbol: 'A', x: 1, y: 0.5},
        {symbol: 'B', x: 0, y: 5},
        {symbol: 'C', x: 0, y: 2, foo: 'bar'},
        {symbol: 'C', x: 0, y: 2, foo: 'notbar'}
      ],
      productions: {
        'A': ({part}) => (part.x === 1) ? {symbol: 'Z', x: 42} : part,
        'B': ({part}) => (part.y === 5) ? {symbol: 'Z', x: 42} : part,
        'C': ({part}) => (part.foo === 'bar') ? {symbol: 'Z'} : part
      }
    });

    custom_para_LSystem1.iterate();
    expect(custom_para_LSystem1.getString()).to.equal('ZZZC');
  });

  it('Basic (normalized) parametric L-System structure should be useable with classic context sensitive syntax and return matched symbol objects.', function() {
    let para_LSystem2 = new LSystem({
      axiom: [
        {symbol: 'A'},
        {symbol: 'B'},
        {symbol: 'C', params: [3]},
        {symbol: 'D', params: [2, 4, 6]},
        {symbol: 'E', params: [1]},
        {symbol: 'F'},
        {symbol: 'G', mehh: 'foo'}
      ],
      productions: {
        'B<C>D': ({index, currentAxiom, params: [x]}) => {
          if(x === 3) return {symbol: 'Y'}
        },
        'D>E': ({index, currentAxiom, params: [x,y,z]}) => {
          if(x + y === z) return {symbol: 'Z'}
        },
        'E>FG': ({index, currentAxiom, params: [x]}) => {
          if(x > 1) return {symbol: 'W'} // is false therefore: should return nothing and produce the originator/left-hand-side (E)
        }
      }
    });

    para_LSystem2.iterate(5);

    expect(para_LSystem2.getString()).to.equal('ABYZEFG');
  });

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



describe('L-Systems with Object based productions', function() {

  it('Axiom === String; Production LHS === String; Production RHS === Object', function() {
    let lsystem = new LSystem({});
    lsystem.setAxiom('F+F-F');
    lsystem.setProduction('F', {successor: 'FF'});
    lsystem.iterate(2);
    expect(lsystem.getString()).to.equal('FFFF+FFFF-FFFF');
  });

  it('Axiom === Object; Production LHS === String; Production RHS === Object', function() {
    let lsystem = new LSystem({axiom: [{symbol: 'F'}], forceObjects: true});
    lsystem.setProduction('F', {successor: 'FF'});
    lsystem.iterate(2);
    console.log(lsystem.getString());
    // check wether internal axiom is actually converted to objects
    expect(lsystem.axiom[2]).to.have.property('symbol');
    expect(lsystem.getString()).to.equal('FFFF');
  });

  it('Successor can also be a function', function() {
    let lsystem = new LSystem({axiom: 'ABBC'});
    lsystem.setProduction('B', {
      successor: ({index}) => (index > 1) ? 'BXB' : false}
    );
    lsystem.iterate(2);
    expect(lsystem.getString()).to.equal('ABBXBXBXBC');
  });

  it('Successor can also be an Objects', function() {
    let lsystem = new LSystem({axiom: 'ABBC', forceObjects: true});
    lsystem.setProduction('B', {
      successor: {symbol: 'X', testValue: 23}
    });

    lsystem.iterate(1);
    expect(lsystem.getString()).to.equal('AXXC');
    expect(lsystem.axiom[0]).to.not.have.property('testValue');
    expect(lsystem.axiom[2].testValue).to.equal(23);
  });

  it('Successor can also be an Array of Objects', function() {
    let lsystem = new LSystem({axiom: 'ABBC', forceObjects: true});
    lsystem.setProduction('B', {
      successor: [{symbol: 'Y'}, {symbol: 'Z', testValue: true}, {symbol: '+'}]
    });

    lsystem.iterate(1);
    expect(lsystem.getString()).to.equal('AYZ+YZ+C');
    expect(lsystem.axiom[2].testValue).to.equal(true);
    expect(lsystem.axiom[5].testValue).to.equal(true);
    expect(lsystem.axiom[4]).to.not.have.property('testValue');
  });


  it('Left context should work', function() {
    let lsystem = new LSystem({axiom: 'AB[CD]EFGH'});
    lsystem.setProduction('G', {leftCtx: 'FF', successor: 'BEF'});
    lsystem.setProduction('F', {leftCtx: 'BE', successor: 'FF'});

    lsystem.iterate(2);
    // check wether internal axiom is actually converted to objects
    //expect(lsystem.axiom[2]).to.have.property('symbol');
    expect(lsystem.getString()).to.equal('AB[CD]EFFFBEFH');
  });

  it('right context should work', function() {
    let lsystem = new LSystem({axiom: 'HGFE[DC]BA'});
    lsystem.setProduction('F', {rightCtx: 'EB', successor: 'FF'});
    lsystem.setProduction('G', {rightCtx: 'FF', successor: 'FEB'});
    lsystem.iterate(3);
    // check wether internal axiom is actually converted to objects
    //expect(lsystem.axiom[2]).to.have.property('symbol');
    expect(lsystem.getString()).to.equal('HFFEBFFFFE[DC]BA');
  });

  it('condition should work', function() {
    let step = 0.0;
    let lsystem = new LSystem({axiom: 'F'});
    lsystem.setProduction('F', { condition: () => step > 2, successor: 'FF'});

    for (var i = 0; i < 5; i++) {
      step += 1;
      lsystem.iterate();
    }
    expect(lsystem.getString()).to.equal('FFFFFFFF');
  });

  it('condition be able to utilize parameters', function() {
    let step = 0.0;
    let lsystem = new LSystem({axiom: [
      {symbol: 'F', params: [0, 3]},
      {symbol: '+'},
      {symbol: 'F', params: [3, 4]}
    ]});
    
    lsystem.setProduction('F', {
      // a condition has to return a bool
      condition: ({params:[a,b]}) => a > 0 && b === 4,
      successor: {symbol: 'XYZ'}
    });
      
    lsystem.iterate();
    expect(lsystem.getString()).to.equal('F+XYZ');
  });
  

});



  // setProduction('B', {
  //     /* set a basic condition*/
  //     condition: () => time > 1.0,
  //     leftCtx: 'FFB',
  //     rightCtx: '+B',
  //     successor: 'BB' /* which would internally get transformed to the equivalent object: {symbol: 'BB', weight: 1}*/
  // });
  //
  // // Or with explicit classicSyntax option this may be allowed:
  //
  // setClassicProduction('FFB<B>+B', {
  //     /* set a basic condition*/
  //     condition: () => time > 1.0,
  //     successor: 'BB' /* which would internally get transformed to the equivalent object: {symbol: 'BB', weight: 1}*/
  // });
  //
  // //or something like:
  //
  // setProduction('FFB<B>+B', {
  //     allowClassicSyntax: true,
  //     /* set a basic condition*/
  //     condition: () => time > 1.0,
  //     successor: 'BB' /* which would internally get transformed to the equivalent object: {symbol: 'BB', weight: 1}*/
  // });
