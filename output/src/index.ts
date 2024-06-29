import * as main from "./main"

export function voidFunc() {
            main.voidFuncImpl()
      
  
  return 0
}

export function primitiveTypeFunc() {
            const input: string = Host.inputString()
    
          const output = main.primitiveTypeFuncImpl(input)
      
            Host.outputString(JSON.stringify(output))
      
  return 0
}

export function referenceTypeFunc() {
            const input: ArrayBufferLike = Host.inputBytes()
    
          const output = main.referenceTypeFuncImpl(input)
      
            Host.outputString(JSON.stringify(output))
      
  return 0
}



