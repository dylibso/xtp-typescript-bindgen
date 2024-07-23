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

function isDateTime(p: Property | null): boolean {
  if (!p) return false
  return p.type === 'string' && p.format === 'date-time'
}

function isJsonEncoded(p: Property | null): boolean {
  if (!p) return false
  return p.contentType === 'application/json'
}

function isUtf8Encoded(p: Property | null): boolean {
  if (!p) return false
  return p.contentType === 'text/plain; charset=UTF-8'
}

function isPrimitive(p: Property): boolean {
  if (!p.$ref) return true
  return !!p.$ref.enum && !p.$ref.properties
}

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ...getContext(),
    ...helpers,
    toTypeScriptType,
    needsCasting,
    isJsonEncoded,
    isUtf8Encoded,
    isPrimitive,
    isDateTime,
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}
