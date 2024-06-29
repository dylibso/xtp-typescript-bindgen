import ejs from 'ejs'
import { parse } from "xtp-bindgen"

function getContext() {
  const ctx = JSON.parse(Config.get('ctx'))
  ctx.schema = parse(JSON.stringify(ctx.schema))
  return ctx
}

function toTypeScriptType(property) {
  if (!property.type) return "string"
  if (property.enum) return property.name

  switch (property.type) {
    case "string":
      return "string"
    case "integer":
      return "number"
    case "boolean":
      return "boolean"
    case "object":
      return "any"
    case "array":
      return "any[]"
    case "buffer":
      return "ArrayBufferLike"
    default:
      throw new Error("Cant convert property to typescript type: " + property.type)
  }
}

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ctx: getContext(),
    toTypeScriptType,
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}
