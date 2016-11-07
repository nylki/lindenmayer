
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


// TODO: implement it!
export function transformClassicParametricProduction (p) {
  return p;
};

// TODO: Scaffold classic parametric and context sensitive stuff out of main file
// And simply require it here, eg:
// this.testClassicParametricSyntax = require(classicSyntax.testParametric)??
export function testClassicParametricSyntax (axiom) {
  return (/\(.+\)/).test(axiom);
};

// transforms things like 'A(1,2,5)B(2.5)' to
// [ {symbol: 'A', params: [1,2,5]}, {symbol: 'B', params:[25]} ]
// strips spaces
export function transformClassicParametricAxiom (axiom) {

  // Replace whitespaces, then split between square brackets.
  let splitAxiom = axiom.replace(/\s+/g, '').split(/[\(\)]/);
  // console.log('parts:', splitAxiom)
  let newAxiom = [];
  // Construct new axiom by getting the params and symbol.
  for (let i = 0; i < splitAxiom.length-1; i+=2) {
    let params = splitAxiom[i+1].split(',').map(Number);
    newAxiom.push({symbol: splitAxiom[i], params:params});
  }
  // console.log('parsed axiom:', newAxiom)
};

// transform a classic syntax production into valid JS production
// TODO: Only work on first part pf production P[0]
// -> this.transformClassicCSCondition
export function transformClassicCSProduction (p, ignoredSymbols) {

  // before continuing, check if classic syntax actually there
  // example: p = ['A<B>C', 'Z']

  // left should be ['A', 'B']
  let left = p[0].match(/(.+)<(.)/);

  // right should be ['B', 'C']
  let right = p[0].match(/(.)>(.+)/);


  // Not a CS-Production (no '<' or '>'),
  //return original production.
  if(left === null && right === null) {
    return p;
  }

  // indexSymbol should be 'B' in A<B>C
  // get it either from left side or right side if left is nonexistent
  let indexSymbol = (left !== null) ? left[2] : right[1];


  // double check: make sure that the right and left match got the same indexSymbol (B)
  if(left !== null && right !== null && left[2] !== right[1]) {
    throw	new Error('index symbol differs in context sensitive production from left to right check.',
    left[2], '!==', right[1])
  }

    // finally build the new (valid JS) production
    // (that is being executed instead of the classic syntax,
    //  which can't be interpreted by the JS engine)
    let transformedFunction = ({index: _index, part: _part, currentAxiom: _axiom, params: _params}) => {

      let leftMatch = {result: true};
      let rightMatch = {result: true};

      // this can possibly be optimized (see: https://developers.google.com/speed/articles/optimizing-javascript#avoiding-pitfalls-with-closures)
      //


      if(left !== null){
        leftMatch = this.match({direction: 'left', match: left[1], index: _index, branchSymbols: '[]', ignoredSymbols: ignoredSymbols});
      }

      // don't match with right side if left already false or no right match necessary
      if(leftMatch.result === false || (leftMatch.result === true && right === null))
        return leftMatch.result ? p[1] : false;

      // see left!== null. could be optimized. Creating 3 variations of function
      // so left/right are not checked here, which improves speed, as left/right
      // are in a scope above.
      if(right !== null) {
        rightMatch = this.match({direction: 'right', match: right[2], index: _index, branchSymbols: '[]', ignoredSymbols: ignoredSymbols});
      }

      // Match! On a match return either the result of given production function
      // or simply return the symbol itself if its no function.
      if((leftMatch.result && rightMatch.result)) {
          return (typeof p[1] === 'function') ? p[1]({index: _index, part: _part, currentAxiom: _axiom, params: _params, leftMatchIndices: leftMatch.matchIndices, rightMatchIndices: rightMatch.matchIndices, ignoredSymbols: ignoredSymbols}) : p[1];
      } else {
        return false;
      }

    };

    let transformedProduction = [indexSymbol, transformedFunction];

    return transformedProduction;

};
