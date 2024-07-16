declare module "main" {
  export function voidFunc(): I32;
  export function topLevelPrimitives(): I32;
  export function referenceTypes(): I32;
}

declare module "extism:host" {
  interface user {
    eatAFruit(ptr: I64): I64;
    kv_read(ptr: I64): I64;
    kv_write(ptr: I64): I64;
  }
}
