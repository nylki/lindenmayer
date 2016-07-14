
// Get a list of productions that have identical initiators,
// Output a single stochastic production. Probability per production
// is defined by amount of input productions (4 => 25% each, 2 => 50% etc.)
export function transformClassicStochasticProductions(productions) {

  let transformedProduction = function () {
    let resultList = productions; // the parser for productions shall create this list
    let count = resultList.length;
    let range = 0;
    let r = Math.random();
    for(let i= 1; i <= count; i++) {
      range += i/count;
      if( r <= range) return resultList[i];
    }
    console.error('Should have returned a result of the list, something is wrong here with the random numbers?.');
  }

};
