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
// TODO: make more modular! dont have forceObject in here
export function normalizeProductionRightSide (p, forceObject) {
  
  if(p.hasOwnProperty('successors')) {
    for (var i = 0; i < p.successors.length; i++) {
      p.successors[i] = normalizeProductionRightSide(p.successors[i], forceObject);
    }

  } else if(p.hasOwnProperty('successor') === false){
    p = { successor: forceObject ? stringToObjects(p) : p };

  }
  return p;
}

export function normalizeProduction (p, forceObject) {
  p[1] = normalizeProductionRightSide(p[1]);
  return p;
}
