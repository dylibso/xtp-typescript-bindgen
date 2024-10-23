import ejs from 'ejs'
import { helpers, getContext, Property, Parameter, } from "@dylibso/xtp-bindgen"

function toTypeScriptType(property: Property | Parameter): string {
  let tp
  if (property.$ref) {
    tp = property.$ref.name
  } else if (property.additionalProperties) {
    tp = `Record<string, ${toTypeScriptType(property.additionalProperties)}>`
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

  if (!tp) throw new Error("Cant convert property to typescript type: " + JSON.stringify(property))
  if (!property.nullable) return tp
  return `${tp} | null`
}

function getBaseRef(property: Property): string {
  if (property.additionalProperties) {
    if (property.additionalProperties.items?.$ref) {
      return property.additionalProperties.items.$ref.name
    }

    return property.additionalProperties.$ref?.name || ''
  }

  if (property.items) {
    return property.items.$ref?.name || ''
  }

  return property.$ref?.name || ''
}

function deserializeProperty(prop: Property): string | null {
  const baseP = (prop.items ? prop.items : prop) as Property;
  const baseRef = getBaseRef(prop);

  if (helpers.isDateTime(baseP)) {
    return `cast(dateFromJson, obj.${prop.name})`;
  } else if (isBuffer(baseP)) {
    return `cast(bufferFromJson, obj.${prop.name})`;
  } else if (helpers.isMap(prop)) {
    return deserializeMapFromSource(`obj.${prop.name}`, prop);
  } else if (baseP.$ref?.additionalProperties) {
    return deserializeMapFromSource(`obj.${prop.name}`, (baseP.$ref as any) as Property);
  } else if (!helpers.isPrimitive(baseP)) {
    return `cast(${baseRef}.fromJson, obj.${prop.name})`;
  }
  return null;
}

function deserializeMapFromSource(source: string, prop: Property): string {
  if (helpers.isMap(prop.additionalProperties as Property)) {
    // Handle nested maps recursively
    const innerConverter = deserializeProperty(prop.additionalProperties as Property);
    return `mapFromJson(${source}, (v) => ${innerConverter})`;
  } 
  
  const baseP = (prop.additionalProperties?.items ? prop.additionalProperties.items : prop.additionalProperties) as Property;
  const baseRef = getBaseRef(baseP);
  
  if (!helpers.isPrimitive(prop.additionalProperties as Property)) {
    return `mapFromJson(${source}, ${baseRef}.fromJson)`;
  }

  return `mapFromJson(${source}, (v: any) => v as ${toTypeScriptType(baseP)})`;
}

function serializeProperty(prop: Property): string | null {
  const baseP = (prop.items ? prop.items : prop) as Property;
  const baseRef = getBaseRef(prop);

  if (helpers.isDateTime(baseP)) {
    return `cast(dateToJson, obj.${prop.name})`;
  } else if (isBuffer(baseP)) {
    return `cast(bufferToJson, obj.${prop.name})`;
  } else if (helpers.isMap(prop)) {
    return serializeMapFromSource(`obj.${prop.name}`, prop);
  } else if (baseP.$ref?.additionalProperties) {
    let prop = (baseP.$ref as any) as Property
    prop.name = baseP.name

    return serializeMapFromSource(`obj.${prop.name}`,prop);
  } else if (!helpers.isPrimitive(baseP)) {
    return `cast(${baseRef}.toJson, obj.${prop.name})`;
  }
  return null;
}

function serializeMapFromSource(source: string, prop: Property): string {
  if (helpers.isMap(prop.additionalProperties as Property)) {
    // Handle nested maps recursively
    const innerConverter = serializeProperty(prop.additionalProperties as Property);
    return `mapToJson(${source}, (v) => ${innerConverter})`;
  } else if (!helpers.isPrimitive(prop.additionalProperties as Property)) {
    const baseRef = getBaseRef(prop.additionalProperties as Property);
    return `mapToJson(${source}, ${baseRef}.toJson)`;
  }
  return source;
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
    getBaseRef,
    serializeProperty,
    serializeMapFromSource,
    deserializeProperty,
    deserializeMapFromSource
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}