// lindenmayer.js — L-System core class
// Refactored from a monolithic 439-line file into focused modules:
//   - axiom-utils.js: Axiom initialization and string representation
//   - context-matcher.js: Context-sensitive neighbor matching
//   - production-evaluator.js: Production condition checking and successor evaluation
//
// Naming improvements in this refactor:
//   - getRaw()        → getAxiomRaw()
//   - getString()     → getStringRepresentation()
//   - setFinal()      → setFinalFunction()
//   - setFinals()     → setFinalFunctions()
//   - final()         → executeFinals()
//   - applyProductions() → applyProductionsOnce()
//   - getProductionResult() → split into evaluatePrecheck() + evaluateMultiSuccessor()

import './polyfills/objectEntries';
import {
  transformClassicStochasticProductions,
  transformClassicCSProduction,
  transformClassicParametricAxiom,
  testClassicParametricSyntax
} from './transformersClassicSyntax';
import { normalizeProduction } from './transformers';
import { initializeAxiom, getAxiomRaw, getStringRepresentation } from './axiom-utils.js';
import { evaluatePrecheck, evaluateMultiSuccessor, appendResultToAxiom } from './production-evaluator.js';
import { matchContextPattern as resolveContextPattern } from './context-matcher.js';

export default class LSystem {
  constructor({
    axiom = '',
    productions,
    finals,
    branchSymbols = '[]',
    ignoredSymbols = '+-&^/|\\',
    allowClassicSyntax = true,
    classicParametricSyntax = false,
    forceObjects = false,
    debug = false
  }) {
    this.ignoredSymbols = ignoredSymbols;
    this.debug = debug;
    this.branchSymbols = branchSymbols;
    this.allowClassicSyntax = allowClassicSyntax;
    this.classicParametricSyntax = classicParametricSyntax;
    this.forceObjects = forceObjects;

    this.setAxiom(axiom);

    this.clearProductions();
    if (productions) this.setProductions(productions);
    if (finals) this.setFinalFunctions(finals);
  }

  // ─── Axiom Management ──────────────────────────────────────────────────────

  setAxiom(axiom) {
    this.axiom = initializeAxiom(axiom, this.forceObjects);
  }

  getAxiomRaw() {
    return getAxiomRaw(this.axiom);
  }

  /**
   * @deprecated Use getAxiomRaw() instead. Kept for backward compatibility.
   */
  getRaw() {
    return this.getAxiomRaw();
  }

  getStringRepresentation(onlySymbols = true) {
    return getStringRepresentation(this.axiom, onlySymbols);
  }

  /**
   * @deprecated Use getStringRepresentation() instead. Kept for backward compatibility.
   */
  getString(onlySymbols = true) {
    return this.getStringRepresentation(onlySymbols);
  }

  // ─── Production Management ─────────────────────────────────────────────────

  setProduction(from, to, allowAppendingMultiSuccessors = false) {
    let newProduction = [from, to];

    if (newProduction === undefined) {
      throw new Error('no production specified.');
    }

    if (to.successor && to.successors) {
      throw new Error('You can not have both a "successor" and a "successors" field in your production!');
    }

    // Apply production transformers and normalizations
    if (this.allowClassicSyntax === true) {
      newProduction = transformClassicCSProduction(newProduction);
    }

    newProduction = normalizeProduction(newProduction, this.forceObjects);

    // Mark whether production is stochastic (all successors have weights)
    newProduction[1].isStochastic =
      newProduction[1].successors !== undefined &&
      newProduction[1].successors.every(successor => successor.weight !== undefined);

    if (newProduction[1].isStochastic) {
      // Calculate total weight sum for stochastic selection
      newProduction[1].weightSum = 0;
      for (const successor of newProduction[1].successors) {
        newProduction[1].weightSum += successor.weight;
      }
    }

    const symbol = newProduction[0];
    if (allowAppendingMultiSuccessors === true && this.productions.has(symbol)) {
      let existingProduction = this.productions.get(symbol);
      const singleSuccessor = existingProduction.successor;
      const multiSuccessors = existingProduction.successors;

      if (singleSuccessor && !multiSuccessors) {
        // Promote existing single successor to a successors array
        existingProduction = {successors: [existingProduction]};
      }
      existingProduction.successors.push(newProduction[1]);
      this.productions.set(symbol, existingProduction);
    } else {
      this.productions.set(symbol, newProduction[1]);
    }
  }

  setProductions(newProductions) {
    if (newProductions === undefined) throw new Error('no production specified.');
    this.clearProductions();

    for (const [from, to] of Object.entries(newProductions)) {
      this.setProduction(from, to, true);
    }
  }

  clearProductions() {
    this.productions = new Map();
  }

  // ─── Final Function Management ─────────────────────────────────────────────

