import { WriteParams, Fruit, GhostGang, ComplexObject } from "./pdk";

import { eatAFruit, kv_read, kv_write } from "./pdk";

/**
 * This demonstrates how you can create an export with
 * no inputs or outputs.
 *
 */
export function voidFuncImpl() {
  console.log("Hello World!");
}

/**
 * This demonstrates how you can accept or return primtive types.
 * This function takes a utf8 string and returns a json encoded array of booleans
 *
 * @param input {string} A string passed into plugin input
 * @returns {Array<boolean>} A bool array encoded as json
 */
export function topLevelPrimitivesImpl(input: string): Array<boolean> {
  return [true, false];
}

/**
 * This demonstrates how parameters can be references.
 * It takes a Fruit enum and returns a ComplexObject json object
 *
 * @param input {Fruit} A set of available fruits you can consume
 * @returns {ComplexObject} A complex json object
 */
export function referenceTypesImpl(input: Fruit): ComplexObject {
  return { ghost: GhostGang.inky, aBoolean: true, aString: "okay", anInt: 123 };
}
