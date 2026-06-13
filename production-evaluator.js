// production-evaluator.js — Production evaluation and application logic
// Extracted from lindenmayer.js for single responsibility:
// this module handles checking conditions, contexts, and evaluating production successors.

import { matchContextPattern, extractSymbol } from './context-matcher.js';

/**
 * Check if a context-sensitive production's left/right context matches.
 * @param {object} production - The production object with optional leftCtx/rightCtx
 * @param {number} index - Current position in the axiom
 * @param {Array|string} axiom - The current axiom
 * @param {string} branchSymbols - Branch delimiters
 * @param {string} ignoredSymbols - Symbols to ignore during context matching
 * @returns {boolean} Whether the context matches
 */
export function checkContextMatch(production, index, axiom, branchSymbols, ignoredSymbols) {
  const hasLeftCtx = production.leftCtx !== undefined;
  const hasRightCtx = production.rightCtx !== undefined;

  if (hasLeftCtx && hasRightCtx) {
    return matchContextPattern({
      axiom, match: production.leftCtx, index, direction: 'left',
      branchSymbols, ignoredSymbols
    }).result && matchContextPattern({
      axiom, match: production.rightCtx, index, direction: 'right',
      branchSymbols, ignoredSymbols
    }).result;
  } else if (hasLeftCtx) {
    return matchContextPattern({
      axiom, match: production.leftCtx, index, direction: 'left',
      branchSymbols, ignoredSymbols
    }).result;
  } else if (hasRightCtx) {
    return matchContextPattern({
      axiom, match: production.rightCtx, index, direction: 'right',
      branchSymbols, ignoredSymbols
    }).result;
  }
  return true;
}

/**
 * Evaluate a stochastic or multi-successor production.
 * Picks a successor based on weight distribution (stochastic) or
 * evaluates each successor until one returns a valid result.
 * @param {object} production - The production with successors array
 * @param {number} index - Current position in the axiom
 * @param {*} part - The current axiom part
 * @param {Array} params - Parameters for parametric productions
 * @param {Function} evaluateRecursively - Callback to evaluate a successor recursively
 * @returns {*} The production result, or false if no successor matched
 */
export function evaluateMultiSuccessor(production, index, part, params, evaluateRecursively) {
  let currentWeight, threshWeight;
  if (production.isStochastic) {
    threshWeight = Math.random() * production.weightSum;
    currentWeight = 0;
  }

  for (const successor of production.successors) {
    if (production.isStochastic) {
      currentWeight += successor.weight;
      if (currentWeight < threshWeight) continue;
    }
    const result = evaluateRecursively(successor, index, part, params);
    if (result !== undefined && result !== false) {
      return result;
    }
  }
  return false;
}

/**
 * Evaluate a single production's precheck conditions (condition + context).
 * Returns true if the production should proceed, false otherwise.
 * @param {object} production - The production object
 * @param {number} index - Current position
 * @param {*} part - Current axiom part
 * @param {Array} params - Parameters
 * @param {Array|string} axiom - The current axiom
 * @param {string} branchSymbols - Branch delimiters
 * @param {string} ignoredSymbols - Symbols to ignore
 * @returns {boolean} Whether the production passes precheck
 */
export function evaluatePrecheck(production, index, part, params, axiom, branchSymbols, ignoredSymbols) {
  const isConditional = production.condition !== undefined;
  const isContextSensitive = production.leftCtx !== undefined || production.rightCtx !== undefined;

  if (isConditional && production.condition({index, currentAxiom: axiom, part, params}) === false) {
    return false;
  }

  if (isContextSensitive) {
    return checkContextMatch(production, index, axiom, branchSymbols, ignoredSymbols);
  }

  return true;
}

/**
 * Append a production result to the new axiom being built.
 * Handles string concatenation, array spreading, and single-element pushing.
 * @param {*} newAxiom - The axiom being built (string or array)
 * @param {*} result - The production result to append
 * @returns {*} The updated new axiom
 */
export function appendResultToAxiom(newAxiom, result) {
  if (typeof newAxiom === 'string') {
    return newAxiom + result;
  } else if (result instanceof Array) {
    newAxiom.push(...result);
    return newAxiom;
  } else {
    newAxiom.push(result);
    return newAxiom;
  }
}
