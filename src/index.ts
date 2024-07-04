import ejs from 'ejs'
import { parse, Export, Property } from "xtp-bindgen"

function getContext() {
  const ctx = JSON.parse(Config.get('ctx') || '{}')
  ctx.schema = parse(JSON.stringify(ctx.schema))
  return ctx
}

function toTypeScriptType(property: Property) {
  if (property.$ref) return property.$ref.name

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
      // TODO respect items
      return "any[]"
    case "buffer":
      return "ArrayBufferLike"
    default:
      throw new Error("Cant convert property to typescript type: " + property.type)
  }
}

function propertyIsEmpty(p: Property | null) {
  if (!p) return true
  return !p.type && !p.$ref
}

function propertyHasComment(p: Property | null) {
  if (!p) return false
  return p.description || p.$ref
}

function exportHasComment(ex: Export) {
  return ex.description || propertyHasComment(ex.input || null) || propertyHasComment(ex.output || null)
}

// formats multi line comments to fit in block format
function formatComment(s: string | null) {
  if (!s) return ""
  return s.trimEnd().replace(/\n/g, ' ')
}

// trims comment to fit on one line
function formatBlockComment(s: string | null) {
  if (!s) return ""
  return s.trimEnd().replace(/\n/g, '\n * ')
}

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ...getContext(),
    toTypeScriptType,
    propertyHasComment,
    propertyIsEmpty,
    exportHasComment,
    formatBlockComment,
    formatComment,
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}
