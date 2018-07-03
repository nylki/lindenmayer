'use strict'

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
let expect = chai.expect;
chai.use(chaiAsPromised);

let LSystem = require('../../dist/lindenmayer.js');

describe('Stochastic tests. These tests could potentially fail, because of their stochastic nature. But the probability of them to fail is low. So rerun this test a few times anew if it should fail and compare the logged results ;)', function () {

  it('should transform classic stochastic syntax on demand.', function() {
    this.timeout(0);
    this.slow(Infinity);

    let lsystem  = new LSystem({
      axiom: 'F',
      productions: {
          'F': { successors:
          [
            {successor: 'AF', weight: 0.89},
            {successor: 'BF', weight: 0.1},
            {successor: 'CF', weight: 0.01}
          ]
        }
      }
    });

    lsystem.iterate(10000);
    let result = lsystem.getString();
    let sampleSums = new Map([['A', 0], ['B', 0], ['C', 0], ['F', 0]]);
    for (let symbol of result) {
      sampleSums.set(symbol, sampleSums.get(symbol) + 1);
    }


    console.log(sampleSums);
    expect(sampleSums.get('A') + sampleSums.get('B') + sampleSums.get('C')).to.equal(10000);

    expect(sampleSums.get('A')).to.be.at.within(7500, 9950);
    expect(sampleSums.get('B')).to.be.at.within(800, 1200);
    expect(sampleSums.get('C')).to.be.at.within(80, 120);
    expect(sampleSums.get('F')).to.equal(1);

  });
});
