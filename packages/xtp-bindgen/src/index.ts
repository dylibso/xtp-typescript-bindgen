import { parseAndNormalizeJson } from "./normalizer";

export function parse(schema: string) {
  return parseAndNormalizeJson(schema)
}
