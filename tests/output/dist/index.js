"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  referenceTypes: () => referenceTypes,
  topLevelPrimitives: () => topLevelPrimitives,
  voidFunc: () => voidFunc
});
module.exports = __toCommonJS(src_exports);

// src/pdk.ts
var hostFunctions = Host.getFunctions();

// src/main.ts
function voidFuncImpl() {
  console.log("Hello World!");
}
function topLevelPrimitivesImpl(input) {
  return [true, false];
}
function referenceTypesImpl(input) {
  return { ghost: "inky" /* inky */, aBoolean: true, aString: "okay", anInt: 123 };
}

// src/index.ts
function voidFunc() {
  voidFuncImpl();
  return 0;
}
function topLevelPrimitives() {
  const input = Host.inputString();
  const output = topLevelPrimitivesImpl(input);
  Host.outputString(JSON.stringify(output));
  return 0;
}
function referenceTypes() {
  const input = Host.inputString();
  const output = referenceTypesImpl(input);
  Host.outputString(JSON.stringify(output));
  return 0;
}
//# sourceMappingURL=index.js.map
