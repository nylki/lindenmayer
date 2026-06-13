// axiom-utils.js — Axiom management utilities for L-System
// Extracted from lindenmayer.js for single responsibility:
// this module handles axiom transformation and string representation.

import { stringToObjects } from './transformers';

/**
 * Initialize the axiom value, optionally converting strings to object arrays.
 * @param {*} axiom - The initial axiom (string or array of objects)
 * @param {boolean} forceObjects - If true, convert string axioms to object arrays
 * @returns {*} The processed axiom
 */
export function initializeAxiom(axiom, forceObjects) {
  return forceObjects ? stringToObjects(axiom) : axiom;
}

/**
 * Get the raw axiom value without any transformation.
 * @param {*} axiom - The axiom to return
 * @returns {*} The raw axiom value
 */
export function getAxiomRaw(axiom) {
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
export function getStringRepresentation(axiom, onlySymbols = true) {
  if (typeof axiom === 'string') return axiom;
  if (onlySymbols === true) {
    return axiom.reduce((prev, current) => {
      if (current.symbol === undefined) {
        console.log('found:', current);
        throw new Error(
          'L-Systems that use only objects as symbols (eg: {symbol: \'F\', params: []}),' +
          ' cant use string symbols (eg. \'F\')!' +
          ' Check if you always return objects in your productions and no strings.'
        );
      }
      return prev + current.symbol;
    }, '');
  } else {
    return JSON.stringify(axiom);
  }
}
