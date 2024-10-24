import ejs from 'ejs'
import { helpers, getContext, Property, Parameter } from "@dylibso/xtp-bindgen"

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

function propertyParsingSnippet(prop: Property): string | null {
  const baseP = (prop.items ? prop.items : prop) as Property;
  const baseRef = getBaseRef(prop);

  if (helpers.isDateTime(baseP)) {
    return `cast(dateFromJson, obj.${prop.name})`;
  } else if (isBuffer(baseP)) {
    return `cast(bufferFromJson, obj.${prop.name})`;
  } else if (helpers.isMap(prop)) {
    return mapParsingSnippet(`obj.${prop.name}`, prop);
  } else if (!helpers.isPrimitive(baseP)) {
    return `cast(${baseRef}.fromJson, obj.${prop.name})`;
  }
  return null;
}
function mapParsingSnippet(source: string, prop: Property): string {
  // Extract map's value type, handling both direct and array cases
  const valueType = prop.additionalProperties?.items || prop.additionalProperties;
  if (!valueType) return `mapFromJson(${source}, (v) => v)`;

  // Get type annotation for the resulting map values
  const typeAnnotation = getTypeAnnotation(valueType as Property);

  // Generate converter based on value type
  const valueConverter = buildParsingConverter(valueType as Property);

  // Handle arrays
  if (prop.additionalProperties?.items) {
    return `mapFromJson(${source}, (arr: any[]): ${typeAnnotation}[] => arr.map((v: any) => ${valueConverter}(v)))`;
  }

  // Handle simple maps
  return `mapFromJson(${source}, ${valueConverter})`;
}

function buildParsingConverter(prop: Property): string {
  // Handle nested maps
  if (helpers.isMap(prop)) {
    const innerValueType = prop.additionalProperties as Property;
    const valueRef = getBaseRef(innerValueType);

    if (!helpers.isPrimitive(innerValueType)) {
      return `(v: any) => mapFromJson(v, ${valueRef}.fromJson)`;
    }
    return `(v: any) => mapFromJson(v, (vv) => vv as ${toTypeScriptType(innerValueType)})`;
  }

  // Handle non-map types
  const ref = getBaseRef(prop);
  if (!helpers.isPrimitive(prop)) {
    return `${ref}.fromJson`;
  }
  return `(v: any) => v as ${toTypeScriptType(prop)}`;
}

function getTypeAnnotation(prop: Property): string {
  if (helpers.isMap(prop)) {
    const valueType = prop.additionalProperties as Property;
    return getBaseRef(valueType) || toTypeScriptType(valueType);
  }
  return getBaseRef(prop) || toTypeScriptType(prop);
}

function propertyToJsonSnippet(prop: Property): string | null {
  const baseP = (prop.items ? prop.items : prop) as Property;
  const baseRef = getBaseRef(prop);

  if (helpers.isDateTime(baseP)) {
    return `cast(dateToJson, obj.${prop.name})`;
  } else if (isBuffer(baseP)) {
    return `cast(bufferToJson, obj.${prop.name})`;
  } else if (helpers.isMap(prop)) {
    return mapToJsonSnippet(`obj.${prop.name}`, prop);
  } else if (!helpers.isPrimitive(baseP)) {
    return `cast(${baseRef}.toJson, obj.${prop.name})`;
  }
  return null;
}

function mapToJsonSnippet(source: string, prop: Property): string {
  // Extract map's value type, handling both direct and array cases
  const valueType = prop.additionalProperties?.items || prop.additionalProperties;
  if (!valueType) return `mapToJson(${source}, (v) => v)`;

  // Generate converter based on value type
  const valueConverter = buildValueConverter(valueType as Property);
  
  // Handle arrays
  if (prop.additionalProperties?.items) {
    return `mapToJson(${source}, (arr) => arr.map((v) => ${valueConverter}(v)))`;
  }

  // Handle simple maps
  return `mapToJson(${source}, ${valueConverter})`;
}

function buildValueConverter(prop: Property): string {
  // Handle nested maps
  if (helpers.isMap(prop)) {
    const innerValueType = prop.additionalProperties as Property;
    const valueRef = getBaseRef(innerValueType);

    if (!helpers.isPrimitive(innerValueType)) {
      return `(v) => mapToJson(v, ${valueRef}.toJson)`;
    }
    return `(v) => mapToJson(v, (vv) => vv)`;
  }

  // Handle non-map types
  const ref = getBaseRef(prop);
  if (!helpers.isPrimitive(prop)) {
    return `${ref}.toJson`;
  }
  return `(v) => v`;
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
    propertyToJsonSnippet,
    mapToJsonSnippet,
    propertyParsingSnippet,
    mapParsingSnippet
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}