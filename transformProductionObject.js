
// Get a list of productions that have identical initiators,
// Output a single stochastic production. Probability per production
// is defined by amount of input productions (4 => 25% each, 2 => 50% etc.)

var hasWeight = el => el.weight !== undefined;

export function transformProductionObject(p, ignoredSymbols) {

  let predecessor = p[0];
  let productionObject = p[1];
  // before continuing, check if classic syntax actually there
  // example: p = {'B', leftCtx: 'A', rightCtx: 'B' successor:'Z'}
  let successor = productionObject.successor;
  // left should be ['A', 'B']
  let left = productionObject.leftCtx;
  // right should be ['B', 'C']
  let right = productionObject.rightCtx;
  let condition = productionObject.condition;

  let contextSensitive = (left !== undefined || right !== undefined);
  let conditional = productionObject.condition !== undefined;
  let stochastic = false;



  if(successor[Symbol.iterator] !== undefined && typeof successor !== 'string' && !(successor instanceof String)) {
    stochastic = successor.every(hasWeight);
    if(!stochastic && successor.some(hasWeight)) {
      console.warn('You defined a successor list with weigths on some productions but not all!\nTreating list as _non_ stochastic!');
    }
  }

  // Not a CS-Production (no '<' or '>'),
  //return original production.
  if(contextSensitive === false && conditional === false) {
    return (typeof successor === 'function') ? successor({index: _index, part: _part, currentAxiom: _axiom, params: _params, ignoredSymbols: ignoredSymbols}) : successor;
  }

    // finally build the new (valid JS) production
    // (that is being executed instead of the classic syntax,
    //  which can't be interpreted by the JS engine)
    let transformedFunction = ({index: _index, part: _part, currentAxiom: _axiom, params: _params}) => {

      if(conditional && condition() === false) {
        return false;
      }

      if(contextSensitive) {

        let leftMatch = {result: true};
        let rightMatch = {result: true};

        // this can possibly be optimized (see: https://developers.google.com/speed/articles/optimizing-javascript#avoiding-pitfalls-with-closures)
        //


        if(left !== undefined){
          leftMatch = this.match({direction: 'left', match: left, index: _index, branchSymbols: '[]', ignoredSymbols: ignoredSymbols});
        }

        // don't match with right side if left already false or no right match necessary
        if((leftMatch.result === true && right === undefined))
          return (typeof successor === 'function') ? successor({index: _index, part: _part, currentAxiom: _axiom, params: _params, leftMatchIndices: leftMatch.matchIndices, rightMatchIndices: rightMatch.matchIndices, ignoredSymbols: ignoredSymbols}) : successor;
        if(leftMatch.result === false)
          return false;

        // see left!== null. could be optimized. Creating 3 variations of function
        // so left/right are not checked here, which improves speed, as left/right
        // are in a scope above.
        if(right !== undefined) {
          rightMatch = this.match({direction: 'right', match: right, index: _index, branchSymbols: '[]', ignoredSymbols: ignoredSymbols});
        }

        // Match! On a match return either the result of given production function
        // or simply return the symbol itself if its no function.
        if((leftMatch.result && rightMatch.result)) {
            return (typeof successor === 'function') ? successor({index: _index, part: _part, currentAxiom: _axiom, params: _params, leftMatchIndices: leftMatch.matchIndices, rightMatchIndices: rightMatch.matchIndices, ignoredSymbols: ignoredSymbols}) : successor;
        } else {
          return false;
        }
        return false;

      }





    };

    let transformedProduction = [predecessor, transformedFunction];

    return transformedProduction;

};
