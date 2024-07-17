import ejs from 'ejs'
import { helpers, getContext, Property } from "@dylibso/xtp-bindgen"

function toTypeScriptType(property: Property): string {
  if (property.$ref) return property.$ref.name

  switch (property.type) {
    case "string":
      return "string"
    case "integer":
      if (property.format === 'int64') throw Error(`We do not support format int64 yet`)
      return "number"
    case "number":
      return "number"
    case "boolean":
      return "boolean"
    case "object":
      return "any"
    case "array":
      if (!property.items) return 'Array<any>'
      // TODO this is not quite right to force cast
      return `Array<${toTypeScriptType(property.items as Property)}>`
    case "buffer":
      return "ArrayBufferLike"
    default:
      throw new Error("Cant convert property to typescript type: " + property.type)
  }
}

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ...getContext(),
    ...helpers,
    toTypeScriptType,
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}
