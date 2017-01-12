export function stringToObjects (string) {
  if(typeof string !== 'string' && string instanceof String === false) return string;
  let transformed = [];
  for (let symbol of string) transformed.push({symbol});
  return transformed;
}

// TODO: continue here
export function normalizeSuccessorArrays () {
  
}




// transform p to {successor: p}
// if applicable also transform strings into array of {symbol: String} objects
// TODO: make more modular! dont have forceObjects in here
function normalizeProductionRightSide (p, forceObjects) {
  
  if(p.hasOwnProperty('successors')) {
    for (var i = 0; i < p.successors.length; i++) {
      p.successors[i] = normalizeProductionRightSide(p.successors[i], forceObjects);
    }

  } else if(p.hasOwnProperty('successor') === false){
    p = { successor: p };
  }
  
  if(forceObjects && p.hasOwnProperty('successor')) {
    p.successor = stringToObjects(p.successor);
  }
  
  return p;
}

export function normalizeProduction (p, forceObjects) {

  p[1] = normalizeProductionRightSide(p[1], forceObjects);
  return p;
}
