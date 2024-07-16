import * as main from "./main";

import { WriteParams, Fruit, GhostGang, ComplexObject } from "./pdk";

export function voidFunc(): number {
  main.voidFuncImpl();

  return 0;
}

export function topLevelPrimitives(): number {
  const input = Host.inputString();

  const output = main.topLevelPrimitivesImpl(input);

  Host.outputString(JSON.stringify(output));

  return 0;
}

export function referenceTypes(): number {
  const input = Host.inputString() as Fruit;

  const output = main.referenceTypesImpl(input);

  Host.outputString(JSON.stringify(output));

  return 0;
}
