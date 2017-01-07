export function stringToObjects (string) {
  if(typeof string !== 'string' && string instanceof String === false) return string;
  let transformed = [];
  for (let symbol of string) transformed.push({symbol});
  return transformed;
}

// TODO: continue here
//normalizeSuccessorArrays




// transform p[1] to {successor: p[1]}
// if applicable also transform strings into array of {symbol: String} objects
// TODO: make more modular! dont have forceObject in here
export function normalizeProduction (p, forceObject) {
  if(p[1].hasOwnProperty('successor') === false){

    p[1] = { successor: forceObject ? stringToObjects(p[1]) : p[1] };
  }
  return p;
}
