import * as main from "./main"

import {
      Fruit,
      GhostGang,
      ComplexObject,
  } from './pdk'


export function voidFunc(): number {
            main.voidFuncImpl()
      
  
  return 0
}

export function primitiveTypeFunc(): number {
            const input = Host.inputString() 
    
          const output = main.primitiveTypeFuncImpl(input)
      
            Host.outputString(JSON.stringify(output))
      
  return 0
}

export function referenceTypeFunc(): number {
            const input = Host.inputString() as Fruit
    
          const output = main.referenceTypeFuncImpl(input)
      
            Host.outputString(JSON.stringify(output))
      
  return 0
}



