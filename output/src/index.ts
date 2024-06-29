import * as main from './main'

export function voidFunc(): number {
  main.voidFuncImpl()

  return 0
}

export function primitiveTypeFunc(): number {
  const input: string = Host.inputString()

  const output = main.primitiveTypeFuncImpl(input)

  Host.outputString(JSON.stringify(output))

  return 0
}

export function referenceTypeFunc(): number {
  const input: string = Host.inputString()

  const output = main.referenceTypeFuncImpl(input)

  Host.outputString(JSON.stringify(output))

  return 0
}