  setFinalFunction(symbol, final) {
    if (final === undefined) {
      throw new Error('no final specified.');
    }
    this.finals.set(symbol, final);
  }

  setFinalFunctions(newFinals) {
    if (newFinals === undefined) throw new Error('no finals specified.');
    this.finals = new Map();
    for (const symbol in newFinals) {
      if (newFinals.hasOwnProperty(symbol)) {
        this.setFinalFunction(symbol, newFinals[symbol]);
      }
    }
  }

  /**
   * @deprecated Use setFinalFunction() instead. Kept for backward compatibility.
   */
  setFinal(symbol, final) {
    return this.setFinalFunction(symbol, final);
  }

  /**
   * @deprecated Use setFinalFunctions() instead. Kept for backward compatibility.
   */
  setFinals(newFinals) {
    return this.setFinalFunctions(newFinals);
  }

  // ─── Production Result Evaluation ──────────────────────────────────────────

  getProductionResult(production, index, part, params, recursive = false) {
    const precheckPassed = evaluatePrecheck(
      production, index, part, params,
      this.axiom, this.branchSymbols, this.ignoredSymbols
    );

    if (!precheckPassed) {
      return recursive ? false : part;
    }

    let result = false;

    if (production.successors) {
      result = evaluateMultiSuccessor(
        production, index, part, params,
        (successor, idx, prt, prms) =>
          this.getProductionResult(successor, idx, prt, prms, true)
      );
    } else if (typeof production.successor === 'function') {
      result = production.successor({index, currentAxiom: this.axiom, part, params});
    } else {
      result = production.successor;
    }

    if (!result) {
      return recursive ? result : part;
    }
    return result;
  }

  // ─── Iteration ─────────────────────────────────────────────────────────────

  applyProductionsOnce() {
    let newAxiom = (typeof this.axiom === 'string') ? '' : [];
    let index = 0;

    for (const part of this.axiom) {
      const symbol = part.symbol || part;
      const params = part.params || [];

      let result = part;
      if (this.productions.has(symbol)) {
        const production = this.productions.get(symbol);
        result = this.getProductionResult(production, index, part, params);
      }

      newAxiom = appendResultToAxiom(newAxiom, result);
      index++;
    }

    this.axiom = newAxiom;
    return newAxiom;
  }

  /**
   * @deprecated Use applyProductionsOnce() instead. Kept for backward compatibility.
   */
  applyProductions() {
    return this.applyProductionsOnce();
  }

  iterate(n = 1) {
    this.iterations = n;
    let lastIteration;
    for (let iteration = 0; iteration < n; iteration++) {
      lastIteration = this.applyProductionsOnce();
    }
    return lastIteration;
  }

  // ─── Final Execution ───────────────────────────────────────────────────────

  executeFinals(externalArg) {
    let index = 0;
    for (const part of this.axiom) {
      const symbol = (typeof part === 'object' && part.symbol) ? part.symbol : part;

      if (this.finals.has(symbol)) {
        const finalFunction = this.finals.get(symbol);
        const functionType = typeof finalFunction;
        if (functionType !== 'function') {
          throw Error('\'' + symbol + '\'' +
            ' has an object for a final function. But it is __not a function__ but a ' +
            functionType + '!');
        }
        finalFunction({index, part}, externalArg);
      }
      index++;
    }
  }

  /**
   * @deprecated Use executeFinals() instead. Kept for backward compatibility.
   */
  final(externalArg) {
    return this.executeFinals(externalArg);
  }

  // ─── Context Matching ──────────────────────────────────────────────────────

  /**
   * Match a context pattern against axiom neighbors.
   * Delegates to the extracted matchContextPattern function.
   *
   * @param {object} params - {axiom_, match, ignoredSymbols, branchSymbols, index, direction}
   * @returns {{result: boolean, matchIndices: number[]}}
   */
  match({axiom_, match, ignoredSymbols, branchSymbols, index, direction}) {
    const axiom = axiom_ || this.axiom;
    const resolvedBranchSymbols = branchSymbols !== undefined ? branchSymbols : this.branchSymbols;
    const resolvedIgnoredSymbols = ignoredSymbols !== undefined ? ignoredSymbols : this.ignoredSymbols;

    return resolveContextPattern({
      axiom,
      match,
      ignoredSymbols: resolvedIgnoredSymbols,
      branchSymbols: resolvedBranchSymbols,
      index,
      direction
    });
  }
}

// ─── Static API (backward compatible) ────────────────────────────────────────

LSystem.getStringResult = LSystem.getStringRepresentation;
LSystem.transformClassicStochasticProductions = transformClassicStochasticProductions;
LSystem.transformClassicCSProduction = transformClassicCSProduction;
LSystem.transformClassicParametricAxiom = transformClassicParametricAxiom;
LSystem.testClassicParametricSyntax = testClassicParametricSyntax;
