const hostFunctions = Host.getFunctions()

/**
 * A set of available fruits you can consume
 */
export enum Fruit {

  apple = 'apple',

  orange = 'orange',

  banana = 'banana',

  strawberry = 'strawberry',
}

/**
 * A set of all the enemies of pac-man
 */
export enum GhostGang {

  blinky = 'blinky',

  pinky = 'pinky',

  inky = 'inky',

  clyde = 'clyde',
}

/**
 * A complex json object
 */
export class ComplexObject {
  /**
   * A set of all the enemies of pac-man
   */
  GhostGang?: string

  /**
   * A boolean prop
   */
  aBoolean?: boolean

  /**
   * An int prop
   */
  aString?: number

  /**
   * An int prop
   */
  anInt?: number

  /**
   * A datetime object, we will automatically serialize and deserialize
this for you.

   */
  anOptionalDate?: string
}

export function eatAFruit(input: string): boolean {
  const json = JSON.stringify(input)

  const mem = Memory.fromString(json)
  const ptr = hostFunctions.eatAFruit(mem.offset)

  return JSON.parse(Memory.find(ptr).readString())
}
