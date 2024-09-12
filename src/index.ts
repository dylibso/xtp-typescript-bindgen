import ejs from 'ejs'
import { helpers, getContext, Property, Parameter } from "@dylibso/xtp-bindgen"

function needsCasting(p: Property | Parameter): boolean {
  if (p.$ref) return true

  switch (p.type) {
    case "buffer":
      return true
    case "string":
      if (p.format === 'date-time') return true
      return false
    default:
      return false
  }
}

function toTypeScriptType(property: Property | Parameter): string {
  let tp
  if (property.$ref) {
    tp = property.$ref.name
  } else {
    switch (property.type) {
      case "string":
        if (property.format === 'date-time') {
          tp = 'Date'
        } else {
          tp = "string"
        }
        break
      case "integer":
        if (property.format === 'int64') {
          throw Error(`We do not support format int64 yet`)
        } else {
          tp = "number"
        }
        break
      case "number":
        tp = "number"
        break
      case "boolean":
        tp = "boolean"
        break
      case "object":
        tp = "any"
        break
      case "array":
        if (!property.items) {
          tp = 'Array<any>'
        } else {
          // TODO this is not quite right to force cast
          tp = `Array<${toTypeScriptType(property.items as Property)}>`
        }
        break
      case "buffer":
        tp = "ArrayBufferLike"
        break
    }
  }

  if (!tp) throw new Error("Cant convert property to typescript type: " + property.type)
  if (!property.nullable) return tp
  return `${tp} | null`
}

// TODO: can move this helper up to shared library?
function isBuffer(property: Property | Parameter): boolean {
  return property.type === 'buffer'
}

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ...getContext(),
    ...helpers,
    isBuffer,
    toTypeScriptType,
    needsCasting,
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}
