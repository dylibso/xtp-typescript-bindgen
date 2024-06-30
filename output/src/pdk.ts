const hostFunctions = Host.getFunctions();

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
   * An int prop
   */
  // @ts-expect-error TS2564
  aString: number;

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
  const json = JSON.stringify(input);

  const mem = Memory.fromString(json);
  // TODO why?
  // @ts-ignore
  const ptr = hostFunctions.eatAFruit(mem.offset);

  return JSON.parse(Memory.find(ptr).readString());
}
