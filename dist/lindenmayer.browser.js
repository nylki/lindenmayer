(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.LSystem = factory());
}(this, (function () { 'use strict';

  {
    if (!Object.entries) {
      Object.entries = function (obj) {
        var ownProps = Object.keys(obj),
            i = ownProps.length,
            resArray = new Array(i); // preallocate the Array

        while (i--) {
          resArray[i] = [ownProps[i], obj[ownProps[i]]];
        }

        return resArray;
      };
    }
  }

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
  function transformClassicStochasticProductions(productions) {
    return function transformedProduction() {
      var resultList = productions; // the parser for productions shall create this list

      var count = resultList.length;
      var r = Math.random();

      for (var i = 0; i < count; i++) {
        var range = (i + 1) / count;
        if (r <= range) return resultList[i];
      }

      console.error('Should have returned a result of the list, something is wrong here with the random numbers?.');
    };
  }
  // And simply require it here, eg:
  // this.testClassicParametricSyntax = require(classicSyntax.testParametric)??

  function testClassicParametricSyntax(axiom) {
    return /\(.+\)/.test(axiom);
  }
  // [ {symbol: 'A', params: [1,2,5]}, {symbol: 'B', params:[25]} ]
  // strips spaces

  function transformClassicParametricAxiom(axiom) {
    // Replace whitespaces, then split between square brackets.
    var splitAxiom = axiom.replace(/\s+/g, '').split(/[\(\)]/); // console.log('parts:', splitAxiom)

    var newAxiom = []; // Construct new axiom by getting the params and symbol.

    for (var i = 0; i < splitAxiom.length - 1; i += 2) {
      var params = splitAxiom[i + 1].split(',').map(Number);
      newAxiom.push({
        symbol: splitAxiom[i],
        params: params
      });
    } // console.log('parsed axiom:', newAxiom)

  }
  function transformClassicCSProduction(p) {
    // before continuing, check if classic syntax actually there
    // example: p = ['A<B>C', 'Z']
    // left should be ['A', 'B']
    var left = p[0].match(/(.+)<(.)/); // right should be ['B', 'C']

    var right = p[0].match(/(.)>(.+)/); // Not a CS-Production (no '<' or '>'),
    //return original production.

    if (left === null && right === null) {
      return p;
    }

    var predecessor; // create new production object _or_ use the one set by the user

    var productionObject = p[1].successor || p[1].successors ? p[1] : {
      successor: p[1]
    };

    if (left !== null) {
      predecessor = left[2];
      productionObject.leftCtx = left[1];
    }

    if (right !== null) {
      predecessor = right[1];
      productionObject.rightCtx = right[2];
    }

    return [predecessor, productionObject];
  }

  function stringToObjects(string) {
    if (typeof string !== 'string' && string instanceof String === false) return string;
    var transformed = [];

    for (var _i2 = 0; _i2 < string.length; _i2++) {
      var symbol = string[_i2];
      transformed.push({
        symbol: symbol
      });
    }

    return transformed;
  } // TODO: continue here
  // if applicable also transform strings into array of {symbol: String} objects
  // TODO: make more modular! dont have forceObjects in here

  function normalizeProductionRightSide(p, forceObjects) {
    if (p.hasOwnProperty('successors')) {
      for (var i = 0; i < p.successors.length; i++) {
        p.successors[i] = normalizeProductionRightSide(p.successors[i], forceObjects);
      }
    } else if (p.hasOwnProperty('successor') === false) {
      p = {
        successor: p
      };
    }

    if (forceObjects && p.hasOwnProperty('successor')) {
      p.successor = stringToObjects(p.successor);
    }

    return p;
  }

  function normalizeProduction(p, forceObjects) {
    p[1] = normalizeProductionRightSide(p[1], forceObjects);
    return p;
  }

  // axiom-utils.js — Axiom management utilities for L-System
  /**
   * Initialize the axiom value, optionally converting strings to object arrays.
   * @param {*} axiom - The initial axiom (string or array of objects)
   * @param {boolean} forceObjects - If true, convert string axioms to object arrays
   * @returns {*} The processed axiom
   */

  function initializeAxiom(axiom, forceObjects) {
    return forceObjects ? stringToObjects(axiom) : axiom;
  }
  /**
   * Get the raw axiom value without any transformation.
   * @param {*} axiom - The axiom to return
   * @returns {*} The raw axiom value
   */

  function getAxiomRaw(axiom) {
    return axiom;
  }
  /**
   * Convert an axiom to its string representation.
   * If the axiom is already a string, return it directly.
   * If it's an array of symbol objects, concatenate the symbol properties.
   * @param {*} axiom - The axiom to stringify
   * @param {boolean} onlySymbols - If true, only return symbol characters; if false, return JSON
   * @returns {string} The string representation
   */

  function getStringRepresentation(axiom, onlySymbols) {
    if (onlySymbols === void 0) {
      onlySymbols = true;
    }

    if (typeof axiom === 'string') return axiom;

    if (onlySymbols === true) {
      return axiom.reduce(function (prev, current) {
        if (current.symbol === undefined) {
          console.log('found:', current);
          throw new Error('L-Systems that use only objects as symbols (eg: {symbol: \'F\', params: []}),' + ' cant use string symbols (eg. \'F\')!' + ' Check if you always return objects in your productions and no strings.');
        }

        return prev + current.symbol;
      }, '');
    } else {
      return JSON.stringify(axiom);
    }
  }

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
  function initializeDirectionParams(direction, index, match, branchSymbols) {
    if (direction === 'right') {
      var _ref = branchSymbols.length > 0 ? branchSymbols : [undefined, undefined],
          branchStart = _ref[0],
          branchEnd = _ref[1];

      return {
        loopIndexChange: +1,
        matchIndexChange: +1,
        axiomIndex: index + 1,
        matchIndex: 0,
        matchIndexOverflow: match.length,
        branchStart: branchStart,
        branchEnd: branchEnd
      };
    } else if (direction === 'left') {
      var _ref2 = branchSymbols.length > 0 ? branchSymbols : [undefined, undefined],
          _branchEnd = _ref2[0],
          _branchStart = _ref2[1];

      return {
        loopIndexChange: -1,
        matchIndexChange: -1,
        axiomIndex: index - 1,
        matchIndex: match.length - 1,
        matchIndexOverflow: -1,
        branchStart: _branchStart,
        branchEnd: _branchEnd
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

  function extractSymbol(part) {
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

  function matchContextPattern(_ref3) {
    var axiom = _ref3.axiom,
        match = _ref3.match,
        _ref3$ignoredSymbols = _ref3.ignoredSymbols,
        ignoredSymbols = _ref3$ignoredSymbols === void 0 ? '' : _ref3$ignoredSymbols,
        _ref3$branchSymbols = _ref3.branchSymbols,
        branchSymbols = _ref3$branchSymbols === void 0 ? '[]' : _ref3$branchSymbols,
        index = _ref3.index,
        direction = _ref3.direction;
    var branchCount = 0;
    var explicitBranchCount = 0;
    var returnMatchIndices = [];
    var dirParams = initializeDirectionParams(direction, index, match, branchSymbols);
    var loopIndexChange = dirParams.loopIndexChange,
        matchIndexChange = dirParams.matchIndexChange,
        axiomIndex = dirParams.axiomIndex,
        matchIndex = dirParams.matchIndex,
        matchIndexOverflow = dirParams.matchIndexOverflow,
        branchStart = dirParams.branchStart,
        branchEnd = dirParams.branchEnd;

    for (; axiomIndex < axiom.length && axiomIndex >= 0; axiomIndex += loopIndexChange) {
      var axiomSymbol = extractSymbol(axiom[axiomIndex]);
      var matchSymbol = match[matchIndex];

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
          return {
            result: true,
            matchIndices: returnMatchIndices
          };
        }
      } else if (axiomSymbol === branchStart) {
        branchCount++;
        if (explicitBranchCount > 0) explicitBranchCount++;
      } else if (axiomSymbol === branchEnd) {
        branchCount = Math.max(0, branchCount - 1);
        if (explicitBranchCount > 0) explicitBranchCount = Math.max(0, explicitBranchCount - 1);
      } else if ((branchCount === 0 || explicitBranchCount > 0 && matchSymbol !== branchEnd) && ignoredSymbols.includes(axiomSymbol) === false) {
        return {
          result: false,
          matchIndices: returnMatchIndices
        };
      }
    }

    return {
      result: false,
      matchIndices: returnMatchIndices
    };
  }

  // production-evaluator.js — Production evaluation and application logic
  /**
   * Check if a context-sensitive production's left/right context matches.
   * @param {object} production - The production object with optional leftCtx/rightCtx
   * @param {number} index - Current position in the axiom
   * @param {Array|string} axiom - The current axiom
   * @param {string} branchSymbols - Branch delimiters
   * @param {string} ignoredSymbols - Symbols to ignore during context matching
   * @returns {boolean} Whether the context matches
   */

  function checkContextMatch(production, index, axiom, branchSymbols, ignoredSymbols) {
    var hasLeftCtx = production.leftCtx !== undefined;
    var hasRightCtx = production.rightCtx !== undefined;

    if (hasLeftCtx && hasRightCtx) {
      return matchContextPattern({
        axiom: axiom,
        match: production.leftCtx,
        index: index,
        direction: 'left',
        branchSymbols: branchSymbols,
        ignoredSymbols: ignoredSymbols
      }).result && matchContextPattern({
        axiom: axiom,
        match: production.rightCtx,
        index: index,
        direction: 'right',
        branchSymbols: branchSymbols,
        ignoredSymbols: ignoredSymbols
      }).result;
    } else if (hasLeftCtx) {
      return matchContextPattern({
        axiom: axiom,
        match: production.leftCtx,
        index: index,
        direction: 'left',
        branchSymbols: branchSymbols,
        ignoredSymbols: ignoredSymbols
      }).result;
    } else if (hasRightCtx) {
      return matchContextPattern({
        axiom: axiom,
        match: production.rightCtx,
        index: index,
        direction: 'right',
        branchSymbols: branchSymbols,
        ignoredSymbols: ignoredSymbols
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

  function evaluateMultiSuccessor(production, index, part, params, evaluateRecursively) {
    var currentWeight, threshWeight;

    if (production.isStochastic) {
      threshWeight = Math.random() * production.weightSum;
      currentWeight = 0;
    }

    for (var _i2 = 0, _production$successor2 = production.successors; _i2 < _production$successor2.length; _i2++) {
      var successor = _production$successor2[_i2];

      if (production.isStochastic) {
        currentWeight += successor.weight;
        if (currentWeight < threshWeight) continue;
      }

      var result = evaluateRecursively(successor, index, part, params);

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

  function evaluatePrecheck(production, index, part, params, axiom, branchSymbols, ignoredSymbols) {
    var isConditional = production.condition !== undefined;
    var isContextSensitive = production.leftCtx !== undefined || production.rightCtx !== undefined;

    if (isConditional && production.condition({
      index: index,
      currentAxiom: axiom,
      part: part,
      params: params
    }) === false) {
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

  function appendResultToAxiom(newAxiom, result) {
    if (typeof newAxiom === 'string') {
      return newAxiom + result;
    } else if (result instanceof Array) {
      newAxiom.push.apply(newAxiom, result);
      return newAxiom;
    } else {
      newAxiom.push(result);
      return newAxiom;
    }
  }

  // lindenmayer.js — L-System core class

  var LSystem = /*#__PURE__*/function () {
    function LSystem(_ref) {
      var _ref$axiom = _ref.axiom,
          axiom = _ref$axiom === void 0 ? '' : _ref$axiom,
          productions = _ref.productions,
          finals = _ref.finals,
          _ref$branchSymbols = _ref.branchSymbols,
          branchSymbols = _ref$branchSymbols === void 0 ? '[]' : _ref$branchSymbols,
          _ref$ignoredSymbols = _ref.ignoredSymbols,
          ignoredSymbols = _ref$ignoredSymbols === void 0 ? '+-&^/|\\' : _ref$ignoredSymbols,
          _ref$allowClassicSynt = _ref.allowClassicSyntax,
          allowClassicSyntax = _ref$allowClassicSynt === void 0 ? true : _ref$allowClassicSynt,
          _ref$classicParametri = _ref.classicParametricSyntax,
          classicParametricSyntax = _ref$classicParametri === void 0 ? false : _ref$classicParametri,
          _ref$forceObjects = _ref.forceObjects,
          forceObjects = _ref$forceObjects === void 0 ? false : _ref$forceObjects,
          _ref$debug = _ref.debug,
          debug = _ref$debug === void 0 ? false : _ref$debug;
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
    } // ─── Axiom Management ──────────────────────────────────────────────────────


    var _proto = LSystem.prototype;

    _proto.setAxiom = function setAxiom(axiom) {
      this.axiom = initializeAxiom(axiom, this.forceObjects);
    };

    _proto.getAxiomRaw = function getAxiomRaw$1() {
      return getAxiomRaw(this.axiom);
    }
    /**
     * @deprecated Use getAxiomRaw() instead. Kept for backward compatibility.
     */
    ;

    _proto.getRaw = function getRaw() {
      return this.getAxiomRaw();
    };

    _proto.getStringRepresentation = function getStringRepresentation$1(onlySymbols) {
      if (onlySymbols === void 0) {
        onlySymbols = true;
      }

      return getStringRepresentation(this.axiom, onlySymbols);
    }
    /**
     * @deprecated Use getStringRepresentation() instead. Kept for backward compatibility.
     */
    ;

    _proto.getString = function getString(onlySymbols) {
      if (onlySymbols === void 0) {
        onlySymbols = true;
      }

      return this.getStringRepresentation(onlySymbols);
    } // ─── Production Management ─────────────────────────────────────────────────
    ;

    _proto.setProduction = function setProduction(from, to, allowAppendingMultiSuccessors) {
      if (allowAppendingMultiSuccessors === void 0) {
        allowAppendingMultiSuccessors = false;
      }

      var newProduction = [from, to];

      if (newProduction === undefined) {
        throw new Error('no production specified.');
      }

      if (to.successor && to.successors) {
        throw new Error('You can not have both a "successor" and a "successors" field in your production!');
      } // Apply production transformers and normalizations


      if (this.allowClassicSyntax === true) {
        newProduction = transformClassicCSProduction(newProduction);
      }

      newProduction = normalizeProduction(newProduction, this.forceObjects); // Mark whether production is stochastic (all successors have weights)

      newProduction[1].isStochastic = newProduction[1].successors !== undefined && newProduction[1].successors.every(function (successor) {
        return successor.weight !== undefined;
      });

      if (newProduction[1].isStochastic) {
        // Calculate total weight sum for stochastic selection
        newProduction[1].weightSum = 0;

        for (var _i2 = 0, _newProduction$1$succ2 = newProduction[1].successors; _i2 < _newProduction$1$succ2.length; _i2++) {
          var successor = _newProduction$1$succ2[_i2];
          newProduction[1].weightSum += successor.weight;
        }
      }

      var symbol = newProduction[0];

      if (allowAppendingMultiSuccessors === true && this.productions.has(symbol)) {
        var existingProduction = this.productions.get(symbol);
        var singleSuccessor = existingProduction.successor;
        var multiSuccessors = existingProduction.successors;

        if (singleSuccessor && !multiSuccessors) {
          // Promote existing single successor to a successors array
          existingProduction = {
            successors: [existingProduction]
          };
        }

        existingProduction.successors.push(newProduction[1]);
        this.productions.set(symbol, existingProduction);
      } else {
        this.productions.set(symbol, newProduction[1]);
      }
    };

    _proto.setProductions = function setProductions(newProductions) {
      if (newProductions === undefined) throw new Error('no production specified.');
      this.clearProductions();

      for (var _i4 = 0, _Object$entries2 = Object.entries(newProductions); _i4 < _Object$entries2.length; _i4++) {
        var _Object$entries2$_i = _Object$entries2[_i4],
            from = _Object$entries2$_i[0],
            to = _Object$entries2$_i[1];
        this.setProduction(from, to, true);
      }
    };

    _proto.clearProductions = function clearProductions() {
      this.productions = new Map();
    } // ─── Final Function Management ─────────────────────────────────────────────
    ;

    _proto.setFinalFunction = function setFinalFunction(symbol, final) {
      if (final === undefined) {
        throw new Error('no final specified.');
      }

      this.finals.set(symbol, final);
    };

    _proto.setFinalFunctions = function setFinalFunctions(newFinals) {
      if (newFinals === undefined) throw new Error('no finals specified.');
      this.finals = new Map();

      for (var symbol in newFinals) {
        if (newFinals.hasOwnProperty(symbol)) {
          this.setFinalFunction(symbol, newFinals[symbol]);
        }
      }
    }
    /**
     * @deprecated Use setFinalFunction() instead. Kept for backward compatibility.
     */
    ;

    _proto.setFinal = function setFinal(symbol, final) {
      return this.setFinalFunction(symbol, final);
    }
    /**
     * @deprecated Use setFinalFunctions() instead. Kept for backward compatibility.
     */
    ;

    _proto.setFinals = function setFinals(newFinals) {
      return this.setFinalFunctions(newFinals);
    } // ─── Production Result Evaluation ──────────────────────────────────────────
    ;

    _proto.getProductionResult = function getProductionResult(production, index, part, params, recursive) {
      var _this = this;

      if (recursive === void 0) {
        recursive = false;
      }

      var precheckPassed = evaluatePrecheck(production, index, part, params, this.axiom, this.branchSymbols, this.ignoredSymbols);

      if (!precheckPassed) {
        return recursive ? false : part;
      }

      var result = false;

      if (production.successors) {
        result = evaluateMultiSuccessor(production, index, part, params, function (successor, idx, prt, prms) {
          return _this.getProductionResult(successor, idx, prt, prms, true);
        });
      } else if (typeof production.successor === 'function') {
        result = production.successor({
          index: index,
          currentAxiom: this.axiom,
          part: part,
          params: params
        });
      } else {
        result = production.successor;
      }

      if (!result) {
        return recursive ? result : part;
      }

      return result;
    } // ─── Iteration ─────────────────────────────────────────────────────────────
    ;

    _proto.applyProductionsOnce = function applyProductionsOnce() {
      var newAxiom = typeof this.axiom === 'string' ? '' : [];
      var index = 0;

      for (var _i6 = 0, _this$axiom2 = this.axiom; _i6 < _this$axiom2.length; _i6++) {
        var part = _this$axiom2[_i6];
        var symbol = part.symbol || part;
        var params = part.params || [];
        var result = part;

        if (this.productions.has(symbol)) {
          var production = this.productions.get(symbol);
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
    ;

    _proto.applyProductions = function applyProductions() {
      return this.applyProductionsOnce();
    };

    _proto.iterate = function iterate(n) {
      if (n === void 0) {
        n = 1;
      }

      this.iterations = n;
      var lastIteration;

      for (var iteration = 0; iteration < n; iteration++) {
        lastIteration = this.applyProductionsOnce();
      }

      return lastIteration;
    } // ─── Final Execution ───────────────────────────────────────────────────────
    ;

    _proto.executeFinals = function executeFinals(externalArg) {
      var index = 0;

      for (var _i8 = 0, _this$axiom4 = this.axiom; _i8 < _this$axiom4.length; _i8++) {
        var part = _this$axiom4[_i8];
        var symbol = typeof part === 'object' && part.symbol ? part.symbol : part;

        if (this.finals.has(symbol)) {
          var finalFunction = this.finals.get(symbol);
          var functionType = typeof finalFunction;

          if (functionType !== 'function') {
            throw Error('\'' + symbol + '\'' + ' has an object for a final function. But it is __not a function__ but a ' + functionType + '!');
          }

          finalFunction({
            index: index,
            part: part
          }, externalArg);
        }

        index++;
      }
    }
    /**
     * @deprecated Use executeFinals() instead. Kept for backward compatibility.
     */
    ;

    _proto.final = function final(externalArg) {
      return this.executeFinals(externalArg);
    } // ─── Context Matching ──────────────────────────────────────────────────────

    /**
     * Match a context pattern against axiom neighbors.
     * Delegates to the extracted matchContextPattern function.
     *
     * @param {object} params - {axiom_, match, ignoredSymbols, branchSymbols, index, direction}
     * @returns {{result: boolean, matchIndices: number[]}}
     */
    ;

    _proto.match = function match(_ref2) {
      var axiom_ = _ref2.axiom_,
          _match = _ref2.match,
          ignoredSymbols = _ref2.ignoredSymbols,
          branchSymbols = _ref2.branchSymbols,
          index = _ref2.index,
          direction = _ref2.direction;
      var axiom = axiom_ || this.axiom;
      var resolvedBranchSymbols = branchSymbols !== undefined ? branchSymbols : this.branchSymbols;
      var resolvedIgnoredSymbols = ignoredSymbols !== undefined ? ignoredSymbols : this.ignoredSymbols;
      return matchContextPattern({
        axiom: axiom,
        match: _match,
        ignoredSymbols: resolvedIgnoredSymbols,
        branchSymbols: resolvedBranchSymbols,
        index: index,
        direction: direction
      });
    };

    return LSystem;
  }(); // ─── Static API (backward compatible) ────────────────────────────────────────
  LSystem.getStringResult = LSystem.getStringRepresentation;
  LSystem.transformClassicStochasticProductions = transformClassicStochasticProductions;
  LSystem.transformClassicCSProduction = transformClassicCSProduction;
  LSystem.transformClassicParametricAxiom = transformClassicParametricAxiom;
  LSystem.testClassicParametricSyntax = testClassicParametricSyntax;

  return LSystem;

})));
