import ejs from 'ejs'
import { helpers, getContext, ObjectType, EnumType, ArrayType, XtpNormalizedType, MapType, XtpTyped } from "@dylibso/xtp-bindgen"

function toTypeScriptTypeX(type: XtpNormalizedType): string {
  // annotate with null if nullable 
  const nullify = (t: string) => `${t}${type.nullable ? ' | null' : ''}`

  switch (type.kind) {
    case 'string':
      return nullify('string')
    case 'int32':
    case 'float':
    case 'double':
    case 'byte':
      return nullify('number')
    case 'date-time':
      return nullify('Date')
    case 'boolean':
      return nullify('boolean')
    case 'array':
      const arrayType = type as ArrayType
      return nullify(`Array<${toTypeScriptTypeX(arrayType.elementType)}>`)
    case 'buffer':
      return nullify('ArrayBufferLike')
    case 'object':
      const oType = (type as ObjectType)
      if (oType.properties?.length > 0) {
        return nullify(oType.name)
      } else {
        return nullify('any')
      }
    case 'enum':
      return nullify((type as EnumType).name)
    case 'map':
      const { keyType, valueType } = type as MapType
      return nullify(`Record<${toTypeScriptTypeX(keyType)}, ${toTypeScriptTypeX(valueType)}>`)
    case 'int64':
      throw Error(`We do not support format int64 yet`)
    default:
      throw new Error("Cant convert property to typescript type: " + JSON.stringify(type))
  }
}

function toTypeScriptType(property: XtpTyped): string {
  return toTypeScriptTypeX(property.xtpType!)
}

function getDefault(property: XtpTyped): string {
  return getDefaultForType(property.xtpType!)
}

function getDefaultForType(type: XtpNormalizedType): string {
  if (type.nullable) return 'null';

  switch (type.kind) {
    case 'string':
      return "''"
    case 'int32':
    case 'float':
    case 'double':
    case 'byte':
      return '0'
    case 'date-time':
      return 'new Date()'
    case 'boolean':
      return 'false'
    case 'array':
      return '[]'
    case 'buffer':
      return 'new ArrayBuffer(0)'
    case 'object':
      return 'new ' + (type as ObjectType).name + '()'
    case 'enum':
      return (type as EnumType).values[0]
    case 'map':
      return '{}'
    case 'int64':
      throw 'new BigInt(0)';
    default:
      throw new Error("Cant convert property to typescript type: " + JSON.stringify(type))
  }
}

/**
 * Check whether this type needs to be cast or not
 */
function isCastable(t: XtpNormalizedType): boolean {
  if (['date-time', 'buffer'].includes(t.kind)) return true

  switch (t.kind) {
    case 'object':
      const oType = t as ObjectType
      // only return true when the object has defined / typed properties
      return (oType.properties && oType.properties.length > 0)
    case 'array':
      return isCastable((t as ArrayType).elementType)
    case 'map':
      return isCastable((t as MapType).valueType)
    default:
      return false
  }
}

/**
 * Renders the function call to cast the value
 * Assumes the target is called `obj`
 *
 * Example: Assume we have a map of arrays of dates
 *  castExpression(t, 'From') would yield:
 *  -> cast(castMap(castArray(dateFromJson)), obj.myObj)
 *
 *  castExpression(t, 'To') would yield:
 *  -> cast(castMap(castArray(dateToJson)), obj.myObj)
 */
function castExpression(t: XtpNormalizedType, direction: 'From' | 'To'): string {
  switch (t.kind) {
    case 'object':
      const oType = t as ObjectType
      return `${oType.name}.${direction.toLowerCase()}Json`
    case 'array':
      return `castArray(${castExpression((t as ArrayType).elementType, direction)})`
    case 'map':
      return `castMap(${castExpression((t as MapType).valueType, direction)})`
    case 'date-time':
      return `date${direction}Json`
    case 'buffer':
      return `buffer${direction}Json`
    default:
      throw new Error(`Type not meant to be casted ${JSON.stringify(t)}`)
  }
}

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ...getContext(),
    ...helpers,
    isCastable,
    castExpression,
    toTypeScriptType,
    getDefaultForType,
    getDefault,
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}
