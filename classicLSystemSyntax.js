
// Get a list of productions that have identical initiators,
// Output a single stochastic production. Probability per production
// is defined by amount of input productions (4 => 25% each, 2 => 50% etc.)

export function transformClassicStochasticProductions(productions) {

  return function transformedProduction () {
    let resultList = productions; // the parser for productions shall create this list
    let count = resultList.length;
    
    let r = Math.random();
    for(let i= 0; i < count; i++) {
      let range = (i+1) / count;
      if( r <= range) return resultList[i];
      
    }
    
    console.error('Should have returned a result of the list, something is wrong here with the random numbers?.');
  }

};
