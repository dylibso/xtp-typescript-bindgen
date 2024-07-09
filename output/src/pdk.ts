const hostFunctions = Host.getFunctions();

/**
 * Parameters to write to kv store
 */
export class WriteParams {
  /**
   * key
   */
  key?: string;

  /**
   * value
   */
  value?: ArrayBufferLike;
}

/**
 * A set of available fruits you can consume
 */
export enum Fruit {
  apple = "apple",
  orange = "orange",
  banana = "banana",
  strawberry = "strawberry",
}

/**
 * A set of all the enemies of pac-man
 */
export enum GhostGang {
  blinky = "blinky",
  pinky = "pinky",
  inky = "inky",
  clyde = "clyde",
}

/**
 * A complex json object
 */
export class ComplexObject {
  /**
   * I can override the description for the property here
   */
  // @ts-expect-error TS2564
  ghost: GhostGang;

  /**
   * A boolean prop
   */
  // @ts-expect-error TS2564
  aBoolean: boolean;

  /**
   * An string prop
   */
  // @ts-expect-error TS2564
  aString: string;

  /**
   * An int prop
   */
  // @ts-expect-error TS2564
  anInt: number;

  /**
   * A datetime object, we will automatically serialize and deserialize
   * this for you.
   */
  anOptionalDate?: string;
}

/**
 * This is a host function. Right now host functions can only be the type (i64) -&gt; i64.
 * We will support more in the future. Much of the same rules as exports apply.
 *
 * @param input {Fruit} A set of available fruits you can consume
 * @returns {boolean} boolean encoded as json
 */
export function eatAFruit(input: Fruit): boolean {
  const mem = Memory.fromString(input);

  const ptr = hostFunctions.eatAFruit(mem.offset);

  return Memory.find(ptr).readJsonObject();
}

/**
 * kvread
 *
 * @param input {string} the key
 * @returns {ArrayBufferLike} the raw byte values at key
 */
export function kv_read(input: string): ArrayBufferLike {
  const mem = Memory.fromString(input);

  const ptr = hostFunctions.kv_read(mem.offset);

  return Memory.find(ptr).readBytes();
}

/**
 * kvwrite
 *
 * @param input {WriteParams} Parameters to write to kv store
 */
export function kv_write(input: WriteParams) {
  const mem = Memory.fromJsonObject(input as any);

  hostFunctions.kv_write(mem.offset);
}
