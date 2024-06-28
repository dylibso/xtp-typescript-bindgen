import * as main from "./main"

export function export1() {
  const input: string = Host.inputString()
  main.export1Impl(input)

  return 0
}

export function export2() {
  const input: ArrayBufferLike = Host.inputBytes()
  main.export2Impl(input);

  return 0
}

export function export3() {
  const input:  = JSON.parse(Host.inputString())
  const output = main.export3Impl(input)
  Host.outputBytes(output)

  return 0
}

export function export4() {
  const input:  = JSON.parse(Host.inputString())
  const output = main.export4Impl(input)
  Host.outputString(JSON.stringify(output))

  return 0
}



