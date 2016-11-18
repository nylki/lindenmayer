
// Get a list of productions that have identical initiators,
// Output a single stochastic production. Probability per production
// is defined by amount of input productions (4 => 25% each, 2 => 50% etc.)


// These transformers get a classic ABOP snytax as input and return a standardized
// production object in the form of ['F',
// {
//  successor:String/Iterable
//  [alternatively]stochasticSuccessors: Iterable of standardized objects with mandatory weight fields,
//  leftCtx: iterable/string,
//  rightCtx: Iterable/String,
//  condition: Function }]

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

  let predecessor;
  // create new production object _or_ use the one set by the user
  let productionObject = (p[1].hasOwnProperty('successor')) ? p[1] : {successor: p[1]};
  if(left !== null) {
    predecessor = left[2];
    productionObject.leftCtx = left[1];
  }
  if(right !== null){
    predecessor = right[1];
    productionObject.rightCtx = right[2];
  }


  return [predecessor, productionObject];

};
