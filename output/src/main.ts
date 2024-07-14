import { WriteParams, Fruit, GhostGang, ComplexObject } from "./pdk";

import { eatAFruit, kv_read, kv_write } from "./pdk";

/**
 * This demonstrates how you can create an export with
 * no inputs or outputs.
 *
 */
export function voidFuncImpl() {
  // TODO: fill out your implementation here
  throw new Error("Function not implemented.");
}

/**
 * This demonstrates how you can accept or return primtive types.
 * This function takes a utf8 string and returns a json encoded boolean
 *
 * @param input {string} A string passed into plugin input
 * @returns {boolean} A boolean encoded as json
 */
export function primitiveTypeFuncImpl(input: string): boolean {
  // TODO: fill out your implementation here
  throw new Error("Function not implemented.");
}

/**
 * This demonstrates how you can accept or return references to schema types.
 * And it shows how you can define an enum to be used as a property or input/output.
 *
 * @param input {Fruit} A set of available fruits you can consume
 * @returns {ComplexObject} A complex json object
 */
export function referenceTypeFuncImpl(input: Fruit): ComplexObject {
  // TODO: fill out your implementation here
  throw new Error("Function not implemented.");
}
