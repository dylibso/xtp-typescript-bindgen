import ejs from 'ejs'
import { helpers, getContext, Property } from "@dylibso/xtp-bindgen"

function needsCasting(property: Property): boolean {
  if (property.$ref) return true

  switch (property.type) {
    case "string":
      if (property.format === 'date-time') return true
      return false
    default:
      return false
  }
}

function toTypeScriptType(property: Property): string {
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

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ...getContext(),
    ...helpers,
    toTypeScriptType,
    needsCasting,
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}
