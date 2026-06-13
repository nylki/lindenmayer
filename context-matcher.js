// context-matcher.js — Context-sensitive matching for L-Systems
// Extracted from lindenmayer.js for single responsibility:
// this module handles all context-sensitive neighbor matching logic.

/**
 * Initialize directional matching parameters based on match direction.
 * @param {string} direction - 'left' or 'right'
 * @param {number} index - Current position index in the axiom
 * @param {string} match - The pattern to match against
 * @param {string} branchSymbols - Branch symbol pair (e.g., '[]')
 * @returns {object} Directional parameters for matching
 */
export function initializeDirectionParams(direction, index, match, branchSymbols) {
  if (direction === 'right') {
    const [branchStart, branchEnd] = branchSymbols.length > 0 ? branchSymbols : [undefined, undefined];
    return {
      loopIndexChange: +1,
      matchIndexChange: +1,
      axiomIndex: index + 1,
      matchIndex: 0,
      matchIndexOverflow: match.length,
      branchStart,
      branchEnd
    };
  } else if (direction === 'left') {
    const [branchEnd, branchStart] = branchSymbols.length > 0 ? branchSymbols : [undefined, undefined];
    return {
      loopIndexChange: -1,
      matchIndexChange: -1,
      axiomIndex: index - 1,
      matchIndex: match.length - 1,
      matchIndexOverflow: -1,
      branchStart,
      branchEnd
    };
  } else {
    throw new Error(direction + ' is not a valid direction for matching.');
  }
}

/**
 * Extract the symbol character from an axiom part (string or object).
 * @param {*} part - An axiom element (string character or {symbol, params} object)
 * @returns {string} The symbol character
 */
export function extractSymbol(part) {
  return part.symbol || part;
}

/**
 * Match a context pattern against axiom neighbors.
 * Used for context-sensitive productions where a production applies
 * only when the left and/or right neighbors match a pattern.
 *
 * @param {object} params
 * @param {Array|string} params.axiom - The current axiom
 * @param {string} params.match - The pattern to match
 * @param {string} params.ignoredSymbols - Symbols to ignore during matching
 * @param {string} params.branchSymbols - Branch delimiters (e.g., '[]')
 * @param {number} params.index - Current position in the axiom
 * @param {string} params.direction - 'left' or 'right'
 * @returns {{result: boolean, matchIndices: number[]}}
 */
export function matchContextPattern({axiom, match, ignoredSymbols = '', branchSymbols = '[]', index, direction}) {
  let branchCount = 0;
  let explicitBranchCount = 0;
  const returnMatchIndices = [];

  const dirParams = initializeDirectionParams(direction, index, match, branchSymbols);
  let {
    loopIndexChange,
    matchIndexChange,
    axiomIndex,
    matchIndex,
    matchIndexOverflow,
    branchStart,
    branchEnd
  } = dirParams;

  for (; axiomIndex < axiom.length && axiomIndex >= 0; axiomIndex += loopIndexChange) {
    const axiomSymbol = extractSymbol(axiom[axiomIndex]);
    const matchSymbol = match[matchIndex];

    if (axiomSymbol === matchSymbol) {
      if (branchCount === 0 || explicitBranchCount > 0) {
        if (axiomSymbol === branchStart) {
          explicitBranchCount++;
          branchCount++;
          matchIndex += matchIndexChange;
        } else if (axiomSymbol === branchEnd) {
          explicitBranchCount = Math.max(0, explicitBranchCount - 1);
          branchCount = Math.max(0, branchCount - 1);
          if (explicitBranchCount === 0) {
            matchIndex += matchIndexChange;
          }
        } else {
          returnMatchIndices.push(axiomIndex);
          matchIndex += matchIndexChange;
        }
      }

      if (matchIndex === matchIndexOverflow) {
        return {result: true, matchIndices: returnMatchIndices};
      }
    } else if (axiomSymbol === branchStart) {
      branchCount++;
      if (explicitBranchCount > 0) explicitBranchCount++;
    } else if (axiomSymbol === branchEnd) {
      branchCount = Math.max(0, branchCount - 1);
      if (explicitBranchCount > 0) explicitBranchCount = Math.max(0, explicitBranchCount - 1);
    } else if (
      (branchCount === 0 || (explicitBranchCount > 0 && matchSymbol !== branchEnd)) &&
      ignoredSymbols.includes(axiomSymbol) === false
    ) {
      return {result: false, matchIndices: returnMatchIndices};
    }
  }

  return {result: false, matchIndices: returnMatchIndices};
}
